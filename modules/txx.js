const fs = require("fs");
const usersFile = "./modules/users.json";

module.exports = {
    name: "txx",
    execute: async (bot, msg, args) => {
        const userId = msg.from.id.toString();

        // Kiểm tra file users.json, nếu chưa có thì tạo mới
        if (!fs.existsSync(usersFile)) {
            fs.writeFileSync(usersFile, "{}");
        }

        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

        // Kiểm tra xem user đã đăng ký chưa
        if (!users[userId]) {
            return bot.sendMessage(msg.chat.id, "❌ Bạn chưa đăng ký tài khoản! Gõ /dangky để đăng ký.");
        }

        // Kiểm tra số xu cược
        const betAmount = parseInt(args[0]);
        if (isNaN(betAmount) || betAmount <= 0) {
            return bot.sendMessage(msg.chat.id, "❌ Vui lòng nhập số xu muốn cược! Ví dụ: `txx 500`", { parse_mode: "Markdown" });
        }

        if (users[userId].xu < betAmount) {
            return bot.sendMessage(msg.chat.id, "❌ Bạn không đủ xu để đặt cược!");
        }

        // Gửi hiệu ứng quay xúc xắc
        const dice1 = await bot.sendDice(msg.chat.id, { emoji: "🎲" });
        const dice2 = await bot.sendDice(msg.chat.id, { emoji: "🎲" });
        const dice3 = await bot.sendDice(msg.chat.id, { emoji: "🎲" });

        // Chờ 3 giây để bot nhận kết quả
        setTimeout(() => {
            const result = dice1.dice.value + dice2.dice.value + dice3.dice.value;

            // Xóa xúc xắc sau khi quay
            bot.deleteMessage(msg.chat.id, dice1.message_id);
            bot.deleteMessage(msg.chat.id, dice2.message_id);
            bot.deleteMessage(msg.chat.id, dice3.message_id);

            let resultText = `🎲 Tổng: ${result} → `;
            let win = false;

            if (result >= 11) {
                resultText += "✨ **Tài**!";
                win = true;
            } else {
                resultText += "🌙 **Xỉu**!";
            }

            // Tính toán số xu thắng/thua
            if (win) {
                users[userId].xu += betAmount;
                resultText += `\n🎉 Bạn **thắng** ${betAmount} xu! 💰`;
            } else {
                users[userId].xu -= betAmount;
                resultText += `\n💀 Bạn **thua** ${betAmount} xu... 😢`;
            }

            // Lưu lại dữ liệu
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

            // Gửi kết quả cuối cùng
            bot.sendMessage(msg.chat.id, resultText, { parse_mode: "Markdown" });
        }, 3000);
    }
};
