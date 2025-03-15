// =============================================================
// PHẦN 1: NHẬP CÁC THƯ VIỆN CẦN THIẾT
// =============================================================
const TelegramBot = require("node-telegram-bot-api");  // Giao tiếp với Telegram Bot API.
const fs = require("fs");                               // Thao tác với file.
const path = require("path");                           // Xử lý đường dẫn.
const chokidar = require("chokidar");                   // Theo dõi thay đổi file (auto-reload).
const os = require("os");                               // Lấy thông tin hệ thống.
const chalk = require("chalk").default;                         // Tạo màu sắc cho console log.
const banking = require("./modules/banking.js"); // Đường dẫn chính xác đến banking.js

// =============================================================
// PHẦN 2: CẤU HÌNH VÀ KHỞI TẠO BOT
// =============================================================
const config = require("./config.json");               // Đọc cấu hình từ config.json.
const bot = new TelegramBot(config.token, { polling: true }); // Khởi tạo bot với chế độ polling.

// =============================================================
// PHẦN 3: KHỞI TẠO THAM SỐ TOÀN CỤC
// =============================================================
const modulesPath = path.join(__dirname, "modules");    // Thư mục chứa các module lệnh.
const idFilePath = path.join(modulesPath, "id.json");     // File lưu danh sách chat ID.
const commands = new Map();                             // Map lưu các lệnh (key: tên lệnh).
let usageStats = {};                                    // PHẦN 12: Đếm số lần thực thi các lệnh.

// =============================================================
// PHẦN 4: HÀM LOAD VÀ QUẢN LÝ LỆNH (COMMANDS)
// =============================================================
/**
 * loadCommands:
 * - Quét qua các file .js trong thư mục modules.
 * - Mỗi file module cần export các thuộc tính: name, (args - tùy chọn), usage (tùy chọn) và hàm execute.
 * - Lưu các lệnh vào Map commands với key là tên lệnh chuyển về chữ thường.
 */
function loadCommands() {
    commands.clear();
    fs.readdirSync(modulesPath).forEach(file => {
        if (file.endsWith(".js")) {  // Chỉ load file .js
            try {
                const commandPath = path.join(modulesPath, file);
                const command = require(commandPath);
                commands.set(command.name.toLowerCase(), command);
                console.log(chalk.green(`[✅] Tải lệnh: ${command.name}`));
            } catch (error) {
                console.error(chalk.red(`[❌] Lỗi khi tải lệnh ${file}:`), error);
            }
        }
    });
}
loadCommands();

// =============================================================
// PHẦN 5: LƯU TRỮ CHAT ID VÀO TỆP (id.json)
// =============================================================
/**
 * saveChatId:
 * - Đọc file id.json (nếu tồn tại) và chuyển nội dung thành mảng.
 * - Nếu chatId chưa có, thêm vào và ghi lại file.
 *
 * @param {number|string} chatId - ID của cuộc trò chuyện cần lưu.
 */
function saveChatId(chatId) {
    let chatIds = [];
    try {
        if (fs.existsSync(idFilePath)) {
            chatIds = JSON.parse(fs.readFileSync(idFilePath, "utf8"));
        }
    } catch (error) {
        console.error(chalk.red("[❌] Lỗi khi đọc id.json:"), error);
    }
    if (!chatIds.includes(chatId)) {
        chatIds.push(chatId);
        fs.writeFileSync(idFilePath, JSON.stringify(chatIds, null, 2), "utf8");
        console.log(chalk.green(`[💾] Đã lưu ID box: ${chatId}`));
    }
}

// =============================================================
// PHẦN 6: THEO DÕI THAY ĐỔI FILE VỚI CHOKIDAR (AUTO-RELOAD)
// =============================================================
chokidar.watch([modulesPath, __filename], { 
    ignoreInitial: true, 
    ignored: file => file.endsWith(".json")  // Bỏ qua file JSON.
})
.on("add", (filePath) => {
    console.log(chalk.blue(`[➕] Phát hiện file mới: ${filePath}`));
    loadCommands();
})
.on("change", (filePath) => {
    console.log(chalk.blue(`[🔄] File cập nhật: ${filePath}`));
    if (filePath === __filename) {
        console.log(chalk.yellow("[♻️] Đang tải lại toàn bộ bot do file index.js thay đổi..."));
        process.exit(1);
    } else {
        delete require.cache[require.resolve(filePath)];
        loadCommands();
    }
})
.on("unlink", (filePath) => {
    console.log(chalk.blue(`[❌] File bị xóa: ${filePath}`));
    loadCommands();
});

// =============================================================
// PHẦN 7: XỬ LÝ TIN NHẮN VÀ THỰC THI LỆNH
// =============================================================
/**
 * Khi bot nhận được tin nhắn:
 * - Lưu chat ID.
 * - Kiểm tra tin nhắn có bắt đầu bằng tiền tố (prefix) hay không.
 * - Hỗ trợ nhiều lệnh trong 1 tin nhắn (các lệnh cách nhau bằng dấu phẩy).
 * - Nếu lệnh yêu cầu đối số mà không được cung cấp, trả về hướng dẫn sử dụng.
 */
bot.on("message", async (msg) => {
    if (!msg.text) return;
    
    const chatId = msg.chat.id;
    saveChatId(chatId);
    
    const prefix = config.prefix || '/';
    if (!msg.text.trim().startsWith(prefix)) return;
    
    // Tách tin nhắn theo dấu phẩy để hỗ trợ nhiều lệnh.
    let commandTexts = msg.text.split(",").map(text => text.trim());
    
    for (const text of commandTexts) {
        let args = text.split(/\s+/);
        let commandText = args.shift().toLowerCase();
        
        if (!commandText.startsWith(prefix)) continue;
        let cmdName = commandText.slice(prefix.length);
        
        if (commands.has(cmdName)) {
            const command = commands.get(cmdName);
            // Nếu lệnh yêu cầu đối số mà không có, trả về hướng dẫn sử dụng.
            if (command.args && args.length === 0) {
                bot.sendMessage(chatId, `❗ Vui lòng nhập đối số cho lệnh /${cmdName}. Sử dụng: ${prefix}${cmdName} ${command.usage || ""}`);
                continue;
            }
            try {
                await command.execute(bot, msg, args);
                // PHẦN 12: Ghi nhận thống kê lệnh
                usageStats[cmdName] = (usageStats[cmdName] || 0) + 1;
                console.log(chalk.green(`[✅] Thực thi lệnh "${cmdName}" cho chat ${chatId}`));
            } catch (error) {
                console.error(chalk.red(`❌ Lỗi khi chạy lệnh "${cmdName}":`), error);
            }
        } else {
            console.warn(chalk.yellow(`[⚠️] Lệnh "${cmdName}" không tồn tại hoặc chưa được tải.`));
        }
    }
});

// =============================================================
// PHẦN 8: HIỂN THỊ THÔNG TIN HỆ THỐNG TRÊN TERMINAL
// =============================================================
console.log(chalk.cyan("================================="));
console.log(chalk.cyan("[ℹ️] Bot Telegram đang chạy..."));
console.log(chalk.cyan(`[🌍] Hệ điều hành: ${os.platform()} ${os.release()}`));
console.log(chalk.cyan(`[💾] Tổng RAM: ${(os.totalmem() / 1e9).toFixed(2)} GB`));
const networkInterfaces = Object.values(os.networkInterfaces())
    .flat()
    .filter(iface => iface.family === "IPv4" && !iface.internal);
const ipAddress = networkInterfaces.length > 0 ? networkInterfaces[0].address : "Không xác định";
console.log(chalk.cyan(`[🚀] IP của thiết bị: ${ipAddress}`));
console.log(chalk.cyan("================================="));

// =============================================================
// PHẦN 9: TỰ ĐỘNG RELOAD BOT THEO LỊCH TRÌNH
// =============================================================
const RELOAD_INTERVAL = 6 * 60 * 60 * 1000; // 6 giờ
setInterval(() => {
    console.log(chalk.yellow("[♻️] Đang tự động reload bot theo lịch trình..."));
    process.exit(1);
}, RELOAD_INTERVAL);

// =============================================================
// PHẦN 10: CHỨC NĂNG GỬI TIN NHẮN TỰ ĐỘNG THEO LỊCH TRÌNH
// =============================================================
/**
 * sendMessageToAll:
 * - Gửi tin nhắn đến tất cả các chat ID đã lưu trong id.json.
 */
function sendMessageToAll(text) {
    let chatIds = [];
    try {
        if (fs.existsSync(idFilePath)) {
            chatIds = JSON.parse(fs.readFileSync(idFilePath, "utf8"));
        }
    } catch (error) {
        console.error(chalk.red("[❌] Lỗi khi đọc id.json:"), error);
    }
    chatIds.forEach(chatId => {
        bot.sendMessage(chatId, text)
            .then(() => console.log(chalk.green(`[📤] Đã gửi tin nhắn tới chat ${chatId}`)))
            .catch(err => console.error(chalk.red(`[❌] Lỗi gửi tin nhắn tới chat ${chatId}:`), err));
    });
}

/**
 * checkTimeAndSendMessage:
 * - Kiểm tra thời gian hiện tại và gửi tin nhắn tự động theo giờ.
 * - Ví dụ: 7h sáng (chào buổi sáng), 12h trưa (nhắc nghỉ), 18h chiều (chào buổi chiều),
 *   0h đêm (nhắc đi ngủ) và các giờ khác gửi thông báo theo giờ.
 */
function checkTimeAndSendMessage() {
    const now = new Date();
    const hour = now.getHours();
    let message = "";
    
    if (hour === 7) {
        message = "🌞 Chào buổi sáng! Hãy bắt đầu ngày mới với năng lượng tích cực!";
    } else if (hour === 12) {
        message = "💤 Đã 12 giờ trưa, nghỉ ngơi một chút để tái tạo năng lượng!";
    } else if (hour === 18) {
        message = "🌇 Chào buổi chiều! Hy vọng buổi tối của bạn sẽ thật thư giãn!";
    } else if (hour === 0) {
        message = "🌙 Đã 12 giờ đêm, hãy đi ngủ sớm để có một ngày mới tràn đầy sức sống!";
    } else {
        message = `🕰️ Hiện tại là ${hour} giờ. Hãy tận dụng thời gian một cách hiệu quả!`;
    }
    sendMessageToAll(message);
}
setInterval(checkTimeAndSendMessage, 60 * 60 * 1000);
checkTimeAndSendMessage();

// =============================================================
// PHẦN 11: XỬ LÝ LỖI TOÀN CỤC
// =============================================================
process.on("uncaughtException", (error) => {
    console.error(chalk.red("[❌] Lỗi chưa xử lý (uncaughtException):"), error);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error(chalk.red("[❌] Lỗi Promise chưa xử lý (unhandledRejection):"), reason);
});

// =============================================================
// PHẦN 12: THỐNG KÊ VÀ BÁO CÁO HOẠT ĐỘNG BOT
// =============================================================
/**
 * Chức năng thống kê:
 * - Ghi nhận số lần thực thi mỗi lệnh thông qua biến usageStats.
 * - Vào cuối mỗi ngày, bot sẽ gửi báo cáo tổng hợp đến admin (nếu config.adminChatId được thiết lập)
 *   hoặc in ra console.
 * - Sau khi gửi báo cáo, thống kê sẽ được reset để bắt đầu cho ngày mới.
 */
function sendDailyReport() {
    let report = "📊 **Báo cáo hoạt động Bot trong ngày:**\n\n";
    const commandNames = Object.keys(usageStats);
    if (commandNames.length === 0) {
        report += "Không có lệnh nào được thực thi trong ngày hôm nay.";
    } else {
        commandNames.forEach(cmdName => {
            report += `/${cmdName}: ${usageStats[cmdName]} lần\n`;
        });
    }
    // Nếu có adminChatId trong config, gửi báo cáo tới đó; nếu không, log ra console.
    if (config.adminChatId) {
        bot.sendMessage(config.adminChatId, report, { parse_mode: "Markdown" })
            .then(() => console.log(chalk.green("[📤] Đã gửi báo cáo hoạt động cho admin.")))
            .catch(err => console.error(chalk.red("[❌] Lỗi gửi báo cáo cho admin:"), err));
    } else {
        console.log(chalk.magenta(report));
    }
    // Reset lại thống kê sau khi gửi báo cáo.
    usageStats = {};
}

/**
 * scheduleDailyReport:
 * - Tính khoảng thời gian đến lúc nửa đêm (hoặc thời điểm mong muốn) của ngày hiện tại.
 * - Sau đó, sử dụng setTimeout để chạy sendDailyReport một lần và đặt setInterval cho báo cáo hàng ngày.
 */
function scheduleDailyReport() {
    const now = new Date();
    // Thiết lập báo cáo lúc 23:59:59 của ngày hiện tại.
    const reportTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let timeToReport = reportTime - now;
    // Nếu thời gian đã qua (trường hợp chạy sau 23:59), báo cáo ngay và đặt khoảng cách 24 giờ cho lần sau.
    if (timeToReport < 0) {
        timeToReport = 0;
    }
    setTimeout(() => {
        sendDailyReport();
        // Sau khi báo cáo đầu tiên, đặt interval 24 giờ.
        setInterval(sendDailyReport, 24 * 60 * 60 * 1000);
    }, timeToReport);
}
scheduleDailyReport();
// Sau khi bot được khởi tạo
if (banking.init) {
  setTimeout(() => {
    banking.init(bot);
  }, 1000); // Chờ 1 giây để đảm bảo bot đã khởi tạo xong
}
banking.init(bot);
