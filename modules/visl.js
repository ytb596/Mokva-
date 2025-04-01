const axios = require("axios");

module.exports = {
    name: "visit",
    description: "📈 Tăng lượt truy cập cho ID mong muốn.",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // Kiểm tra nhập ID
        if (args.length === 0) {
            return bot.sendMessage(chatId, "❌ Vui lòng nhập ID để tăng lượt truy cập.\nVí dụ: `/visit 12345678`", { parse_mode: "Markdown" });
        }

        const userId = args[0]; // Lấy ID
        const apiUrl = `https://visit-api-lk-team.vercel.app/${userId}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            // Kiểm tra trạng thái
            if (data.status !== "success") {
                return bot.sendMessage(chatId, "❌ Không thể tăng lượt truy cập. Thử lại sau!");
            }

            // Tin nhắn phản hồi
            const replyMessage = `
🚀 *Tăng lượt truy cập thành công!*
✅ *ID:* ${userId}
🔹 *Yêu cầu đã gửi:* ${data.visit_operation.details.requests_sent}
🔸 *Token đã dùng:* ${data.visit_operation.details.tokens_used}
📌 *Trạng thái:* ${data.visit_operation.message}
            `;

            bot.sendMessage(chatId, replyMessage, { parse_mode: "Markdown" });
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            bot.sendMessage(chatId, "❌ Đã xảy ra lỗi khi gửi lượt truy cập.");
        }
    }
};
