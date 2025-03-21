const fs = require("fs");
const crypto = require("crypto");

const USERS_FILE = "./users.json";
const TOKEN_FILE = "./daily_token.json"; // Lưu trữ Token hàng ngày
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 giờ
const MIN_AMOUNT = 30000;
const MAX_AMOUNT = 70000;

module.exports = {
    name: "daily",
    description: "🎁 Nhận tiền hàng ngày (chỉ 1 người có Token hợp lệ)",
    execute(bot, msg, args) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const username = msg.from.username || msg.from.first_name;

        // Đọc dữ liệu users.json
        let users;
        try {
            users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
        } catch (error) {
            users = {};
        }

        // Đọc dữ liệu Token từ file
        let dailyTokenData;
        try {
            dailyTokenData = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8"));
        } catch (error) {
            dailyTokenData = {};
        }

        const today = new Date().toDateString();

        // Nếu chưa có Token hoặc Token đã hết hạn, tạo Token mới
        if (!dailyTokenData.date || dailyTokenData.date !== today) {
            const newToken = crypto.randomBytes(16).toString("hex"); // Tạo Token mới
            const luckyUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]; // Chọn ngẫu nhiên 1 người

            dailyTokenData = {
                date: today,
                token: newToken,
                userId: luckyUserId,
                used: false
            };

            fs.writeFileSync(TOKEN_FILE, JSON.stringify(dailyTokenData, null, 2));

            if (luckyUserId) {
                bot.sendMessage(luckyUserId, `🎉 Bạn là người may mắn hôm nay!\n🔑 Token Daily của bạn: \`${newToken}\`\n⚡ Sử dụng ngay với lệnh: \`/daily <TOKEN>\``, { parse_mode: "Markdown" });
            }
        }

        // Nếu không có Token hoặc người dùng không phải là người được chọn
        if (dailyTokenData.userId !== userId) {
            return bot.sendMessage(chatId, "❌ Hôm nay bạn không có quyền nhận tiền! Hãy chờ ngày mai.");
        }

        // Kiểm tra nếu không có Token hoặc Token đã được sử dụng
        if (dailyTokenData.used) {
            return bot.sendMessage(chatId, "⏳ Token đã được sử dụng hôm nay! Hãy thử lại vào ngày mai.");
        }

        // Kiểm tra cú pháp lệnh
        if (args.length < 1) {
            return bot.sendMessage(chatId, "⚠️ Bạn cần nhập Token để nhận tiền!\n🔹 Dùng: `/daily <TOKEN>`", { parse_mode: "Markdown" });
        }

        const userToken = args[0];

        // Kiểm tra Token có hợp lệ không
        if (userToken !== dailyTokenData.token) {
            return bot.sendMessage(chatId, "❌ Token không hợp lệ! Hãy kiểm tra lại.");
        }

        // Nếu người dùng chưa có trong danh sách, tạo mới
        if (!users[userId]) {
            users[userId] = {
                username: username,
                xu: 0
            };
        }

        // Tạo số tiền ngẫu nhiên cố định theo ngày
        const hash = crypto.createHash("sha256").update(today).digest("hex");
        const randomValue = parseInt(hash.substring(0, 8), 16) % (MAX_AMOUNT - MIN_AMOUNT + 1) + MIN_AMOUNT;

        // Cộng tiền cho người dùng
        users[userId].xu += randomValue;
        dailyTokenData.used = true; // Đánh dấu Token đã sử dụng

        // Lưu lại dữ liệu
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        fs.writeFileSync(TOKEN_FILE, JSON.stringify(dailyTokenData, null, 2));

        // Gửi thông báo thành công
        bot.sendMessage(chatId, `🎉 **Nhận quà thành công!**\n💰 **Bạn nhận được:** ${randomValue.toLocaleString()} Xu\n🔑 **Token hợp lệ!**\n📆 **Hẹn gặp lại vào ngày mai!**`, { parse_mode: "Markdown" });
    }
};
