const { exec } = require("child_process");

const decScriptPath = "/data/data/com.termux/files/home/Bot\\ Tele/Dec.py";

module.exports = {
    name: "spam",
    description: "📲 Nhận OTP theo số lượng yêu cầu và xử lý với Dec.py",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const username = msg.from.username || msg.from.first_name; // Lấy tên người dùng

        // Kiểm tra cú pháp lệnh
        if (args.length < 2) {
            return bot.sendMessage(chatId, "⚠️ Sai cú pháp! Sử dụng: `/spam <số điện thoại> <số lượng>`");
        }

        const phoneNumber = args[0];
        const count = parseInt(args[1]);

        // Kiểm tra số điện thoại và số lượng hợp lệ
        if (!/^\d{9,15}$/.test(phoneNumber)) {
            return bot.sendMessage(chatId, "❌ Số điện thoại không hợp lệ!");
        }
        if (isNaN(count) || count <= 0) {
            return bot.sendMessage(chatId, "❌ Số lượng phải là một số dương!");
        }

        // Ẩn phần cuối số điện thoại (ví dụ: 0987654321 -> 098****321)
        const hiddenPhone = phoneNumber.slice(0, 3) + "****" + phoneNumber.slice(-3);

        bot.sendMessage(
            chatId,
            `📩 **Số lượng gửi:** ${count}\n🤖 **Bot của:** ${username}\n📞 **Số ĐT cần gửi:** ${hiddenPhone}\n----\n💖 **Cảm ơn bạn đã gửi!**`,
            { parse_mode: "Markdown" }
        );

        // Gọi Dec.py từ ngoài thư mục bot
        exec(`python3 ${decScriptPath} ${phoneNumber} ${count}`, (error, stdout, stderr) => {
            if (error) {
                return bot.sendMessage(chatId, `❌ Lỗi khi chạy Dec.py:\n\`${error.message}\``);
            }
            if (stderr) {
                return bot.sendMessage(chatId, `⚠️ Cảnh báo từ Dec.py:\n\`${stderr}\``);
            }

            // Gửi kết quả nếu không có lỗi
            bot.sendMessage(chatId, `✅ OTP đã xử lý:\n\`\`\`${stdout}\`\`\``, { parse_mode: "Markdown" });

            // Nếu số lượng gửi đạt yêu cầu, dừng Dec.py
            if (count >= 5) {
                exec(`pkill -f "${decScriptPath}"`, (killError) => {
                    if (killError) {
                        return bot.sendMessage(chatId, "⚠️ Không thể dừng Dec.py, có thể nó đã kết thúc.");
                    }
                    bot.sendMessage(chatId, "🛑 Đã gửi đủ 5 OTP, dừng Dec.py thành công!");
                });
            }
        });
    }
};
