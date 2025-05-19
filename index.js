require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const os = require('os');
const path = require('path');
const chokidar = require('chokidar');
const express = require('express');
const chalk = require('chalk');
const { debounce } = require('lodash');

// --- Biến môi trường ---
const {
  BOT_TOKEN: token,
  USER_AGENT: userAgent,
  OWNER_ID: ownerID,
  AUTO_RELOAD = 'false',
  ENABLE_TERMINAL_LOG = 'false',
  ADMIN_IDS = '',
  ENABLE_PRIVATE_REPORT = 'false',
  PRIVATE_REPORT_CHAT_ID = '',
  LOG_REPORTS = 'false',
  LOGIN_USERNAME = '',
  LOGIN_PASSWORD = '',
  ADMIN_CHAT_ID = '',
  LANGUAGE = 'en'
} = process.env;

const autoReload = AUTO_RELOAD === 'true';
const enableTerminalLog = ENABLE_TERMINAL_LOG === 'true';
const adminIds = ADMIN_IDS ? ADMIN_IDS.split(',') : [];
const enablePrivateReport = ENABLE_PRIVATE_REPORT === 'true';
const logReports = LOG_REPORTS === 'true';

if (!token) {
  console.error(chalk.red('[FATAL] BOT_TOKEN chưa được thiết lập!'));
  process.exit(1);
}

// --- Khởi tạo bot với polling tối ưu ---
const bot = new TelegramBot(token, {
  polling: {
    interval: 300,         // Kiểm tra mỗi 300ms
    autoStart: true,
    params: {
      timeout: 10          // Timeout 10s cho mỗi lần long-polling
    }
  }
});

const commands = new Map();
const listeners = new Map();
const commandDir = path.join(__dirname, 'modules');

// --- Express server (cổng 8080) ---
const app = express();
const port = 8080;
app.get('/', (_req, res) => res.send('Telegram bot is running!'));
app.listen(port, () => {
  console.log(chalk.blue(`Server is running on port ${port}`));
});

// --- Hỗ trợ xóa listener cũ ---
bot.removeTextListener = function (regexp) {
  const idx = bot._textRegexpCallbacks.findIndex(t => t.regexp.toString() === regexp.toString());
  if (idx !== -1) bot._textRegexpCallbacks.splice(idx, 1);
};

// --- Lấy IP ---
function getIPAddress() {
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'Không xác định';
}

// --- Load lệnh ---
function loadCommands() {
  const files = fs.readdirSync(commandDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const cmdPath = path.join(commandDir, file);
      const cmd = require(cmdPath);
      if (!cmd.name || !cmd.execute) continue;

      commands.set(cmd.name, cmd);
      const regex = new RegExp(`^/${cmd.name}(\\s+(.+))?`);
      listeners.set(cmd.name, regex);

      bot.onText(regex, async (msg, match) => {
        const args = match[2] ? match[2].split(/\s+/) : [];
        if (cmd.args && args.length === 0) {
          return bot.sendMessage(msg.chat.id, `Usage: ${cmd.usage}`);
        }
        try {
          await cmd.execute(bot, msg, args);
        } catch (err) {
          console.error(chalk.red(`[ERROR] Lỗi khi exec ${cmd.name}:`), err);
          bot.sendMessage(msg.chat.id, 'Có lỗi xảy ra khi xử lý lệnh này.');
        }
      });

      console.log(chalk.green(`[LOAD] Command: ${cmd.name}`));
    } catch (err) {
      console.error(chalk.red(`[ERROR] Không thể load ${file}:`), err);
    }
  }
}

// --- Watch & reload commands (debounced) ---
function watchCommands() {
  if (!autoReload) return;
  const watcher = chokidar.watch(commandDir, { ignoreInitial: true, usePolling: false });
  const reload = debounce(filePath => {
    const name = path.basename(filePath, '.js');
    console.log(chalk.yellow(`[RELOAD] Reloading command: ${name}`));
    try {
      const full = require.resolve(path.join(commandDir, `${name}.js`));
      delete require.cache[full];
      const newCmd = require(full);
      if (!newCmd.name || !newCmd.execute) return;
      // Remove old listener
      if (listeners.has(newCmd.name)) {
        bot.removeTextListener(listeners.get(newCmd.name));
      }
      // Register new
      const regex = new RegExp(`^/${newCmd.name}(\\s+(.+))?`);
      listeners.set(newCmd.name, regex);
      bot.onText(regex, newCmd.execute.bind(null, bot));
      commands.set(newCmd.name, newCmd);
      console.log(chalk.green(`[RELOAD] Command reloaded: ${newCmd.name}`));
    } catch (err) {
      console.error(chalk.red(`[ERROR] Reload failed for ${name}:`), err);
    }
  }, 500);

  watcher.on('change', reload).on('add', reload).on('unlink', filePath => {
    const name = path.basename(filePath, '.js');
    commands.delete(name);
    console.log(chalk.yellow(`[UNLOAD] Command removed: ${name}`));
  });
}

// --- Giám sát CPU & RAM ---
function monitorResources() {
  setInterval(() => {
    const mem = process.memoryUsage();
    const mb = bytes => (bytes / 1024 / 1024).toFixed(2);
    const load = os.loadavg()[0].toFixed(2);
    console.log(chalk.cyan(`[RES] RSS: ${mb(mem.rss)} MB | HeapUsed: ${mb(mem.heapUsed)} MB | LoadAvg: ${load}`));
    // Nếu dùng --expose-gc
    if (global.gc && mem.heapUsed / mem.heapTotal > 0.8) {
      console.log(chalk.magenta('[GC] Triggering garbage collection'));
      global.gc();
    }
  }, 60000); // mỗi 60s
}

// --- Startup info ---
function showStartupInfo() {
  console.log(chalk.blue('================================='));
  console.log(chalk.green('[INFO] Telegram Bot is running...'));
  console.log(chalk.green(`[INFO] OS: ${os.type()} ${os.release()}`));
  console.log(chalk.green(`[INFO] Total RAM: ${(os.totalmem()/1024/1024/1024).toFixed(2)} GB`));
  console.log(chalk.green(`[INFO] IP Address: ${getIPAddress()}`));
  console.log(chalk.blue('================================='));
}

// --- Bắt exception & rejection ---
process.on('uncaughtException', err => {
  console.error(chalk.red('[FATAL] Uncaught Exception:'), err);
  process.exit(1);
});
process.on('unhandledRejection', err => {
  console.error(chalk.red('[FATAL] Unhandled Rejection:'), err);
  process.exit(1);
});

// --- Chạy tất cả ---
loadCommands();
watchCommands();
showStartupInfo();
monitorResources();
