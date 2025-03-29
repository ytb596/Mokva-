const fs = require("fs");
const path = require("path");

module.exports = {
    name: "leave",
    description: "🚪 Rời khỏi nhóm...",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        // 🔹 Đường dẫn tuyệt đối của tệp
        const baseDir = path.resolve(__dirname, "..");  // Lấy thư mục chính
        const idFilePath = path.join(baseDir, "modules", "id.json");
        const configFilePath = path.join(baseDir, "config.json");

        let allowedGroups = [];
        let adminChatId;

        // 🔹 Kiểm tra tệp id.json
        try {
            console.log(`📂 Kiểm tra tệp: ${idFilePath}`);
            if (!fs.existsSync(idFilePath)) {
                throw new Error("❌ Tệp id.json không tồn tại.");
            }

            const data = fs.readFileSync(idFilePath, "utf8");
            allowedGroups = JSON.parse(data);

            if (!Array.isArray(allowedGroups) || !allowedGroups.every(id => typeof id === "number")) {
                throw new Error("❌ Dữ liệu trong id.json không hợp lệ.");
            }

            console.log(`✅ Đã tải danh sách nhóm (${allowedGroups.length} nhóm).`);
        } catch (error) {
            console.error("🚨 Lỗi khi đọc modules/id.json:", error.message);
            return bot.sendMessage(chatId, "❌ Không thể tải danh sách nhóm.");
        }

        // 🔹 Kiểm tra tệp config.json
        try {
            console.log(`📂 Kiểm tra tệp: ${configFilePath}`);
            if (!fs.existsSync(configFilePath)) {
                throw new Error("❌ Tệp config.json không tồn tại.");
            }

            const config = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
            if (!config.adminChatId || typeof config.adminChatId !== "number") {
                throw new Error("❌ Thiếu hoặc sai kiểu dữ liệu 'adminChatId' trong config.json.");
            }

            adminChatId = config.adminChatId;
            console.log(`✅ Admin bot ID: ${adminChatId}`);
        } catch (error) {
            console.error("🚨 Lỗi khi đọc config.json:", error.message);
            return bot.sendMessage(chatId, "❌ Không thể tải cấu hình admin.");
        }

        // 🔹 Kiểm tra quyền admin bot
        if (userId !== adminChatId) {
            return bot.sendMessage(chatId, "⛔ Bạn không có quyền sử dụng lệnh này.");
        }

        // 🔹 Kiểm tra nhóm có trong danh sách không
        if (!allowedGroups.includes(chatId)) {
            return bot.sendMessage(chatId, "⚠️ Nhóm này không nằm trong danh sách bot có thể rời.");
        }

        // 🔹 Bot rời nhóm
        try {
            await bot.leaveChat(chatId);
            console.log(`✅ Bot đã rời nhóm ID: ${chatId}`);
        } catch (error) {
            console.error("❌ Lỗi khi rời nhóm:", error);
            return bot.sendMessage(chatId, "❌ Không thể rời khỏi nhóm.");
        }
    }
};
