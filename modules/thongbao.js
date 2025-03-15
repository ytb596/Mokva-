const fs = require("fs");
const groupFile = "./modules/id.json";
const replyFile = "./modules/replies.json";

module.exports = {
    name: "thongbao",
    execute: async (bot, msg, args) => {
        const userId = msg.from.id.toString();
        const adminId = "8014033911"; // Thay ID admin của bạn

        // Kiểm tra nếu không phải admin
        if (userId !== adminId) {
            return bot.sendMessage(msg.chat.id, "❌ Bạn không có quyền gửi thông báo.");
        }

        // Đọc danh sách nhóm, đảm bảo luôn là mảng
        let groups = [];
        if (fs.existsSync(groupFile)) {
            try {
                const data = fs.readFileSync(groupFile, "utf-8");
                groups = JSON.parse(data);

                // Đảm bảo dữ liệu trong file id.json là mảng
                if (!Array.isArray(groups)) {
                    groups = [];
                }
            } catch (error) {
                console.error("❌ Lỗi khi đọc file id.json:", error);
                return bot.sendMessage(msg.chat.id, "⚠️ Lỗi khi tải danh sách nhóm.");
            }
        }

        // Kiểm tra nếu không có nhóm nào
        if (groups.length === 0) {
            return bot.sendMessage(msg.chat.id, "⚠️ Không có nhóm nào để gửi thông báo.");
        }

        // Lấy nội dung thông báo
        const message = args.join(" ");
        if (!message) {
            return bot.sendMessage(msg.chat.id, "❌ Vui lòng nhập nội dung thông báo.");
        }

        // Đọc file reply để lưu phản hồi
        let replies = {};
        if (fs.existsSync(replyFile)) {
            try {
                const data = fs.readFileSync(replyFile, "utf-8");
                replies = JSON.parse(data);
            } catch (error) {
                console.error("❌ Lỗi khi đọc file replies.json:", error);
            }
        }

        // Gửi thông báo đến tất cả nhóm và lưu ID tin nhắn
        groups.forEach((groupId) => {
            bot.sendMessage(groupId, `📢 **THÔNG BÁO TỪ ADMIN:**\n\n${message}`).then((sentMsg) => {
                replies[sentMsg.message_id] = { groupId, adminId };
                fs.writeFileSync(replyFile, JSON.stringify(replies, null, 2));
            }).catch((err) => {
                console.error(`❌ Lỗi gửi tin nhắn đến nhóm ${groupId}:`, err);
            });
        });

        bot.sendMessage(msg.chat.id, `✅ Đã gửi thông báo đến ${groups.length} nhóm.`);
    }
};

// Lưu ID nhóm khi bot tham gia
module.exports.monitorGroup = (bot) => {
    bot.on("new_chat_members", (msg) => {
        const chatId = msg.chat.id.toString();
        let groups = [];

        if (fs.existsSync(groupFile)) {
            try {
                groups = JSON.parse(fs.readFileSync(groupFile, "utf-8"));
                if (!Array.isArray(groups)) groups = [];
            } catch (error) {
                console.error("❌ Lỗi khi đọc file id.json:", error);
            }
        }

        // Lưu ID nhóm nếu nhóm chưa có trong danh sách
        if (!groups.includes(chatId)) {
            groups.push(chatId);
            fs.writeFileSync(groupFile, JSON.stringify(groups, null, 2));
            bot.sendMessage(chatId, "✅ Bot đã được thêm vào nhóm.");
        }
    });

    bot.on("left_chat_member", (msg) => {
        const chatId = msg.chat.id.toString();
        let groups = [];

        if (fs.existsSync(groupFile)) {
            try {
                groups = JSON.parse(fs.readFileSync(groupFile, "utf-8"));
                if (!Array.isArray(groups)) groups = [];
            } catch (error) {
                console.error("❌ Lỗi khi đọc file id.json:", error);
            }
        }

        // Xóa ID nhóm khi bot rời khỏi nhóm
        groups = groups.filter(groupId => groupId !== chatId);
        fs.writeFileSync(groupFile, JSON.stringify(groups, null, 2));
        bot.sendMessage(chatId, "🚫 Bot đã bị xóa khỏi nhóm.");
    });
};

// Xử lý phản hồi từ nhóm
module.exports.handleReply = (bot) => {
    bot.on("message", (msg) => {
        if (!msg.reply_to_message) return;

        const replyToId = msg.reply_to_message.message_id.toString();
        let replies = {};

        if (fs.existsSync(replyFile)) {
            try {
                replies = JSON.parse(fs.readFileSync(replyFile, "utf-8"));
            } catch (error) {
                console.error("❌ Lỗi khi đọc file replies.json:", error);
            }
        }

        if (replies[replyToId]) {
            const { groupId, adminId } = replies[replyToId];

            if (msg.chat.id.toString() === groupId) {
                bot.sendMessage(adminId, `📩 **PHẢN HỒI TỪ NHÓM ${groupId}:**\n\n${msg.text}`, {
                    reply_to_message_id: replyToId,
                });
            }
        }

        if (msg.from.id.toString() === adminId && replies[replyToId]) {
            bot.forwardMessage(replies[replyToId].groupId, msg.chat.id, msg.message_id);
        }
    });
};
