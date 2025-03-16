const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");

// Lưu thời điểm bot khởi động
const botStartTime = Date.now();

// Đường dẫn đến file chứa danh sách video
const videoFilePath = "data_api/cos/video.json";
let videoList = [];

// Tải danh sách video vào RAM khi bot khởi động
function loadVideoList() {
    try {
        if (fs.existsSync(videoFilePath)) {
            const rawData = fs.readFileSync(videoFilePath);
            const data = JSON.parse(rawData);

            if (Array.isArray(data) && data.length > 0) {
                videoList = data;
                console.log(`✅ Đã nạp ${videoList.length} video từ ${videoFilePath}`);
            } else {
                console.error("⚠️ Danh sách video trống hoặc không hợp lệ.");
            }
        } else {
            console.error(`❌ Không tìm thấy file ${videoFilePath}!`);
        }
    } catch (error) {
        console.error("❌ Lỗi khi tải danh sách video:", error);
    }
}

// Gọi hàm load khi bot khởi động
loadVideoList();

// Hàm lấy FPS trung bình
function getFPS() {
    try {
        const loadAvg = os.loadavg()[0]; // Tải CPU trung bình trong 1 phút
        const fps = (100 / (1 + loadAvg)).toFixed(2); // Công thức tính FPS đơn giản
        return fps;
    } catch (error) {
        return "Không thể đo FPS.";
    }
}

// Hàm lấy thông tin cấu hình
function getSystemInfo() {
    try {
        const cpuModel = os.cpus()[0].model;
        const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2); // GB
        const freeRAM = (os.freemem() / 1024 / 1024 / 1024).toFixed(2); // GB
        const osPlatform = os.platform();
        const osVersion = os.release();

        return `🖥 Cấu hình hệ thống:\n• CPU: ${cpuModel}\n• RAM: ${freeRAM}/${totalRAM} GB\n• OS: ${osPlatform} ${osVersion}`;
    } catch (error) {
        return "Không thể lấy thông tin cấu hình.";
    }
}

// Hàm tính thời gian uptime chính xác
function getUptime() {
    const uptimeSeconds = Math.floor((Date.now() - botStartTime) / 1000); // Tính uptime từ thời điểm khởi động bot

    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;

    return `${hours} giờ ${minutes} phút ${seconds} giây`;
}

module.exports = {
    name: "uptime",
    description: "📊 Kiểm tra thời gian hoạt động của bot, FPS, cấu hình và gửi video gái.",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;

        // Lấy uptime, FPS và thông tin hệ thống
        const uptimeMessage = `⏳ Bot đã hoạt động: ${getUptime()}.\n🎮 FPS trung bình: ${getFPS()} FPS\n${getSystemInfo()}`;

        // Kiểm tra nếu danh sách video trống
        if (videoList.length === 0) {
            return bot.sendMessage(chatId, uptimeMessage + "\n🚫 Hiện không có video nào để gửi.");
        }

        // Chọn ngẫu nhiên một video
        const randomVideo = videoList[Math.floor(Math.random() * videoList.length)];

        // Gửi thông báo uptime kèm video
        bot.sendVideo(chatId, randomVideo, {
            caption: `📊 ${uptimeMessage}\n🎥 Video giải trí cho ae FA vibu đây! 😏`
        });
    }
};
