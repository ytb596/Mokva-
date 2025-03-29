const axios = require("axios");

module.exports = {
    name: "ask",
    description: "💬 Đặt câu hỏi và nhận câu trả lời từ AI chatbot.",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // Kiểm tra cú pháp: yêu cầu người dùng nhập câu hỏi
        if (args.length < 1) {
            return bot.sendMessage(chatId, "⚠️ Vui lòng nhập câu hỏi của bạn, ví dụ: `/ask Bạn có khỏe không?`", { parse_mode: "Markdown" });
        }

        const userQuestion = args.join(" ");
        const apiUrl = `https://api.sumiproject.net/sim?type=ask&ask=${encodeURIComponent(userQuestion)}`;

        try {
            const response = await axios.get(apiUrl);

            // Kiểm tra nếu API không trả về câu trả lời hợp lệ
            if (!response.data || !response.data.answer) {
                return bot.sendMessage(chatId, "❌ Không thể lấy câu trả lời từ API.", { parse_mode: "Markdown" });
            }

            const botReply = response.data.answer;
            bot.sendMessage(chatId, `🤖 **Bot:** ${botReply}`, { parse_mode: "Markdown" });
        } catch (error) {
            console.error("Lỗi khi gọi API ask:", error);
            return bot.sendMessage(chatId, "❌ Đã xảy ra lỗi khi gửi câu hỏi.", { parse_mode: "Markdown" });
        }
    }
};
