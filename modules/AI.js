const axios = require("axios");

module.exports = {
    name: "AI",
    description: "🤖 Hỏi AI của Alibaba và nhận câu trả lời.",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // Kiểm tra nhập câu hỏi
        if (args.length === 0) {
            return bot.sendMessage(chatId, "❌ Vui lòng nhập câu hỏi cho AI.\nVí dụ: `/AI Thời tiết hôm nay thế nào?`", { parse_mode: "Markdown" });
        }

        const userQuestion = args.join(" "); // Ghép câu hỏi từ user
        const apiUrl = `https://qwen-ai.apis-bj-devs.workers.dev/?text=${encodeURIComponent(userQuestion)}`;

        try {
            const response = await axios.get(apiUrl);
            const aiReply = response.data.content; // Chỉ lấy phần "content"

            // Gửi câu trả lời từ AI
            bot.sendMessage(chatId, `🤖 *AI Alibaba:* ${aiReply}`, { parse_mode: "Markdown" });
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            bot.sendMessage(chatId, "❌ AI không thể trả lời ngay lúc này. Vui lòng thử lại sau!");
        }
    }
};
