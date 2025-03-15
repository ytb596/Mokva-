const fs = require("fs");

const usersFile = "./modules/users.json";
const codesFile = "./modules/giftcodes.json";

// Hàm chuyển đổi thời gian (VD: "10m" => 600000 ms)
function parseDuration(time) {
    const timeMap = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
    const match = time.match(/^(\d+)([smhd])(?:\s*(GMT[+-]?\d{1,2}|UTC))?$/);
    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const timezone = match[3] || "UTC"; // Mặc định UTC nếu không có

    return { duration: value * timeMap[unit], timezone };
}

// Hàm tạo mã ngẫu nhiên
function generateCode(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
}

// Chuyển đổi giờ UTC sang múi giờ cụ thể
function convertToTimezone(timestamp, timezone) {
    const offset = timezone.startsWith("GMT") ? parseInt(timezone.replace("GMT", ""), 10) : 0;
    return new Date(timestamp + offset * 60 * 60 * 1000);
}

module.exports = {
    name: "taocode",
    execute: async (bot, msg, args) => {
        const userId = msg.from.id.toString();
        const adminId = "8014033911"; // ID admin

        if (userId !== adminId) {
            return bot.sendMessage(msg.chat.id, "❌ Bạn không có quyền tạo mã quà tặng.");
        }

        // Kiểm tra giá trị xu hợp lệ
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) {
            return bot.sendMessage(msg.chat.id, "❌ Vui lòng nhập số xu hợp lệ.");
        }

        // Kiểm tra thời gian hết hạn (VD: `1h GMT+7`)
        const timeArg = args[1] || "1h UTC"; // Mặc định là 1 giờ UTC
        const parsedTime = parseDuration(timeArg);
        if (!parsedTime) {
            return bot.sendMessage(msg.chat.id, "❌ Vui lòng nhập thời gian hợp lệ (VD: `10m UTC`, `1h GMT+7`, `2d GMT-5`).");
        }

        const { duration, timezone } = parsedTime;
        const expiresAt = Date.now() + duration;
        const formattedExpiresAt = convertToTimezone(expiresAt, timezone).toLocaleString("en-US", { timeZone: "UTC" });

        // Kiểm tra số lượng người có thể nhập
        const maxUses = parseInt(args[2]) || 1; // Mặc định 1 người dùng

        if (isNaN(maxUses) || maxUses <= 0) {
            return bot.sendMessage(msg.chat.id, "❌ Vui lòng nhập số lượng người có thể nhập hợp lệ.");
        }

        // Tạo mã quà tặng
        const code = generateCode(8);

        // Đọc danh sách mã cũ (nếu có)
        let codes = {};
        if (fs.existsSync(codesFile)) {
            try {
                codes = JSON.parse(fs.readFileSync(codesFile, "utf-8"));
            } catch (error) {
                return bot.sendMessage(msg.chat.id, "❌ Lỗi khi đọc dữ liệu mã quà tặng.");
            }
        }

        // Lưu mã mới
        codes[code] = {
            value: amount,
            expiresAt: expiresAt, // Thời gian hết hạn theo UTC
            formattedExpiresAt, // Định dạng dễ đọc
            timezone, // Múi giờ được chọn
            maxUses: maxUses, // Số lần tối đa có thể sử dụng
            uses: 0 // Số lần đã sử dụng
        };

        // Ghi vào file
        try {
            fs.writeFileSync(codesFile, JSON.stringify(codes, null, 2));
        } catch (error) {
            return bot.sendMessage(msg.chat.id, "❌ Lỗi khi lưu mã quà tặng.");
        }

        bot.sendMessage(
            msg.chat.id,
            `🎁 Mã quà tặng đã được tạo: \`${code}\`\n💰 Giá trị: ${amount} xu\n⏳ Hết hạn vào: ${formattedExpiresAt} (${timezone})\n👥 Số người có thể nhập: ${maxUses}`
        );
    }
};
