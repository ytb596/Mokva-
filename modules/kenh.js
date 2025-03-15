const fs = require('fs');

module.exports = {
    name: 'kenh',
    description: 'Lệnh thông báo đến kênh Telegram.',
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const adminId = 8014033911;  // Thay bằng ID admin của bạn
        const channelId = '-1002437237025'; // Thay bằng ID của kênh bạn muốn gửi thông báo

        // Kiểm tra quyền admin
        if (msg.from.id !== adminId) {
            return bot.sendMessage(chatId, "🚫 Bạn không phải là admin, không có quyền thực hiện lệnh này.");
        }

        // Kiểm tra nếu không có đối số
        if (args.length === 0) {
            return bot.sendMessage(chatId, "🚫 Bạn chưa nhập nội dung thông báo.");
        }

        // Lấy nội dung thông báo
        const notificationMessage = args.join(' ');

        // Gửi thông báo đến kênh
        try {
            await bot.sendMessage(channelId, notificationMessage);
            return bot.sendMessage(chatId, "✅ Thông báo đã được gửi đến kênh.");
        } catch (error) {
            console.error(error);
            return bot.sendMessage(chatId, "🚫 Không thể gửi thông báo đến kênh. Vui lòng kiểm tra lại.");
        }
    }
};
