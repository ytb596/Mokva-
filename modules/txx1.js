const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const botTokenSecondary = '8170107416:AAHcBBkltzYQ44XMvMvb3gc3ktNkZgPPGRw'; // Token bot phụ
const botSecondary = new TelegramBot(botTokenSecondary, { polling: true });

// ID và link của group chat cố định
const fixedChatId = '1002624604645'; // Thay bằng ID nhóm
const groupLink = 'https://t.me/+kA7nfEhfym8xN2Rl'; // Thay bằng link nhóm

// Đường dẫn file lưu dữ liệu người chơi
const usersFile = './modules/users.json';

// Đọc dữ liệu người chơi từ users.json
function getUserData(userId) {
    if (!fs.existsSync(usersFile)) return null;
    const data = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    return data[userId] || null;
}

// Cập nhật dữ liệu người chơi trong users.json
function updateUserData(userId, userData) {
    let data = {};
    if (fs.existsSync(usersFile)) {
        data = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    }
    data[userId] = userData;
    fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "txx1",
    description: "Chơi Tài Xỉu V2 với Token bot phụ",
    execute: async (botMain, msg, args) => {
        const userId = msg.from.id.toString();  // Chuyển ID sang string
        const username = msg.from.username || msg.from.first_name;
        const betChoice = args[0] && (args[0].toLowerCase() === "tài" || args[0].toLowerCase() === "xỉu") ? args[0].toLowerCase() : null;
        const betAmount = args[1] ? parseInt(args[1]) : 0;

        if (!betChoice) {
            return botMain.sendMessage(msg.chat.id, "⚠️ Vui lòng chọn Tài hoặc Xỉu. Ví dụ: /txx1 tài hoặc /txx1 xỉu.");
        }

        if (betAmount <= 0) {
            return botMain.sendMessage(msg.chat.id, "⚠️ Bạn phải nhập số xu cược hợp lệ.");
        }

        let userData = getUserData(userId);
        if (!userData) {
            userData = { username, xu: 1000 };  // Người chơi mới, mặc định có 1000 xu
        }

        // Kiểm tra số dư
        if (userData.xu < betAmount) {
            return botMain.sendMessage(msg.chat.id, `⚠️ Bạn không đủ xu để cược. Bạn chỉ có ${userData.xu} xu.`);
        }

        // Trừ xu khi cược
        userData.xu -= betAmount;

        // Quay Tài Xỉu
        try {
            const roll = Math.random() < 0.5 ? "tài" : "xỉu"; // Xác suất 50-50
            const result = roll === betChoice ? "thắng" : "thua";

            let message = `🎲 **Kết quả Tài Xỉu**: ${roll.toUpperCase()}\n`;
            message += `💰 Bạn chọn: ${betChoice.toUpperCase()}\n`;

            if (result === "thắng") {
                const winnings = betAmount * 2;  // Thắng nhận gấp đôi số tiền cược
                userData.xu += winnings;
                message += `🏆 **Chúc mừng! Bạn thắng!**\n`;
                message += `🎉 Bạn nhận được ${winnings} xu!\n`;
            } else {
                message += `😞 **Rất tiếc, bạn thua!**\n`;
                message += `💔 Bạn đã mất ${betAmount} xu!\n`;
            }

            // Cập nhật dữ liệu
            updateUserData(userId, userData);

            // Gửi kết quả lên group chat cố định bằng bot phụ
            botSecondary.sendMessage(fixedChatId, message);

            // Ngay lập tức gửi link nhóm để người dùng tham gia
            botMain.sendMessage(msg.chat.id, `🔔 **Tham gia nhóm chat để theo dõi kết quả**: [Nhấn vào đây](${groupLink})`, { parse_mode: "Markdown" });

        } catch (error) {
            botMain.sendMessage(msg.chat.id, "❌ Đã có lỗi xảy ra, vui lòng thử lại sau!");
            console.error("[Tài Xỉu ERROR]", error);
        }
    }
};
