const fs = require("fs");
const usersFile = "./modules/users.json";

module.exports = {
    name: "fakeip",
    description: "📡 Tạo IP giả và User-Agent ngẫu nhiên!",
    execute(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        if (!fs.existsSync(usersFile)) {
            fs.writeFileSync(usersFile, "{}");
        }

        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

        if (!users[userId]) {
            return bot.sendMessage(chatId, "❌ Bạn chưa có tài khoản! Hãy nhập `/dangky` để đăng ký ngay.", { parse_mode: "Markdown" });
        }

        if (users[userId].xu < 21) {
            return bot.sendMessage(chatId, "❌ Bạn không đủ **21 xu** để tạo IP giả!", { parse_mode: "Markdown" });
        }

        // Trừ tiền
        users[userId].xu -= 21;
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

        // Tạo IP giả
        const fakeIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

        // Tạo User-Agent ngẫu nhiên
        const userAgents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/537.36 (KHTML, like Gecko) Version/15.4 Safari/537.36",
            "Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.92 Mobile Safari/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/16.1 Mobile/15E148 Safari/537.36",
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/109.0",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0"
        ];

        const fakeUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

        // Gửi kết quả
        const message = `
🕵 **IP Giả Tạo Thành Công!**  
📡 **IP:** \`${fakeIp}\`  
📲 **User-Agent:** \`${fakeUserAgent}\`  
💰 **Bạn đã bị trừ 21 xu!**  
        `;

        bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    }
};
