const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "checktt.json");
const CONFIG_FILE = path.join(__dirname, "..", "config.json");

module.exports = {
    name: "checktt",
    description: "📊 Kiểm tra mức độ hoạt động của các thành viên trong nhóm.",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userName = msg.from.username || msg.from.first_name;

        // Đọc file config để lấy admin bot
        let config = {};
        if (fs.existsSync(CONFIG_FILE)) {
            config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
        }
        const botAdmins = Array.isArray(config.adminChatId) ? config.adminChatId : [config.adminChatId];

        try {
            let data = {};

            // Kiểm tra nếu tệp JSON đã tồn tại
            if (fs.existsSync(DATA_FILE)) {
                data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
            }

            // Nếu nhóm chưa có dữ liệu, tạo mới
            if (!data[chatId]) {
                data[chatId] = { owner: null, members: {} };
            }

            // Xác định quyền hạn
            const chatInfo = await bot.getChatAdministrators(chatId);
            const owner = chatInfo.find(admin => admin.status === "creator")?.user.id;
            const isOwner = owner === userId;
            const isBotAdmin = botAdmins.includes(userId);
            const isGroupAdmin = chatInfo.some(admin => admin.user.id === userId);

            // Cập nhật dữ liệu thành viên
            if (!data[chatId].members[userId]) {
                data[chatId].members[userId] = { name: userName, messages: 0, role: "member" };
            }

            data[chatId].members[userId].messages++;

            // Cập nhật quyền hạn
            if (isOwner) data[chatId].members[userId].role = "owner";
            else if (isBotAdmin) data[chatId].members[userId].role = "bot_admin";
            else if (isGroupAdmin) data[chatId].members[userId].role = "admin";
            else data[chatId].members[userId].role = "member";

            // Lưu dữ liệu vào file JSON
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

            // Nếu có tham số "all", hiển thị danh sách hoạt động đầy đủ
            if (args[0] === "all") {
                let userStats = Object.entries(data[chatId].members)
                    .map(([id, info]) => ({ id, ...info }))
                    .sort((a, b) => b.messages - a.messages); // Sắp xếp theo số tin nhắn giảm dần

                let message = "📊 **Bảng xếp hạng hoạt động** 📊\n\n";
                userStats.forEach((user, index) => {
                    let roleEmoji = user.role === "owner" ? "👑" :
                                    user.role === "bot_admin" ? "🛠️" :
                                    user.role === "admin" ? "🔧" : "👤";
                    message += `${roleEmoji} **${index + 1}.** ${user.name} - 📝 **${user.messages} tin nhắn**\n`;
                });

                return bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
            }

            bot.sendMessage(
                chatId,
                `📩 **${userName}** (${data[chatId].members[userId].role}) đã gửi **${data[chatId].members[userId].messages}** tin nhắn.`,
                { parse_mode: "Markdown" }
            );
        } catch (error) {
            console.error("Lỗi khi xử lý checktt:", error);
            bot.sendMessage(chatId, "❌ Đã xảy ra lỗi khi kiểm tra hoạt động.");
        }
    }
};
