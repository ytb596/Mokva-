const fs = require("fs");
const usersFile = "./modules/users.json";

module.exports = {
    name: "dangky",
    execute: async (bot, msg, args) => {
        const userId = msg.from.id.toString();
        const username = msg.from.username || `user_${userId}`;

        // Kiểm tra file users.json, nếu chưa có thì tạo mới
        if (!fs.existsSync(usersFile)) {
            fs.writeFileSync(usersFile, "{}");
        }

        // Đọc dữ liệu hiện tại
        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

        if (users[userId]) {
            return bot.sendMessage(msg.chat.id, "❌ Bạn đã đăng ký tài khoản trước đó!");
        }

        // Thêm người dùng mới
        users[userId] = { username, xu: 1000 }; // Mặc định 1000 xu khi đăng ký
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

        bot.sendMessage(msg.chat.id, `✅ Đăng ký thành công!\n💰 Số dư: 1000 xu`);
    }
};
