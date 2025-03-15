const fs = require("fs");

module.exports = {
    name: "start",
    description: "📜 Hiển thị danh sách lệnh và dịch vụ",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        let menuMessage = "🌟 **DANH SÁCH LỆNH VÀ DỊCH VỤ**\n━━━━━━━━━━━━━━━━━━━\n\n";

        // Đọc danh sách file trong thư mục modules/
        const commandFiles = fs.readdirSync("./modules").filter(file => file.endsWith(".js"));
        
        let commandList = [];

        for (const file of commandFiles) {
            const command = require(`../modules/${file}`);

            if (command.name && command.description) {
                commandList.push(`• \`/${command.name}\` - ${command.description}`);
            }
        }

        menuMessage += commandList.join("\n") + "\n━━━━━━━━━━━━━━━━━━━";

        bot.sendMessage(chatId, menuMessage, {
            parse_mode: "HTML", // Sử dụng HTML để làm lệnh in đậm và dễ ấn
            disable_web_page_preview: true // Ẩn preview link nếu có
        });
    }
};
