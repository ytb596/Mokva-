const fs = require("fs");
const usersFile = "./modules/users.json";

module.exports = {
    name: "addmoney",
    description: "🤑 Admin thêm tiền cho người chơi!",
    execute(bot, msg, args) {
        const chatId = msg.chat.id;
        const adminId = 8014033911; // 🔴 Thay bằng ID Telegram của admin
        const userId = args[0];
        const amount = parseInt(args[1]);

        if (msg.from.id !== adminId) {
            return bot.sendMessage(chatId, "❌ Bạn không có quyền sử dụng lệnh này!");
        }

        if (!userId || isNaN(amount) || amount <= 0) {
            return bot.sendMessage(chatId, "❌ Sai cú pháp! Dùng: `/addmoney <id> <số xu>`", { parse_mode: "Markdown" });
        }

        if (!fs.existsSync(usersFile)) {
            fs.writeFileSync(usersFile, "{}");
        }

        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

        if (!users[userId]) {
            return bot.sendMessage(chatId, "❌ Người chơi này chưa đăng ký tài khoản!");
        }

        users[userId].xu += amount;
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

        bot.sendMessage(chatId, `✅ Đã thêm **${amount} xu** vào tài khoản của **${userId}**!`);
    }
};
