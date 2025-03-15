const axios = require("axios");

module.exports = {
    name: "gai",
    description: "💃 Gửi video gái ngẫu nhiên!",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const apiUrl = "http://khiemsub.site:8080/gai?key=khiemdeptrai";

        try {
            // **Gọi API để lấy video**
            const response = await axios.get(apiUrl);
            const videoUrl = response.data?.video; // API trả về { "video": "link.mp4" }

            if (!videoUrl) {
                return bot.sendMessage(chatId, "❌ Không thể lấy video gái. Hãy thử lại sau!");
            }

            // **Gửi video cho người dùng**
            bot.sendVideo(chatId, videoUrl, { caption: "💃 Video gái xinh đây anh em!" });

        } catch (error) {
            console.error("❌ Lỗi tải video gái:", error);
            bot.sendMessage(chatId, "❌ Không thể tải video. Vui lòng thử lại sau!");
        }
    }
};
