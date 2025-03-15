module.exports = {
    name: 'giafb',
    description: 'Xem giá tài khoản Facebook',
    execute(bot, msg, args) {
        if (args.length < 2) {
            return bot.sendMessage(msg.chat.id, "📌 Hãy nhập năm tạo tài khoản và số lượng bạn bè!\n\nVí dụ: `giafb 2015 4000`");
        }

        let year = parseInt(args[0]);
        let friends = parseInt(args[1]);

        if (isNaN(year) || isNaN(friends)) {
            return bot.sendMessage(msg.chat.id, "❌ Dữ liệu không hợp lệ! Hãy nhập năm (4 số) và số lượng bạn bè.");
        }

        let price = "🛑 Không thể định giá tài khoản này!";
        
        if (year >= 2011 && year <= 2017) {
            price = "💰 Giá trị khoảng: *200,000 - 2,000,000 VNĐ*";
            if (friends > 5000) price += "\n📈 (Acc nhiều bạn có thể cao hơn!)";
        } else if (year >= 2018) {
            price = "💰 Giá trị khoảng: *50,000 - 500,000 VNĐ*";
            if (friends > 5000) price += "\n📈 (Acc nhiều bạn có thể cao hơn!)";
        } else {
            price = "⚠️ Tài khoản quá mới hoặc không có giá trị!";
        }

        bot.sendMessage(msg.chat.id, `📖 **Giá tài khoản Facebook:**\n🎂 **Năm tạo:** ${year}\n👥 **Bạn bè:** ${friends}\n${price}`);
    }
};
