const fs = require("fs");
const usersFile = "./modules/users.json";

module.exports = {
    name: "quayso",
    description: "🎰 Quay số may mắn với máy đánh bạc!",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        // Kiểm tra file users.json, nếu chưa có thì tạo mới
        if (!fs.existsSync(usersFile)) {
            fs.writeFileSync(usersFile, "{}");
        }

        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

        // Kiểm tra xem user đã đăng ký chưa
        if (!users[userId]) {
            return bot.sendMessage(chatId, "❌ Bạn chưa đăng ký tài khoản! Gõ /dangky để đăng ký.");
        }

        // Kiểm tra số xu cược
        const betAmount = parseInt(args[0]);

        if (isNaN(betAmount) || betAmount <= 0) {
            return bot.sendMessage(chatId, "❌ Vui lòng nhập số xu muốn cược! Ví dụ: `quayso 500`", { parse_mode: "Markdown" });
        }

        if (betAmount > 1100) {
            return bot.sendMessage(chatId, "❌ Số xu cược tối đa là 1100 xu! Bạn không thể cược vượt quá số này.");
        }

        if (users[userId].xu < betAmount) {
            return bot.sendMessage(chatId, "❌ Bạn không đủ xu để đặt cược!");
        }

        // Gửi biểu tượng 🎰 để quay số
        bot.sendDice(chatId, { emoji: "🎰" }).then(result => {
            setTimeout(() => {
                const value = result.dice.value;

                // Kết quả từ Telegram (1-64), trong đó 22, 43, 64 là thắng
                let resultMessage;
                if (value === 22 || value === 43 || value === 64) {
                    // Thắng
                    users[userId].xu += betAmount;
                    resultMessage = `🎉 Chúc mừng! Bạn đã thắng với số **${value}**! 🚀 Bạn nhận được ${betAmount} xu! 💰\n\n*Woa! Bạn thật may mắn! Giờ thì đi mua bánh kẹo nào! 🍬*`;
                } else {
                    // Thua
                    users[userId].xu -= betAmount;
                    const loserMessages = [
                        "💀 Ôi không! Bạn đã thua rồi! Đừng buồn nhé... 😭",
                        "🤡 Awww, vận đen thôi mà, lần sau chắc chắn bạn sẽ thắng! 😘",
                        "🎭 Không sao đâu, lần sau bạn sẽ lại gặp may thôi mà! 🤗",
                        "⏳ Nghỉ ngơi một chút rồi chơi lại, may mắn sẽ đến với bạn! 🌟",
                        "🔴 Mặc dù hôm nay không phải là ngày của bạn, nhưng đừng quên... lần sau có thể khác! 💖"
                    ];
                    const randomMessage = loserMessages[Math.floor(Math.random() * loserMessages.length)];
                    resultMessage = `🎰 **Số quay: ${value}**\n${randomMessage}\n\n*Dù sao thì bạn vẫn là người tuyệt vời, lần sau sẽ may mắn hơn! 🥰*`;
                }

                // Lưu lại dữ liệu
                fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

                // Gửi kết quả cho người chơi
                bot.sendMessage(chatId, resultMessage);
            }, 3000); // Chờ 3 giây rồi phản hồi kết quả
        });
    }
};