const fs = require("fs");

const usersFile = "./modules/users.json";
const pendingFile = "./modules/pending_deposits.json";

module.exports = {
    name: "banking",
    execute: async (bot, msg, args) => {
        const userId = msg.from.id.toString();
        const adminId = "123456789"; // Thay bằng ID admin của bạn

        if (!fs.existsSync(usersFile)) {
            return bot.sendMessage(msg.chat.id, "❌ Không có dữ liệu người chơi.");
        }

        let users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
        let pendingDeposits = fs.existsSync(pendingFile)
            ? JSON.parse(fs.readFileSync(pendingFile, "utf-8"))
            : {};

        if (!users[userId]) {
            return bot.sendMessage(msg.chat.id, "❌ Bạn chưa đăng ký tài khoản! Gõ `dangky` để đăng ký.");
        }

        const subCommand = args[0]; // Lệnh con: xem, gửi, rút, nạp, duyệt
        const amount = parseInt(args[1], 10);
        const targetId = args[2];

        if (!subCommand) {
            return bot.sendMessage(
                msg.chat.id,
                `🏦 **Ngân hàng** 🏦\n\n` +
                `💰 **Số dư ví:** ${users[userId].xu || 0} xu\n` +
                `🏦 **Số dư ngân hàng:** ${users[userId].bank || 0} xu\n\n` +
                `🔹 \`/banking gui <số xu> <ID người nhận>\` - Gửi xu\n` +
                `🔹 \`/banking nap <số xu>\` - Nạp xu (cần admin duyệt)\n` +
                `🔹 \`/banking rut <số xu>\` - Rút xu\n`
            );
        }

        switch (subCommand) {
            case "gui":
                if (!amount || amount <= 0 || !targetId) {
                    return bot.sendMessage(msg.chat.id, "❌ Sai cú pháp! Dùng: `/banking gui <số xu> <ID người nhận>`");
                }
                if (!users[targetId]) {
                    return bot.sendMessage(msg.chat.id, "❌ Người nhận không tồn tại!");
                }
                if ((users[userId].xu || 0) < amount) {
                    return bot.sendMessage(msg.chat.id, "❌ Bạn không đủ xu để gửi!");
                }

                users[userId].xu -= amount;
                users[targetId].xu = (users[targetId].xu || 0) + amount;

                fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

                bot.sendMessage(msg.chat.id, `✅ Bạn đã gửi ${amount} xu cho ${targetId}!`);
                bot.sendMessage(targetId, `🎉 Bạn nhận được ${amount} xu từ ${userId}!`);
                break;

            case "nap":
                if (!amount || amount <= 0) {
                    return bot.sendMessage(msg.chat.id, "❌ Sai cú pháp! Dùng: `/banking nap <số xu>`");
                }

                // Lưu yêu cầu vào danh sách chờ
                pendingDeposits[userId] = (pendingDeposits[userId] || 0) + amount;
                fs.writeFileSync(pendingFile, JSON.stringify(pendingDeposits, null, 2));

                bot.sendMessage(msg.chat.id, `📩 Yêu cầu nạp ${amount} xu đã được gửi. Vui lòng đợi admin duyệt.`);
                bot.sendMessage(adminId, `🔔 **Yêu cầu nạp xu** 🔔\n👤 **Người dùng:** ${userId}\n💰 **Số xu:** ${amount}\n✅ Duyệt: \`/banking duyet ${userId}\``);
                break;

            case "duyet":
                if (userId !== adminId) {
                    return bot.sendMessage(msg.chat.id, "❌ Bạn không có quyền duyệt nạp xu!");
                }
                if (!targetId || !pendingDeposits[targetId]) {
                    return bot.sendMessage(msg.chat.id, "❌ Không có yêu cầu nạp nào từ người dùng này.");
                }

                const depositAmount = pendingDeposits[targetId];

                users[targetId].bank = (users[targetId].bank || 0) + depositAmount;
                delete pendingDeposits[targetId];

                fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
                fs.writeFileSync(pendingFile, JSON.stringify(pendingDeposits, null, 2));

                bot.sendMessage(msg.chat.id, `✅ Đã duyệt ${depositAmount} xu vào ngân hàng của ${targetId}!`);
                bot.sendMessage(targetId, `🎉 Admin đã duyệt ${depositAmount} xu vào ngân hàng của bạn!`);
                break;

            case "rut":
                if (!amount || amount <= 0) {
                    return bot.sendMessage(msg.chat.id, "❌ Sai cú pháp! Dùng: `/banking rut <số xu>`");
                }
                if ((users[userId].bank || 0) < amount) {
                    return bot.sendMessage(msg.chat.id, "❌ Bạn không đủ xu trong ngân hàng để rút!");
                }

                users[userId].bank -= amount;
                users[userId].xu = (users[userId].xu || 0) + amount;

                fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

                bot.sendMessage(msg.chat.id, `✅ Bạn đã rút ${amount} xu từ ngân hàng!`);
                break;

            default:
                bot.sendMessage(msg.chat.id, "❌ Lệnh không hợp lệ! Dùng `/banking` để xem hướng dẫn.");
                break;
        }
    }
};