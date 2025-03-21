const fs = require("fs");
const usersFile = "./modules/users.json";

module.exports = {
    name: "baucua",
    description: "🦀🦌🐟🐲🦞🐂 Chơi bầu cua may mắn!",
    execute(bot, msg, args) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        if (!fs.existsSync(usersFile)) {
            fs.writeFileSync(usersFile, "{}");
        }

        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

        if (!users[userId]) {
            return bot.sendMessage(chatId, "❌ Bạn chưa có tài khoản! Hãy nhập `/dangky` để đăng ký ngay.", { parse_mode: "Markdown" });
        }

        if (args.length < 2) {
            return bot.sendMessage(chatId, "🎲 Vui lòng đặt cược theo cú pháp: `/baucua [biểu tượng] [số tiền]`\nVí dụ: `/baucua 🦀 500`", { parse_mode: "Markdown" });
        }

        const betChoice = args[0]; // Biểu tượng cược
        const betAmount = parseInt(args[1]); // Số tiền cược

        const validChoices = ["🦀", "🦌", "🐟", "🐲", "🦞", "🐂"];

        if (!validChoices.includes(betChoice)) {
            return bot.sendMessage(chatId, "❌ Bạn chỉ có thể chọn: 🦀, 🦌, 🐟, 🐲, 🦞, 🐂.");
        }

        if (isNaN(betAmount) || betAmount <= 0) {
            return bot.sendMessage(chatId, "❌ Vui lòng nhập số tiền cược hợp lệ.");
        }

        if (users[userId].xu < betAmount) {
            return bot.sendMessage(chatId, "❌ Bạn không đủ xu để đặt cược!");
        }

        // Quay bầu cua (random kết quả)
        const result = validChoices[Math.floor(Math.random() * validChoices.length)];

        let message = `🎲 **Kết quả quay: ${result}**\n`;

        if (result === betChoice) {
            const winnings = betAmount * 2;
            users[userId].xu += winnings;
            message += `🎉 Chúc mừng! Bạn đã **thắng** và nhận được **${winnings.toLocaleString("en-US")} xu**! 💰`;
        } else {
            users[userId].xu -= betAmount;
            message += `💀 Bạn đã **thua** và mất **${betAmount.toLocaleString("en-US")} xu**... 😢`;
        }

        // Lưu dữ liệu
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

        bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    }
};
