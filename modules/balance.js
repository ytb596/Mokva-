const fs = require("fs");
const usersFile = "./modules/users.json";

module.exports = {
    name: "balance",
    execute: async (bot, msg) => {
        const userId = msg.from.id.toString();

        // Nếu chưa đăng ký thì không thể dùng lệnh
        if (!fs.existsSync(usersFile)) {
            return bot.sendMessage(msg.chat.id, "❌ Bạn chưa đăng ký tài khoản! Hãy gõ `dangky` để đăng ký.");
        }

        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
        if (!users[userId]) {
            return bot.sendMessage(msg.chat.id, "❌ Bạn chưa đăng ký tài khoản! Hãy gõ `dangky` để đăng ký.");
        }

        // Hiển thị số dư
        const xu = users[userId].xu;
        bot.sendMessage(msg.chat.id, `💰 Số dư hiện tại của bạn: ${xu} xu
chúc bạn 1 ngày chơi game vui vẻ`);
    }
};
