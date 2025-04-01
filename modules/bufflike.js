const axios = require("axios");

module.exports = {
    name: "bufflike",
    description: "📈 Tăng lượt like cho UID",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // Kiểm tra nếu không có UID
        if (args.length === 0) {
            return bot.sendMessage(chatId, "❌ Vui lòng nhập UID.\nVí dụ: `/bufflike 10251125`", { parse_mode: "Markdown" });
        }

        const uid = args[0]; // Lấy UID từ lệnh
        const apiUrl = `https://dichvukey.site/bufflike.php?key=vLong&uid=${uid}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status === 2) {
                return bot.sendMessage(chatId, `⚠️ *Không thể buff like!*\n📝 *Lý do:* ${data.message}`, { parse_mode: "Markdown" });
            }

            // Hiển thị kết quả
            bot.sendMessage(chatId, `✅ *Buff Like Thành Công!*\n👤 *Username:* ${data.username}\n🏆 *Level:* ${data.level}\n👍 *Trước:* ${data.likes_before}\n🔥 *Sau:* ${data.likes_after}\n💯 *Lượt Like Đã Buff:* ${data.likes_given}`, { parse_mode: "Markdown" });

        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            bot.sendMessage(chatId, "❌ Hệ thống quá tải hoặc UID không hợp lệ. Vui lòng thử lại sau!");
        }
    }
};
