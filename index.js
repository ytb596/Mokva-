require('dotenv').config(); // Nạp biến môi trường từ file .env
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const os = require('os');
const path = require('path');
const chokidar = require('chokidar');
const express = require('express');

// Lấy các biến môi trường
const token = process.env.BOT_TOKEN;
const userAgent = process.env.USER_AGENT;
const ownerID = process.env.OWNER_ID;
const autoReload = process.env.AUTO_RELOAD === 'true'; // Chuyển đổi thành boolean
const enableTerminalLog = process.env.ENABLE_TERMINAL_LOG === 'true'; // Chuyển đổi thành boolean
const adminIds = process.env.ADMIN_IDS.split(','); // Chuyển thành array
const enablePrivateReport = process.env.ENABLE_PRIVATE_REPORT === 'true'; // Boolean
const privateReportChatId = process.env.PRIVATE_REPORT_CHAT_ID;
const logReports = process.env.LOG_REPORTS === 'true'; // Boolean
const loginUsername = process.env.LOGIN_USERNAME;
const loginPassword = process.env.LOGIN_PASSWORD;
const adminChatId = process.env.ADMIN_CHAT_ID;
const language = process.env.LANGUAGE;

if (!token) {
  console.error('[FATAL] BOT_TOKEN chưa được thiết lập trong biến môi trường!');
  process.exit(1);
}

// Tạo instance Telegram bot
const bot = new TelegramBot(token, { polling: true });
const commands = new Map();
const listeners = new Map();
const commandDir = path.join(__dirname, 'modules');

// Khởi tạo server express để chạy trên cổng 8080
const app = express();
const port = 8080;

// Để đáp ứng yêu cầu Render, bạn cần phải có một route bất kỳ, ví dụ như:
app.get('/', (req, res) => {
  res.send('Telegram bot is running!');
});

// Lắng nghe trên cổng 8080
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Thêm khả năng xóa listener cũ
bot.removeTextListener = function (regex) {
  const index = bot._textRegexpCallbacks.findIndex(t => t.regexp.toString() === regex.toString());
  if (index !== -1) {
    bot._textRegexpCallbacks.splice(index, 1);
  }
};

// Lấy IP
function getIPAddress() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'Không xác định';
}

// Load lệnh ban đầu
function loadCommands() {
  const files = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));
  for (const file of files) {
    const filePath = path.join(commandDir, file);
    try {
      const command = require(filePath);
      if (!command.name || !command.execute) continue;

      commands.set(command.name, command);
      const desc = command.description ? `– ${command.description}` : '';
      console.log(`[INFO] [${new Date().toLocaleString()}] Loaded external command: ${command.name} ${desc}`);

      const regex = new RegExp(`^/${command.name}(\\s+(.+))?`);
      listeners.set(command.name, regex);

      bot.onText(regex, async (msg, match) => {
        const args = match[2] ? match[2].split(/\s+/) : [];
        if (command.args && args.length === 0) {
          return bot.sendMessage(msg.chat.id, `Usage: ${command.usage}`);
        }

        try {
          await command.execute(bot, msg, args);
        } catch (err) {
          console.error(`[ERROR] Lỗi khi thực thi lệnh ${command.name}:`, err);
          bot.sendMessage(msg.chat.id, 'Có lỗi xảy ra khi xử lý lệnh này.');
        }
      });

    } catch (err) {
      console.error(`[ERROR] Không thể load lệnh ${file}:`, err);
    }
  }
}

// Tự động reload khi file thay đổi
function watchCommands() {
  chokidar.watch(commandDir).on('change', filePath => {
    const fileName = path.basename(filePath, '.js');
    console.log(`[INFO] [${new Date().toLocaleString()}] Đang reload lệnh: ${fileName}`);

    const resolvedPath = require.resolve(filePath);
    delete require.cache[resolvedPath];

    try {
      const updatedCommand = require(resolvedPath);
      if (updatedCommand.name && updatedCommand.execute) {
        commands.set(updatedCommand.name, updatedCommand);

        // Hủy listener cũ nếu có
        if (listeners.has(updatedCommand.name)) {
          const oldRegex = listeners.get(updatedCommand.name);
          bot.removeTextListener(oldRegex);
        }

        const regex = new RegExp(`^/${updatedCommand.name}(\\s+(.+))?`);
        listeners.set(updatedCommand.name, regex);

        bot.onText(regex, async (msg, match) => {
          const args = match[2] ? match[2].split(/\s+/) : [];
          if (updatedCommand.args && args.length === 0) {
            return bot.sendMessage(msg.chat.id, `Usage: ${updatedCommand.usage}`);
          }

          try {
            await updatedCommand.execute(bot, msg, args);
          } catch (err) {
            console.error(`[ERROR] Lỗi khi thực thi lệnh ${updatedCommand.name}:`, err);
            bot.sendMessage(msg.chat.id, 'Có lỗi xảy ra khi xử lý lệnh này.');
          }
        });

        console.log(`[INFO] [${new Date().toLocaleString()}] Reloaded command: ${updatedCommand.name}`);
      }
    } catch (err) {
      console.error(`[ERROR] Không thể reload lệnh ${fileName}:`, err);
    }
  });
}

// Hiển thị thông tin khi khởi động bot
function showStartupInfo() {
  console.log("=================================");
  console.log("[INFO] Telegram Bot is running...");
  console.log(`[INFO] OS: ${os.type().toLowerCase()} ${os.release()}`);
  console.log(`[INFO] Total RAM: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`[INFO] IP Address: ${getIPAddress()}`);
  console.log("=================================");
  console.log(`[INFO] [${new Date().toLocaleString()}] Bot startup complete.`);
}

// Chạy
loadCommands();
watchCommands();
showStartupInfo();
