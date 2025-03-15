const axios = require("axios");

module.exports = {
    name: "animeavatar",
    description: "🌸 Chuyển đổi avatar thành nhân vật anime!",
    async execute(bot, msg) {
        const chatId = msg.chat.id;

        // Kiểm tra người dùng có ảnh đại diện không
        if (!msg.from || !msg.from.photo) {
            return bot.sendMessage(chatId, "🚫 Bạn chưa có ảnh đại diện để chuyển đổi.");
        }

        try {
            // Lấy ảnh avatar của người dùng
            const photos = msg.from.photo;
            const avatarUrl = await bot.getFileLink(photos[photos.length - 1].file_id);

            // Gửi ảnh avatar đến API waifu.pics
            const response = await axios.get(`https://api.waifu.pics/sfw/waifu`);

            // Gửi ảnh anime đến người dùng
            bot.sendPhoto(chatId, response.data.url, { caption: "✨ Đây là phiên bản anime của bạn!" });
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, "🚫 Có lỗi xảy ra! Hãy thử lại sau.");
        }
    }
};
