// =============================================================
// PART 1: Libraries & Basic Configuration
// =============================================================
const TelegramBot = require("node-telegram-bot-api"); // Telegram Bot API (polling nhận tin mới)
const fs = require("fs");                              // File system operations
const path = require("path");                          // Path utilities
const os = require("os");                              // System information
const chokidar = require("chokidar");                  // File watcher (cho config và reload)
  
// Load configuration từ config.json
let config = require("./config.json");
  
// Khởi tạo bot với polling (chỉ nhận tin mới)
const bot = new TelegramBot(config.token, { polling: true });
  
// =============================================================
// PART 2: Global Variables & Paths
// =============================================================
const modulesPath = path.join(__dirname, "modules");   // Thư mục chứa các module lệnh
const idFilePath = path.join(modulesPath, "id.json");    // File lưu chat IDs
const commands = new Map();                            // Map chứa các lệnh (key: command name)
  
// =============================================================
// PART 3: Logging Utility Functions (with Timestamp)
// =============================================================
function logInfo(message) {
  console.log(`[INFO] [${new Date().toLocaleString()}] ${message}`);
}
function logWarn(message) {
  console.warn(`[WARN] [${new Date().toLocaleString()}] ${message}`);
}
function logError(message, error) {
  console.error(`[ERROR] [${new Date().toLocaleString()}] ${message}`, error);
}
  
// =============================================================
// PART 4: Command Management – Load Built-in & External Commands (Load 1 lần)
// =============================================================
function loadCommands() {
  commands.clear();
  loadBuiltInCommands();
  // Nếu thư mục modules tồn tại, load tất cả các file .js bên ngoài
  if (fs.existsSync(modulesPath)) {
    fs.readdirSync(modulesPath).forEach(file => {
      if (file.endsWith(".js")) {
        try {
          const commandPath = path.join(modulesPath, file);
          const command = require(commandPath);
          if (!command.name) {
            logWarn(`Module ${file} không có thuộc tính 'name' và sẽ bị bỏ qua.`);
            return;
          }
          commands.set(command.name.toLowerCase(), command);
          logInfo(`Loaded external command: ${command.name}` +
                  (command.description ? ` – ${command.description}` : ""));
        } catch (error) {
          logError(`Failed to load external command ${file}:`, error);
        }
      }
    });
  }
}
loadCommands();
  
// Built-in Commands tích hợp trực tiếp
function loadBuiltInCommands() {
  // /start: Gửi lời chào mừng khi nhận từ chat private
  commands.set("start", {
    name: "start",
    description: "Chào mừng người dùng (chỉ áp dụng cho chat riêng)",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      if (msg.chat.type === "private") {
        await bot.sendMessage(msg.chat.id, "Chào mừng bạn đến với bot của chúng tôi!");
      }
    }
  });
  // /ping: Phản hồi "pong"
  commands.set("ping", {
    name: "ping",
    description: "Trả lời pong",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      await bot.sendMessage(msg.chat.id, "pong");
    }
  });
  // /sysinfo: Hiển thị thông tin hệ thống
  commands.set("sysinfo", {
    name: "sysinfo",
    description: "Hiển thị thông tin hệ thống của bot",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      const uptime = process.uptime();
      const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
      const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2);
      const info = `System Information:
Uptime: ${Math.floor(uptime)} seconds
Total Memory: ${totalMem} GB
Free Memory: ${freeMem} GB
OS: ${os.platform()} ${os.release()}
IP: ${getIPAddress()}`;
      await bot.sendMessage(msg.chat.id, info);
    }
  });
  // /broadcast: (Admin-only) Gửi tin nhắn đến tất cả các chat đã lưu
  commands.set("broadcast", {
    name: "broadcast",
    description: "Gửi tin nhắn đến tất cả các chat (admin-only)",
    args: true,
    usage: "<message>",
    execute: async (bot, msg, args) => {
      if (!config.adminChatId || msg.from.id !== config.adminChatId) {
        await bot.sendMessage(msg.chat.id, "❗ You are not authorized to use this command.");
        return;
      }
      const message = args.join(" ");
      broadcastMessage(message);
    }
  });
  // /reload: (Admin-only) Reload lại các lệnh
  commands.set("reload", {
    name: "reload",
    description: "Reload lại tất cả các lệnh (admin-only)",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      if (!config.adminChatId || msg.from.id !== config.adminChatId) {
        await bot.sendMessage(msg.chat.id, "❗ You are not authorized to use this command.");
        return;
      }
      loadCommands();
      await bot.sendMessage(msg.chat.id, "Commands reloaded.");
    }
  });
  // /config: (Admin-only) Hiển thị cấu hình hiện tại
  commands.set("config", {
    name: "config",
    description: "Hiển thị cấu hình hiện tại (admin-only)",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      if (!config.adminChatId || msg.from.id !== config.adminChatId) {
        await bot.sendMessage(msg.chat.id, "❗ You are not authorized to use this command.");
        return;
      }
      await bot.sendMessage(msg.chat.id, `Current Configuration:\n${JSON.stringify(config, null, 2)}`);
    }
  });
  // /debug: Hiển thị thông tin debug
  commands.set("debug", {
    name: "debug",
    description: "Hiển thị thông tin debug của bot",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      let debugInfo = "Loaded Commands:\n";
      commands.forEach((_, key) => { debugInfo += `/${key}\n`; });
      debugInfo += `Process Uptime: ${Math.floor(process.uptime())} seconds\n`;
      debugInfo += `Memory Usage: ${JSON.stringify(process.memoryUsage())}\n`;
      await bot.sendMessage(msg.chat.id, debugInfo);
    }
  });
  // /echo: Phản hồi lại nội dung người dùng nhập
  commands.set("echo", {
    name: "echo",
    description: "Phản hồi lại nội dung bạn nhập vào",
    args: true,
    usage: "<text>",
    execute: async (bot, msg, args) => {
      const text = args.join(" ");
      await bot.sendMessage(msg.chat.id, `Echo: ${text}`);
    }
  });
  // /help: Liệt kê tất cả các lệnh và mô tả (nếu có)
  commands.set("help", {
    name: "help",
    description: "Hiển thị danh sách các lệnh và mô tả",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      let helpText = "Available Commands:\n";
      commands.forEach((cmd, key) => {
        helpText += `/${key}`;
        if (cmd.description) {
          helpText += ` - ${cmd.description}`;
        }
        helpText += "\n";
      });
      await bot.sendMessage(msg.chat.id, helpText);
    }
  });
}
  
// =============================================================
// PART 5A: Helper Function – Get IP Address
// =============================================================
function getIPAddress() {
  const ifaces = Object.values(os.networkInterfaces())
    .flat()
    .filter(iface => iface.family === "IPv4" && !iface.internal);
  return ifaces.length > 0 ? ifaces[0].address : "Unknown";
}
  
// =============================================================
// PART 6: Save Chat IDs (id.json)
// =============================================================
function saveChatId(chatId) {
  let chatIds = [];
  try {
    if (fs.existsSync(idFilePath)) {
      chatIds = JSON.parse(fs.readFileSync(idFilePath, "utf8"));
    }
  } catch (error) {
    logError("Error reading id.json:", error);
  }
  if (!chatIds.includes(chatId)) {
    chatIds.push(chatId);
    fs.writeFileSync(idFilePath, JSON.stringify(chatIds, null, 2), "utf8");
    logInfo(`Saved chat ID: ${chatId}`);
  }
}
  
// =============================================================
// PART 7A: Command Parsing – Hỗ trợ /command@botusername
// =============================================================
function parseCommand(cmdText, prefix) {
  return cmdText.slice(prefix.length).split("@")[0];
}
  
// =============================================================
// PART 8: Message Handling & Command Execution
// =============================================================
bot.on("message", async (msg) => {
  if (!msg.text) return;
  const chatId = msg.chat.id;
  saveChatId(chatId);
  const prefix = config.prefix || '/';
  if (!msg.text.trim().startsWith(prefix)) return;
  
  const commandTexts = msg.text.split(",").map(text => text.trim());
  for (const text of commandTexts) {
    const args = text.split(/\s+/);
    const rawCmd = args.shift().toLowerCase();
    if (!rawCmd.startsWith(prefix)) continue;
    const cmdName = parseCommand(rawCmd, prefix);
    if (commands.has(cmdName)) {
      const command = commands.get(cmdName);
      if (command.args && args.length === 0) {
        await bot.sendMessage(chatId, `❗ Please provide arguments for /${cmdName}. Usage: ${prefix}${cmdName} ${command.usage || ""}`);
        continue;
      }
      try {
        await command.execute(bot, msg, args);
        logInfo(`Executed command "${cmdName}" for chat ${chatId}`);
      } catch (error) {
        logError(`Failed to execute command "${cmdName}":`, error);
      }
    } else {
      logWarn(`Command "${cmdName}" not found.`);
    }
  }
});
  
// =============================================================
// PART 9: Auto-Reload Based on Memory Usage (Check Every Second)
// =============================================================
setInterval(() => {
  const memUsage = process.memoryUsage();
  if (memUsage.rss > 100 * 1024 * 1024) {
    logInfo("High memory usage detected; reloading bot to optimize resource usage...");
    process.exit(1);
  }
}, 1000);
  
// =============================================================
// PART 10: Scheduled Tasks – Hourly Message Broadcast
// =============================================================
function broadcastScheduledMessage(text) {
  let chatIds = [];
  try {
    if (fs.existsSync(idFilePath)) {
      chatIds = JSON.parse(fs.readFileSync(idFilePath, "utf8"));
    }
  } catch (error) {
    logError("Error reading id.json during scheduled message:", error);
  }
  chatIds.forEach(chatId => {
    bot.sendMessage(chatId, text)
      .then(() => logInfo(`Scheduled message sent to chat ${chatId}`))
      .catch(err => logError(`Failed to send scheduled message to chat ${chatId}:`, err));
  });
}
  
function checkTimeAndSendMessage() {
  const now = new Date();
  const hour = now.getHours();
  let message = "";
  if (hour === 7) {
    message = "🌞 Good morning! Start your day with positive energy!";
  } else if (hour === 12) {
    message = "💤 It's 12 PM, take a break to recharge!";
  } else if (hour === 18) {
    message = "🌇 Good evening! Hope your night is relaxing!";
  } else if (hour === 0) {
    message = "🌙 It's midnight, time to sleep for a fresh start tomorrow!";
  } else {
    message = `🕰️ It's currently ${hour}:00. Make the most of your time!`;
  }
  broadcastScheduledMessage(message);
}
setInterval(checkTimeAndSendMessage, 60 * 60 * 1000);
checkTimeAndSendMessage();
  
// =============================================================
// PART 11: Config Watcher – Auto-Reload Configuration
// =============================================================
chokidar.watch("./config.json", { ignoreInitial: true })
  .on("change", () => {
    try {
      delete require.cache[require.resolve("./config.json")];
      config = require("./config.json");
      logInfo("Configuration reloaded from config.json.");
    } catch (error) {
      logError("Failed to reload configuration:", error);
    }
  });
  
// =============================================================
// PART 12: Resource Monitor – Log Memory Usage Periodically
// =============================================================
function logResourceUsage() {
  const memUsage = process.memoryUsage();
  const rss = (memUsage.rss / (1024 ** 2)).toFixed(2);
  const heapTotal = (memUsage.heapTotal / (1024 ** 2)).toFixed(2);
  const heapUsed = (memUsage.heapUsed / (1024 ** 2)).toFixed(2);
  logInfo(`Resource Usage: RSS: ${rss} MB, Heap Total: ${heapTotal} MB, Heap Used: ${heapUsed} MB`);
}
setInterval(logResourceUsage, 5 * 60 * 1000);
  
// =============================================================
// PART 13: Global Error Handling & Startup System Info
// =============================================================
process.on("uncaughtException", error => {
  logError("Uncaught Exception:", error);
});
process.on("unhandledRejection", (reason, promise) => {
  logError("Unhandled Rejection:", reason);
});
console.log("=================================");
console.log("[INFO] Telegram Bot is running...");
console.log(`[INFO] OS: ${os.platform()} ${os.release()}`);
console.log(`[INFO] Total RAM: ${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`);
const netIfaces = Object.values(os.networkInterfaces()).flat().filter(iface => iface.family === "IPv4" && !iface.internal);
const ipAddr = netIfaces.length > 0 ? netIfaces[0].address : "Unknown";
console.log(`[INFO] IP Address: ${ipAddr}`);
console.log("=================================");
  
// =============================================================
// PART 14: Start the Bot Immediately (No Login Required)
// =============================================================
logInfo("Bot startup complete.");
