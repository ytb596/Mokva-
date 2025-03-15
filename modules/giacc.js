module.exports = {
    name: 'giacc',
    description: 'Xem giá tài khoản Free Fire từ level 8 trở lên',
    execute(bot, msg, args) {
        if (!args.length) {
            return bot.sendMessage(msg.chat.id, "📌 Hãy nhập level của tài khoản Free Fire!");
        }

        let level = parseInt(args[0]);

        if (isNaN(level) || level < 1) {
            return bot.sendMessage(msg.chat.id, "❌ Level không hợp lệ! Hãy nhập số nguyên dương.");
        }

        let price = "🛑 Level quá thấp, không thể định giá!";
        if (level >= 8 && level <= 10) {
            price = "💰 Giá trị khoảng: *8,000 - 15,000 VNĐ*";
        } else if (level >= 11 && level <= 20) {
            price = "💰 Giá trị khoảng: *15,000 - 50,000 VNĐ*";
        } else if (level >= 21) {
            price = "💰 Giá trị khoảng: *50,000 - 90,000 VNĐ* (Tùy vào skin & thông tin acc)";
        }

        bot.sendMessage(msg.chat.id, `🎮 **Giá tài khoản Free Fire (Level ${level}):**\n${price}`);
    }
};
