const fs = require("fs");
const usersFile = "./modules/users.json";

module.exports = {
    name: "bank",
    description: "💰 Kiểm tra số dư tài khoản ngân hàng!",
    execute(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        if (!fs.existsSync(usersFile)) {
            fs.writeFileSync(usersFile, "{}");
        }

        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

        if (!users[userId]) {
            return bot.sendMessage(chatId, "❌ Bạn chưa có tài khoản! Hãy nhập lệnh `/dangky` để đăng ký tài khoản ngay.", { parse_mode: "Markdown" });
        }

        const balance = users[userId].xu.toLocaleString("en-US"); // Định dạng số tiền

        const message = `┌────⭓ *Nhà Cái Châu Á* ────┐\n` +
                        `│ 📇 **ID người dùng**: ${userId} │\n` +
                        `│ 💵 **Số dư của bạn**: ${balance} VND │\n` +
                        `└────────────────⧕\n\n` +
                        `Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi! 🌟`;

        bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    }
};
