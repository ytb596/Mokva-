const fs = require("fs");

module.exports = {
    name: "menu",
    description: "📜 Hiển thị danh sách lệnh bot",
    execute: (bot, msg) => {
        const chatId = msg.chat.id;
        const commandFiles = fs.readdirSync("./modules").filter(file => file.endsWith(".js"));

        let menuText = `Xin Chào ${msg.from.first_name}

🔖 *Dưới Đây Là Danh Sách Lệnh Bạn Có Thể Dùng:*

➖➖➖➖➖➖➖➖➖➖➖

┌─────⭓ *DANH SÁCH LỆNH*  
├────────────────────┐\n`;

        commandFiles.forEach(file => {
            const command = require(`../modules/${file}`);
            menuText += `│○ /${command.name} : ${command.description || "Không có mô tả"}\n`;
        });

        menuText += "└────────────────────⧕\n\n💭 *LƯU Ý:* Bấm vào các lệnh để xem hướng dẫn sử dụng.";

        bot.sendMessage(chatId, menuText, { parse_mode: "HTML" });
    }
};
