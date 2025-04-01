const axios = require("axios");

module.exports = {
    name: "xem",
    description: "🚀 Gửi lượt truy cập tới UID Free Fire",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // Kiểm tra xem user có nhập UID không
        if (args.length === 0) {
            return bot.sendMessage(chatId, "❌ Vui lòng nhập UID của Free Fire.\nVí dụ: `/visitor 123456789`", { parse_mode: "Markdown" });
        }

        const uid = args[0]; // Lấy UID từ lệnh
        const apiUrl = `http://ff-garena.run.place/visitor/?uid=${uid}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.success) {
                const totalViews = data.total_views_sent;
                const totalTime = data.total_time_takes;

                // Gửi kết quả tới user
                bot.sendMessage(chatId, `✅ *Thành công!*\n👀 Lượt truy cập đã gửi: *${totalViews}*\n⏳ Thời gian thực hiện: *${totalTime}* giây`, { parse_mode: "Markdown" });
            } else {
                bot.sendMessage(chatId, "❌ Không thể gửi lượt truy cập. Vui lòng thử lại sau!");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            bot.sendMessage(chatId, "❌ Hệ thống đang quá tải. Vui lòng thử lại sau!");
        }
    }
};
