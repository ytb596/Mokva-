const axios = require('axios');

module.exports = {
    name: "buff",
    description: "📌 Buff lượt follow cho tài khoản",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const senderName = msg.from.username || msg.from.first_name;
        const username = args[0]; // Lấy username từ người dùng nhập vào

        if (!username) {
            return bot.sendMessage(chatId, "❌ Vui lòng nhập tên người dùng cần buff follow!\nVí dụ: `/buff philm322`");
        }

        bot.sendMessage(chatId, `⏳ Đang tiến hành buff follow cho tài khoản: ${username}...`);

        try {
            // Sử dụng axios để gửi yêu cầu HTTPS đến API
            const response = await axios.get(`https://anhcode.click/anhcode/api/fltt.php?key=anhcode&username=${username}`);

            // Kiểm tra nếu phản hồi có chứa đúng các thông tin
            if (response.data && response.data.success !== undefined) {
                const data = response.data;

                if (data.success) {
                    // Xử lý thành công
                    const message = `<blockquote>🔥 <b>Buff thành công!</b> 🔥\n\n`
                        + `- <b>Tên người dùng:</b> <code>${data.username}</code>\n`
                        + `- <b>Nickname:</b> <code>${data.nickname}</code>\n`
                        + `- <b>Số lượng follow trước:</b> <code>${data.followers_truoc}</code>\n`
                        + `- <b>Số lượng follow sau:</b> <code>${data.followers_sau}</code>\n`
                        + `- <b>Số lượng follow tăng:</b> <code>${data.followers_tang}</code>\n\n`
                        + `<b>☠️ Người gửi:</b> ${senderName}</blockquote>`;

                    bot.sendMessage(chatId, message, { parse_mode: "HTML" });
                } else {
                    bot.sendMessage(chatId, `❌ Lỗi: ${data.message}`);
                }
            } else {
                bot.sendMessage(chatId, "❌ Lỗi: Dữ liệu phản hồi không hợp lệ từ API.");
            }
        } catch (error) {
            // Nếu có lỗi xảy ra, trả về lỗi cho người dùng
            bot.sendMessage(chatId, `❌ Lỗi: ${error.response ? error.response.data.error : error.message}`);
        }
    }
};
