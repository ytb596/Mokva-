const fs = require("fs");
const usersFile = "./modules/users.json";

module.exports = {
    name: "rank",
    description: "🏆 Bảng xếp hạng người giàu nhất",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;

        // Kiểm tra file users.json, nếu chưa có thì tạo mới
        if (!fs.existsSync(usersFile)) {
            fs.writeFileSync(usersFile, "{}");
        }

        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

        // Lọc người chơi và sắp xếp theo số xu
        const sortedUsers = Object.keys(users)
            .map(userId => {
                return {
                    id: userId,  // ID Telegram của người chơi
                    name: users[userId].name || `ID: ${userId}`, // Nếu không có tên, hiển thị ID
                    xu: users[userId].xu || 0
                };
            })
            .sort((a, b) => b.xu - a.xu);

        // Tạo bảng xếp hạng
        let rankText = "┏━━━⭓ Nhà Cái Châu Á ━━━━\n";
        rankText += "┃ 🏆 **BẢNG XẾP HẠNG NGƯỜI GIÀU NHẤT** 🏆\n";

        for (let i = 0; i < sortedUsers.length; i++) {
            const user = sortedUsers[i];
            rankText += `┃ #${i + 1} ${user.name} - ${user.xu.toLocaleString()} VND\n`;
        }

        rankText += "┗━━━━━━━━━━━━━━━━━━━━━⧕\n";
        rankText += "🎉 **Admin đặc biệt: senpai** 🎉";

        bot.sendMessage(chatId, rankText);
    }
};
