const axios = require("axios");

module.exports = {
    name: "tiktok",
    description: "🎥 Tải video TikTok không logo + phụ đề!",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // Kiểm tra nếu không có link TikTok
        if (!args[0]) {
            return bot.sendMessage(
                chatId,
                "📢 **Vui lòng gửi link TikTok để tải video.**\n\n🔹 Cách dùng: `/tiktok <link>`"
            );
        }

        const tiktokUrl = args[0];
        const apiUrl = `https://api.sumiproject.net/tiktok?video=${encodeURIComponent(tiktokUrl)}`;

        try {
            // Gọi API tải video TikTok
            const response = await axios.get(apiUrl);
            const data = response.data?.data;

            if (!data?.play) {
                return bot.sendMessage(chatId, "❌ Không thể lấy link video. Hãy thử lại sau!");
            }

            const videoUrl = data.play;
            const title = data.title || "Không có tiêu đề";
            const views = data.views ? `${data.views} lượt xem` : "Không rõ lượt xem";
            const uploadTime = data.upload_time || "Không rõ thời gian đăng";
            const subtitles = data.subtitles || "Không có phụ đề.";

            // Tạo caption với đầy đủ thông tin
            const caption = `🎬 **${title}**\n👀 ${views}\n🕒 ${uploadTime}\n📝 Phụ đề: ${subtitles}`;

            // Gửi video đến người dùng
            bot.sendVideo(chatId, videoUrl, { caption });

        } catch (error) {
            console.error("❌ Lỗi tải TikTok:", error);
            bot.sendMessage(chatId, "❌ Không thể tải video. Vui lòng kiểm tra lại link hoặc thử lại sau.");
        }
    }
};
