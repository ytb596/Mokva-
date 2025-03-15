const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');  // Thêm thư viện moment-timezone

// Lưu thời gian khởi động bot
const botStartTime = moment().tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD HH:mm:ss');

module.exports = {
    name: "vdgai",
    description: "Gửi một video ngẫu nhiên từ danh sách trong video.json.",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;

        // Lấy tên người dùng đã thực thi lệnh (sử dụng tên người dùng hoặc tên đầu tiên của họ)
        const userName = msg.from.username || msg.from.first_name;

        try {
            // Đường dẫn tệp video.json trong thư mục modules
            const videoFilePath = path.join(__dirname, "video.json");

            // Kiểm tra sự tồn tại của tệp video.json
            if (!fs.existsSync(videoFilePath)) {
                return bot.sendMessage(chatId, "🚫 Không tìm thấy tệp video.json.");
            }

            // Đọc danh sách video từ video.json
            const rawData = fs.readFileSync(videoFilePath, 'utf8');
            let videos;
            try {
                videos = JSON.parse(rawData);
            } catch (err) {
                return bot.sendMessage(chatId, "🚫 Lỗi khi phân tích cú pháp tệp video.json.");
            }

            // Kiểm tra danh sách video không rỗng
            if (!Array.isArray(videos) || videos.length === 0) {
                return bot.sendMessage(chatId, "🚫 Danh sách video trống hoặc không hợp lệ.");
            }

            // Chọn video ngẫu nhiên
            const randomVideo = videos[Math.floor(Math.random() * videos.length)];

            // Kiểm tra nếu video hợp lệ (đảm bảo là một URL video hợp lệ)
            if (!randomVideo || !/^https?:\/\/.*\.(mp4|avi|mov|mkv)$/.test(randomVideo)) {
                return bot.sendMessage(chatId, "🚫 Video không hợp lệ hoặc định dạng không được hỗ trợ.");
            }

            // Lấy giờ hiện tại theo múi giờ UTC+7 sử dụng moment-timezone
            const time = moment().tz("Asia/Ho_Chi_Minh").format('YYYY-MM-DD HH:mm:ss'); // Định dạng giờ theo mong muốn

            // Gửi video và giờ hiện tại
            await bot.sendVideo(chatId, randomVideo, {
                caption: `🎥 Video ngẫu nhiên\n⏰ Giờ hiện tại (UTC+7): ${time}\n🕒 Bot đã hoạt động từ: ${botStartTime}\n👤 Lệnh thực thi bởi: ${userName}`
            });

            // Hiển thị thông tin trên terminal
            console.log(`Bot đã gửi video cho người dùng: ${userName}`);
            console.log(`Giờ hiện tại (UTC+7): ${time}`);
            console.log(`Bot đã hoạt động từ: ${botStartTime}`);
            console.log(`Lệnh thực thi bởi: ${userName}`);

        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, "🚫 Đã xảy ra lỗi, vui lòng thử lại sau.");
        }
    }
};
