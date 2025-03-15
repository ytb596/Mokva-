const fs = require("fs");

const usersFile = "./modules/users.json";

module.exports = {
    name: "rank",
    execute: async (bot, msg) => {
        if (!fs.existsSync(usersFile)) {
            return bot.sendMessage(msg.chat.id, "❌ Không có dữ liệu người chơi.");
        }

        let users;
        try {
            users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
        } catch {
            return bot.sendMessage(msg.chat.id, "❌ Lỗi khi đọc dữ liệu người chơi.");
        }

        // Tạo danh sách xếp hạng
        const leaderboard = Object.entries(users)
            .map(([id, data]) => ({
                id,
                name: data.name || `ID: ${id}`, // Nếu có tên thì hiển thị, không có thì hiển thị ID
                xu: data.xu || 0,
            }))
            .sort((a, b) => b.xu - a.xu) // Sắp xếp từ cao đến thấp
            .slice(0, 10); // Chỉ lấy 10 người giàu nhất

        if (leaderboard.length === 0) {
            return bot.sendMessage(msg.chat.id, "❌ Không có ai trong bảng xếp hạng.");
        }

        // Tạo tin nhắn hiển thị
        let message = "🏆 **Bảng xếp hạng người giàu nhất** 🏆\n\n";
        leaderboard.forEach((user, index) => {
            message += `#${index + 1} - **${user.name}**: ${user.xu} xu\n`;
        });

        bot.sendMessage(msg.chat.id, message);
    }
};
