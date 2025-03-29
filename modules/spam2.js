const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const moment = require("moment"); // Dùng moment.js để format thời gian

const decScriptPath = "/data/data/com.termux/files/home/mokva/dec.py";
const videoPath = "/data/data/com.termux/files/home/Bot\\ Tele/data_api/vdgai/video.mp4"; // Đổi video nếu muốn

module.exports = {
    name: "spam",
    description: "spam số điện thoai",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const username = msg.from.username || msg.from.first_name; // Lấy tên người dùng

        // Kiểm tra cú pháp lệnh
        if (args.length < 2) {
            return bot.sendMessage(chatId, "⚠️ Sai cú pháp! Sử dụng: `/spam <số điện thoại> <số lượng>`");
        }

        const phoneNumber = args[0];
        const count = parseInt(args[1]);

        // Kiểm tra số điện thoại và số lượng hợp lệ
        if (!/^\d{9,15}$/.test(phoneNumber)) {
            return bot.sendMessage(chatId, "❌ Số điện thoại không hợp lệ!");
        }
        if (isNaN(count) || count <= 0) {
            return bot.sendMessage(chatId, "❌ Số lượng phải là một số dương!");
        }
        if (count > 50) {
            return bot.sendMessage(chatId, "❌ Bạn chỉ có thể gửi tối đa **50** OTP mỗi lần!");
        }

        // Ẩn phần cuối số điện thoại (ví dụ: 0987654321 -> 098****321)
        const hiddenPhone = phoneNumber.slice(0, 3) + "****" + phoneNumber.slice(-3);

        // Thời gian gửi
        const currentTime = moment().format("DD/MM/YYYY HH:mm:ss");
        const cooldownTime = 120; // Thời gian chờ trong giây

        // Hiển thị thông tin SPAM AMATEUR
        const spamMessage = `  
======[ 𝙎𝙋𝘼𝙈 𝘼𝙈𝘼𝙏𝙀𝙐𝙍 ]======  
          
    🕵️‍♂️ **Số điện thoại mục tiêu:**  
      ├─> ${hiddenPhone}  
      ├─────────────⭔  
    ⏳ **Thời gian gửi:**  
      ├─> ${currentTime}  
      ├─────────────⭔  
    💥 **Thời gian chờ (Cooldown):**  
      ├─> ${cooldownTime} giây  
      ├─────────────⭔  
    🔁 **Số lần tấn công lặp lại:**  
      ├─> ${count} lần  
      ├─────────────⭔  
        `;  

        bot.sendMessage(chatId, spamMessage, { parse_mode: "Markdown" });

        // Gọi Dec.py từ ngoài thư mục bot
        exec(`python3 ${decScriptPath} ${phoneNumber} ${count}`, (error, stdout, stderr) => {
            if (error) {
                return bot.sendMessage(chatId, `❌ Lỗi khi chạy Dec.py:\n\`${error.message}\``);
            }
            if (stderr) {
                return bot.sendMessage(chatId, `⚠️ Cảnh báo từ Dec.py:\n\`${stderr}\``);
            }

            // Nếu số lượng gửi >= 5, dừng Dec.py
            if (count >= 5) {
                exec(`pkill -f "${decScriptPath}"`, (killError) => {
                    if (killError) {
                        return bot.sendMessage(chatId, "⚠️ Không thể dừng Dec.py, có thể nó đã kết thúc.");
                    }
                    bot.sendMessage(chatId, "🛑 Đã gửi đủ OTP, dừng Dec.py thành công!");
                });
            }

            // **Gửi video cố định** nếu tồn tại
            if (fs.existsSync(videoPath)) {
                bot.sendVideo(chatId, videoPath, { caption: "🎥 Đây là video cố định!" });
            }
        });
    }
};
