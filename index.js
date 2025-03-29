// =============================================================
// PART 1: LIBRARIES & BASIC CONFIGURATION
// =============================================================
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");
const os = require("os");
const chokidar = require("chokidar");

let config = require("./config.json");

const bot = new TelegramBot(config.token, { polling: true });

if (process.env.npm_lifecycle_event === "start") {
  console.log("[INFO] Process started via npm start");
}

// =============================================================
// PART 2: GLOBAL VARIABLES, PATHS, LANGUAGE & AUTO-SCOOLD SETTINGS
// =============================================================
const modulesPath = path.join(__dirname, "modules");
const idFilePath = path.join(modulesPath, "id.json");
const ttFilePath = path.join(modulesPath, "tt.json");
const commands = new Map();

const languageDict = {
  en: {
    welcome: "Welcome to our bot!",
    reloadNotification: "All commands have been loaded, please admin check via VPS.☺️"
  },
  vi: {
    welcome: "Chào mừng bạn đến với bot của chúng tôi!",
    reloadNotification: "Tất cả các lệnh đã được load, vui lòng admin kiểm tra qua VPS.☺️"
  }
};
const lang = languageDict[config.language] || languageDict.en;

const autoScoldKeywords = ["bot ngu", "đồ ngu", "bot dở", "bot thối", "chửi bot", "bot xấu", "bot kém", "bot chán"];
const autoScoldResponses = [
  "Đừng có chửi tui, tao cũng biết mình chưa hoàn hảo!",
  "Bỏ lời chửi đó đi, hãy nói vấn đề của bạn ra thay vì chỉ chửi nhau!",
  "Chửi bot chẳng giúp gì, hãy góp ý xây dựng đi!",
  "Tui không cần nghe lời chửi, hãy cải thiện cách giao tiếp của bạn!",
  "Đừng chửi, hãy bàn luận thật sự để giải quyết vấn đề!"
];

// =============================================================
// PART 3: LOGGING UTILITY (WITH TIMESTAMP)
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
// PART 4: COMMAND MANAGEMENT – LOAD BUILT-IN & EXTERNAL COMMANDS
// =============================================================
function loadCommands() {
  commands.clear();
  loadBuiltInCommands();
  if (fs.existsSync(modulesPath)) {
    fs.readdirSync(modulesPath).forEach(file => {
      if (file.endsWith(".js")) {
        try {
          const commandPath = path.join(modulesPath, file);
          const command = require(commandPath);
          if (!command.name) {
            logWarn(`Module ${file} does not export 'name'; skipping.`);
            return;
          }
          commands.set(command.name.toLowerCase(), command);
          logInfo(`Loaded external command: ${command.name}` + (command.description ? ` – ${command.description}` : ""));
        } catch (error) {
          logError(`Failed to load external command ${file}:`, error);
        }
      }
    });
  }
}
loadCommands();

// Built-in commands
function loadBuiltInCommands() {
  // /start: Chào mừng (chỉ ở chat private)
  commands.set("start", {
    name: "start",
    description: "Display welcome message in private chats",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      if (msg.chat.type === "private") {
        await bot.sendMessage(msg.chat.id, lang.welcome);
      }
    }
  });
  // /ping: Phản hồi "pong"
  commands.set("ping", {
    name: "ping",
    description: "Reply with pong",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      await bot.sendMessage(msg.chat.id, "pong");
    }
  });
  // /sysinfo: Thông tin hệ thống
  commands.set("sysinfo", {
    name: "sysinfo",
    description: "Display system information",
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
  // /time: Hiển thị thời gian hiện tại của server
  commands.set("time", {
    name: "time",
    description: "Display current server time",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      const now = new Date();
      await bot.sendMessage(msg.chat.id, `Current server time is: ${now.toLocaleString()}`);
    }
  });
  // /uptime: Thời gian chạy của bot
  commands.set("uptime", {
    name: "uptime",
    description: "Display process uptime",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      await bot.sendMessage(msg.chat.id, `Process uptime: ${Math.floor(process.uptime())} seconds`);
    }
  });
  // /stats: Thông tin sử dụng tài nguyên
  commands.set("stats", {
    name: "stats",
    description: "Display resource usage statistics",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      const memUsage = process.memoryUsage();
      const rss = (memUsage.rss / (1024 ** 2)).toFixed(2);
      const heapTotal = (memUsage.heapTotal / (1024 ** 2)).toFixed(2);
      const heapUsed = (memUsage.heapUsed / (1024 ** 2)).toFixed(2);
      const stats = `Resource Usage:
RSS: ${rss} MB
Heap Total: ${heapTotal} MB
Heap Used: ${heapUsed} MB`;
      await bot.sendMessage(msg.chat.id, stats);
    }
  });
  // /list: Liệt kê các lệnh đã load
  commands.set("list", {
    name: "list",
    description: "List all loaded commands",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      let listText = "Loaded Commands:\n";
      commands.forEach((cmd, key) => {
        listText += `/${key}`;
        if (cmd.description) listText += ` - ${cmd.description}`;
        listText += "\n";
      });
      await bot.sendMessage(msg.chat.id, listText);
    }
  });
  // /echo: Phản hồi lại nội dung người dùng nhập
  commands.set("echo", {
    name: "echo",
    description: "Echo back your input",
    args: true,
    usage: "<text>",
    execute: async (bot, msg, args) => {
      const text = args.join(" ");
      await bot.sendMessage(msg.chat.id, `Echo: ${text}`);
    }
  });
  // /help: Liệt kê các lệnh có sẵn
  commands.set("help", {
    name: "help",
    description: "List available commands with descriptions",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      let helpText = "Available Commands:\n";
      commands.forEach((cmd, key) => {
        helpText += `/${key}`;
        if (cmd.description) helpText += ` - ${cmd.description}`;
        helpText += "\n";
      });
      await bot.sendMessage(msg.chat.id, helpText);
    }
  });
  // /debug: Hiển thị thông tin debug
  commands.set("debug", {
    name: "debug",
    description: "Display debug information",
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
  // /config: (Admin-only) Hiển thị cấu hình hiện tại
  commands.set("config", {
    name: "config",
    description: "Display current configuration (admin-only)",
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
  // /reload: (Admin-only) Reload tất cả các lệnh và thông báo cho admin
  commands.set("reload", {
    name: "reload",
    description: "Reload all commands (admin-only)",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      if (!config.adminChatId || msg.from.id !== config.adminChatId) {
        await bot.sendMessage(msg.chat.id, "❗ You are not authorized to use this command.");
        return;
      }
      loadCommands();
      await bot.sendMessage(msg.chat.id, lang.reloadNotification);
    }
  });
  // /broadcast: (Admin-only) Gửi tin nhắn đến tất cả các chat đã lưu
  commands.set("broadcast", {
    name: "broadcast",
    description: "Broadcast a message to all chats (admin-only)",
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
  // /interactions: Hiển thị số lượng tương tác từ tt.json
  commands.set("interactions", {
    name: "interactions",
    description: "Display total interaction count and details",
    args: false,
    usage: "",
    execute: async (bot, msg, args) => {
      const data = loadInteractions();
      const total = Object.values(data).reduce((acc, cur) => acc + cur, 0);
      let details = "Interaction Details:\n";
      for (const chatId in data) {
        details += `Chat ${chatId}: ${data[chatId]} interactions\n`;
      }
      await bot.sendMessage(msg.chat.id, `Total interactions: ${total}\n${details}`);
    }
  });
  // /os: (Admin-only) Thực hiện lệnh hệ điều hành (ví dụ: ls, pwd, uptime,...)
  commands.set("os", {
    name: "os",
    description: "Execute OS command (admin-only)",
    args: true,
    usage: "<command>",
    execute: async (bot, msg, args) => {
      if (!config.adminChatId || msg.from.id !== config.adminChatId) {
        await bot.sendMessage(msg.chat.id, "❗ You are not authorized to use this command.");
        return;
      }
      const { exec } = require("child_process");
      const osCmd = args.join(" ");
      exec(osCmd, (error, stdout, stderr) => {
        if (error) {
          bot.sendMessage(msg.chat.id, `Error: ${error.message}`);
          return;
        }
        if (stderr) {
          bot.sendMessage(msg.chat.id, `Stderr: ${stderr}`);
          return;
        }
        bot.sendMessage(msg.chat.id, `Output:\n${stdout}`);
      });
    }
  });
}

// =============================================================
// PART 5F: HELPER FUNCTION – LOAD INTERACTION DATA (tt.json)
// =============================================================
function loadInteractions() {
  let interactions = {};
  try {
    if (fs.existsSync(ttFilePath)) {
      interactions = JSON.parse(fs.readFileSync(ttFilePath, "utf8"));
    }
  } catch (error) {
    logError("Error reading tt.json:", error);
  }
  return interactions;
}

// =============================================================
// PART 5G: HELPER FUNCTION – UPDATE INTERACTION DATA (tt.json)
// =============================================================
function updateInteraction(chatId) {
  let interactions = {};
  try {
    if (fs.existsSync(ttFilePath)) {
      interactions = JSON.parse(fs.readFileSync(ttFilePath, "utf8"));
    }
  } catch (error) {
    logError("Error reading tt.json:", error);
  }
  interactions[chatId] = (interactions[chatId] || 0) + 1;
  try {
    fs.writeFileSync(ttFilePath, JSON.stringify(interactions, null, 2), "utf8");
  } catch (error) {
    logError("Error writing tt.json:", error);
  }
}

// =============================================================
// PART 5H: HELPER FUNCTION – GET IP ADDRESS
// =============================================================
function getIPAddress() {
  const ifaces = Object.values(os.networkInterfaces())
    .flat()
    .filter(iface => iface.family === "IPv4" && !iface.internal);
  return ifaces.length > 0 ? ifaces[0].address : "Unknown";
}

// =============================================================
// PART 6: SAVE CHAT IDS & UPDATE INTERACTIONS
// =============================================================
function saveChatIdAndInteraction(chatId) {
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
  updateInteraction(chatId);
}

// =============================================================
// PART 7I: COMMAND PARSING – SUPPORT /command@botusername
// =============================================================
function parseCommand(cmdText, prefix) {
  return cmdText.slice(prefix.length).split("@")[0];
}

// =============================================================
// PART 7J: MESSAGE HANDLING & COMMAND EXECUTION (INCLUDING AUTO-SCOOLD)
// =============================================================
bot.on("message", async (msg) => {
  if (!msg.text) return;
  const chatId = msg.chat.id;

  saveChatIdAndInteraction(chatId);

  const lowerText = msg.text.toLowerCase();
  const scoldTrigger = autoScoldKeywords.some(keyword => lowerText.includes(keyword));
  if (scoldTrigger) {
    const response = autoScoldResponses[Math.floor(Math.random() * autoScoldResponses.length)];
    await bot.sendMessage(chatId, response);
    return;
  }

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
// PART 8: AUTO-RELOAD BASED ON MEMORY USAGE (CHECK EVERY SECOND)
// =============================================================
setInterval(() => {
  const memUsage = process.memoryUsage();
  if (memUsage.rss > 100 * 1024 * 1024) {
    logInfo("High memory usage detected; reloading bot to optimize resource usage...");
    process.exit(1);
  }
}, 1000);

// =============================================================
// PART 9: CONFIG & MODULE WATCHER – AUTO-RESTART/HOT RELOAD
// =============================================================
function setupWatchers() {
  chokidar.watch("./config.json", { ignoreInitial: true })
    .on("all", (event, filePath) => {
      logInfo(`Config file event (${event}) detected on ${filePath}. Restarting bot...`);
      process.exit(1);
    });
  chokidar.watch(modulesPath, { ignoreInitial: true, ignored: file => file.endsWith(".json") })
    .on("all", (event, filePath) => {
      logInfo(`Module folder event (${event}) detected on file: ${filePath}. Reloading commands...`);
      loadCommands();
      if (config.adminChatId) {
        bot.sendMessage(config.adminChatId, `Module change detected (${event}) on file: ${path.basename(filePath)}. Commands reloaded.`)
          .catch(err => logError("Failed to notify admin about module change:", err));
      }
    });
}
setupWatchers();

// =============================================================
// PART 10: RESOURCE MONITOR – LOG MEMORY USAGE PERIODICALLY
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
// PART 11: GLOBAL ERROR HANDLING & STARTUP SYSTEM INFO
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
// PART 12: BROADCAST HELPER FOR /BROADCAST COMMAND
// =============================================================
function broadcastMessage(message) {
  let chatIds = [];
  try {
    if (fs.existsSync(idFilePath)) {
      chatIds = JSON.parse(fs.readFileSync(idFilePath, "utf8"));
    }
  } catch (error) {
    logError("Error reading id.json during broadcast:", error);
  }
  chatIds.forEach(chatId => {
    bot.sendMessage(chatId, message)
      .then(() => logInfo(`Broadcast message sent to chat ${chatId}`))
      .catch(err => logError(`Failed to send broadcast message to chat ${chatId}:`, err));
  });
}

// =============================================================
// PART 13: STARTUP NOTIFICATION
// =============================================================
logInfo("Bot startup complete.");
