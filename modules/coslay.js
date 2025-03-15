const axios = require("axios");

module.exports = {
    name: "cosplay",
    description: "🎭 Random ảnh gái xinh cosplay anime cho anh em wibu!",
    async execute(bot, msg) {
        const chatId = msg.chat.id;

        // API lấy ảnh cosplay (thay đổi link API tùy theo nguồn)
        const apiUrl = "https://nekos.best/api/v2/cosplay";  

        try {
            const response = await axios.get(apiUrl);
            const imgUrl = response.data.results[0].url;

            // Gửi ảnh kèm caption
            bot.sendPhoto(chatId, imgUrl, { caption: "🔥 Đây là ảnh cosplay dành riêng cho **wibu chân chính**! 😏" });
        } catch (error) {
            bot.sendMessage(chatId, "🚫 Lỗi lấy ảnh! Thử lại sau nhé, wibu ơi!");
        }
    }
};
