const fs = require("fs");
const usersFile = "./modules/users.json";

module.exports = {
    name: "nhantien",
    description: "Nhận tiền miễn phí mỗi 2 phút!",
    execute(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        // Kiểm tra nếu file dữ liệu người dùng chưa tồn tại thì tạo mới
        if (!fs.existsSync(usersFile)) {
            fs.writeFileSync(usersFile, "{}");
        }

        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

        // Kiểm tra xem người dùng đã đăng ký chưa
        if (!users[userId]) {
            return bot.sendMessage(chatId, "❌ Bạn chưa có tài khoản! Hãy nhập `/dangky` để đăng ký ngay.", { parse_mode: "Markdown" });
        }

        // Đặt số tiền nhận mỗi lần
        const receivedAmount = 1000; // Số tiền mỗi lần nhận

        // Cộng tiền vào tài khoản người dùng
        users[userId].xu += receivedAmount;

        // Lưu lại dữ liệu sau khi cộng tiền
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

        // Gửi thông báo cho người dùng
        bot.sendMessage(chatId, `🎉 Bạn đã nhận **${receivedAmount.toLocaleString("en-US")} xu** miễn phí! Hãy quay lại sau 2 phút để nhận thêm! 💸`);

        // Thiết lập lại lệnh nhận tiền sau mỗi 2 phút
        setInterval(() => {
            if (!users[userId]) return; // Kiểm tra người dùng đã đăng ký chưa

            users[userId].xu += receivedAmount;
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

            bot.sendMessage(chatId, `🎉 Bạn đã nhận thêm **${receivedAmount.toLocaleString("en-US")} xu** miễn phí! 💸`);
        }, 2 * 60 * 1000); // 2 phút (120,000ms)
    }
};
