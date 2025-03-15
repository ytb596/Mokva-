const fs = require("fs");

const usersFile = "./modules/users.json";
const codesFile = "./modules/giftcodes.json";

module.exports = {
    name: "gitcode",
    execute: async (bot, msg, args) => {
        const userId = msg.from.id.toString();
        const code = args[0]?.toUpperCase();

        if (!code) {
            return bot.sendMessage(msg.chat.id, "❌ Vui lòng nhập mã quà tặng.");
        }

        // Kiểm tra mã tồn tại
        if (!fs.existsSync(codesFile)) {
            return bot.sendMessage(msg.chat.id, "❌ Mã quà tặng không tồn tại.");
        }

        let codes;
        try {
            codes = JSON.parse(fs.readFileSync(codesFile, "utf-8"));
        } catch {
            return bot.sendMessage(msg.chat.id, "❌ Lỗi khi đọc dữ liệu mã quà tặng.");
        }

        const giftCode = codes[code];

        if (!giftCode) {
            return bot.sendMessage(msg.chat.id, "❌ Mã quà tặng không hợp lệ.");
        }

        // Kiểm tra thời gian hết hạn
        if (giftCode.expiresAt && Date.now() > giftCode.expiresAt) {
            return bot.sendMessage(msg.chat.id, "⏳ Mã quà tặng này đã hết hạn.");
        }

        // Kiểm tra số lần sử dụng tối đa
        if (giftCode.uses >= giftCode.maxUses) {
            return bot.sendMessage(msg.chat.id, "❌ Mã quà tặng đã đạt số lần sử dụng tối đa.");
        }

        // Kiểm tra người dùng đã đăng ký chưa
        if (!fs.existsSync(usersFile)) {
            return bot.sendMessage(msg.chat.id, "❌ Bạn chưa đăng ký tài khoản! Gõ `dangky` để đăng ký.");
        }

        let users;
        try {
            users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
        } catch {
            return bot.sendMessage(msg.chat.id, "❌ Lỗi khi đọc dữ liệu người dùng.");
        }

        if (!users[userId]) {
            return bot.sendMessage(msg.chat.id, "❌ Bạn chưa đăng ký tài khoản! Gõ `dangky` để đăng ký.");
        }

        // Kiểm tra người dùng đã nhập mã này chưa
        if (giftCode.redeemedBy?.includes(userId)) {
            return bot.sendMessage(msg.chat.id, "❌ Bạn đã sử dụng mã này rồi!");
        }

        // Nhận quà
        const reward = giftCode.value;
        users[userId].xu = (users[userId].xu || 0) + reward;
        giftCode.uses += 1;
        giftCode.redeemedBy = [...(giftCode.redeemedBy || []), userId]; // Lưu ID người đã nhận

        // Lưu file
        try {
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
            fs.writeFileSync(codesFile, JSON.stringify(codes, null, 2));
        } catch {
            return bot.sendMessage(msg.chat.id, "❌ Lỗi khi lưu dữ liệu.");
        }

        bot.sendMessage(msg.chat.id, `🎉 Bạn đã nhận ${reward} xu từ mã quà tặng! 💰 Số dư hiện tại: ${users[userId].xu} xu`);
    }
};