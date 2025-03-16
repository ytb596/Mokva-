const fs = require("fs");  
const usersFile = "./modules/users.json";  
  
module.exports = {  
    name: "txx",  
    execute: async (bot, msg, args) => {  
        const userId = msg.from.id.toString();  
  
        // Kiểm tra file users.json, nếu chưa có thì tạo mới  
        if (!fs.existsSync(usersFile)) {  
            fs.writeFileSync(usersFile, "{}");  
        }  
  
        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));  
  
        // Kiểm tra xem user đã đăng ký chưa  
        if (!users[userId]) {  
            return bot.sendMessage(msg.chat.id, "❌ Bạn chưa đăng ký tài khoản! Gõ /dangky để đăng ký.");  
        }  
  
        // Kiểm tra số xu cược và lựa chọn chế độ chơi  
        const betAmount = parseInt(args[0]);  
        const choice = args[1]?.toUpperCase(); // Lựa chọn Tài (T) hoặc Xỉu (X)  
        const mode = args[2]?.toLowerCase(); // Chế độ chơi: ván, đôi, v.v.  
          
        if (isNaN(betAmount) || betAmount <= 0) {  
            return bot.sendMessage(msg.chat.id, "❌ Vui lòng nhập số xu muốn cược! Ví dụ: `txx 500 T ván`", { parse_mode: "Markdown" });  
        }  
  
        if (!choice || (choice !== "T" && choice !== "X")) {  
            return bot.sendMessage(msg.chat.id, "❌ Vui lòng chọn **Tài (T)** hoặc **Xỉu (X)**! Ví dụ: `txx 500 T ván`", { parse_mode: "Markdown" });  
        }  
  
        if (users[userId].xu < betAmount) {  
            return bot.sendMessage(msg.chat.id, "❌ Bạn không đủ xu để đặt cược!");  
        }  
  
        // Gửi hiệu ứng quay xúc xắc  
        const dice1 = await bot.sendDice(msg.chat.id, { emoji: "🎲" });  
        const dice2 = await bot.sendDice(msg.chat.id, { emoji: "🎲" });  
        const dice3 = await bot.sendDice(msg.chat.id, { emoji: "🎲" });  
  
        // Chờ 3 giây để bot nhận kết quả  
        setTimeout(() => {  
            const result = dice1.dice.value + dice2.dice.value + dice3.dice.value;  
  
            // Xóa xúc xắc sau 5 giây  
            setTimeout(() => {  
                bot.deleteMessage(msg.chat.id, dice1.message_id);  
                bot.deleteMessage(msg.chat.id, dice2.message_id);  
                bot.deleteMessage(msg.chat.id, dice3.message_id);  
            }, 5000);  // Sau 5 giây  
  
            let resultText = `🎲 Tổng: ${result} → `;  
            let win = false;  
  
            // Tính toán kết quả Tài/Xỉu dựa trên tổng  
            if (result >= 11) {  
                resultText += `✨ **Tài** ⚪🔴⚫`;  
                if (choice === "T") win = true;   
            } else {  
                resultText += `🌙 **Xỉu** ⚫🔴⚪`;  
                if (choice === "X") win = true;  
            }  
  
            // Tính toán số xu thắng/thua  
            if (win) {  
                users[userId].xu += betAmount * 2;  // Thắng nhận gấp đôi số xu cược  
                resultText += `\n🎉 Bạn **thắng** ${betAmount * 2} xu! 💰\n\n🥳 **Chúc mừng bạn đã chiến thắng!**\n👉 **Số dư hiện tại**: ${users[userId].xu} xu\n🔊 *Âm thanh chiến thắng: "Yay!"*`;  
            } else {  
                users[userId].xu -= betAmount;  // Thua mất toàn bộ số xu cược  
                resultText += `\n💀 Bạn **thua** ${betAmount} xu... 😢\n\n😞 **Đừng buồn, cơ hội tiếp theo sẽ là của bạn!**\n👉 **Số dư hiện tại**: ${users[userId].xu} xu\n🔊 *Âm thanh thua: "Oh no!"*`;  
            }  
  
            // Thêm hiệu ứng chế độ chơi  
            if (mode === "ván") {  
                resultText += "\n🔁 Bạn đã chơi trong chế độ 'Ván'. Còn bao nhiêu lượt cược? Thử lại nhé!";  
            } else if (mode === "doi") {  
                resultText += "\n👥 Chế độ 'Đôi' bắt đầu! Bạn và người bạn đồng hành sẽ cùng thi đấu!";  
            } else {  
                resultText += "\n❓ Bạn đang chơi chế độ mặc định!";  
            }  
  
            // Lưu lại dữ liệu sau khi cược  
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));  
  
            // Gửi kết quả cuối cùng cho người chơi  
            bot.sendMessage(msg.chat.id, resultText, { parse_mode: "Markdown" });  
  
            // Gửi thêm các hiệu ứng đặc biệt (ví dụ: emoji động)  
            const emojiEffect = win ? "🎉✨🥳" : "💀😢😞";  
            bot.sendMessage(msg.chat.id, `**Hiệu ứng đặc biệt:** ${emojiEffect}`, { parse_mode: "Markdown" });  
        }, 3000);  // Quá trình quay xúc xắc kéo dài 3 giây  
    }  
};
