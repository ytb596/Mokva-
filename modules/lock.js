const fs = require('fs');

module.exports = {
    name: "lock",
    description: "Khóa chat trong nhóm hoặc kênh trong một khoảng thời gian nhất định với nhiều đơn vị thời gian, bao gồm năm.",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const adminId = 301991;  // Thay bằng ID admin của bạn
        const timeString = args.join(" ");  // Lấy thời gian khóa từ đối số nhập vào
        
        // Kiểm tra quyền admin
        if (msg.from.id !== adminId) {
            return bot.sendMessage(chatId, "🚫 Bạn không phải là admin, không có quyền thực hiện lệnh này.");
        }

        // Kiểm tra nếu không có đối số
        if (!timeString) {
            return bot.sendMessage(chatId, "🚫 Bạn chưa nhập thời gian khóa.");
        }

        // Hàm chuyển đổi đơn vị thời gian
        const convertTimeToSeconds = (timeString) => {
            const regex = /(\d+)(năm|tuần|ngày|giờ|phút)/g;
            let totalSeconds = 0;
            let match;

            while ((match = regex.exec(timeString)) !== null) {
                const value = parseInt(match[1]);
                const unit = match[2];

                if (unit === "năm") totalSeconds += value * 365 * 24 * 60 * 60;  // Năm (365 ngày)
                if (unit === "tuần") totalSeconds += value * 7 * 24 * 60 * 60;  // Tuần
                if (unit === "ngày") totalSeconds += value * 24 * 60 * 60;  // Ngày
                if (unit === "giờ") totalSeconds += value * 60 * 60;  // Giờ
                if (unit === "phút") totalSeconds += value * 60;  // Phút
            }

            return totalSeconds;
        };

        // Chuyển thời gian từ chuỗi sang giây
        const timeInSeconds = convertTimeToSeconds(timeString);

        if (isNaN(timeInSeconds) || timeInSeconds <= 0) {
            return bot.sendMessage(chatId, "🚫 Thời gian khóa không hợp lệ. Vui lòng sử dụng các đơn vị như năm, tuần, ngày, giờ, phút.");
        }

        // Gửi thông báo khóa chat
        await bot.sendMessage(chatId, `🔒 Chat đã bị khóa trong thời gian ${timeString}. Không ai có thể gửi tin nhắn trong thời gian này.`);
        
        // Khóa chat trong nhóm hoặc kênh
        try {
            await bot.setChatPermissions(chatId, {
                can_send_messages: false,
                can_send_media_messages: false,
                can_send_other_messages: false,
                can_add_web_page_previews: false,
            });

            // Sau thời gian khóa, mở lại chat
            setTimeout(async () => {
                await bot.setChatPermissions(chatId, {
                    can_send_messages: true,
                    can_send_media_messages: true,
                    can_send_other_messages: true,
                    can_add_web_page_previews: true,
                });
                bot.sendMessage(chatId, "🔓 Chat đã được mở lại.");
            }, timeInSeconds * 1000);  // Thời gian khóa tính bằng giây
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, "🚫 Không thể khóa chat. Vui lòng thử lại.");
        }
    }
};
