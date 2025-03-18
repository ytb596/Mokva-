const fs = require("fs");

module.exports = {
    name: "menu",
    description: "📜 Hiển thị toàn bộ danh sách lệnh",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        let menuMessage = "🌟 <b>DANH SÁCH LỆNH VÀ DỊCH VỤ</b>\n━━━━━━━━━━━━━━━━━━━\n\n";

        // Đọc danh sách file trong thư mục modules/
        const commandFiles = fs.readdirSync("./modules").filter(file => file.endsWith(".js"));

        let commandList = [];

        for (const file of commandFiles) {
            const command = require(`../modules/${file}`);

            if (command.name) {
                let cmdText = `<b>/${command.name}</b>`;
                if (command.description) cmdText += ` - ${command.description}`;
                commandList.push(cmdText);
            }
        }

        // Chia nhỏ tin nhắn nếu quá dài
        const chunkSize = 4000; // Telegram giới hạn 4096 ký tự
        let messageChunks = [];
        let currentChunk = menuMessage;

        commandList.forEach((cmd) => {
            if ((currentChunk.length + cmd.length) > chunkSize) {
                messageChunks.push(currentChunk + "\n━━━━━━━━━━━━━━━━━━━");
                currentChunk = "";
            }
            currentChunk += cmd + "\n";
        });

        if (currentChunk.length > 0) {
            messageChunks.push(currentChunk + "\n━━━━━━━━━━━━━━━━━━━");
        }

        // Gửi từng phần của danh sách lệnh
        for (const chunk of messageChunks) {
            await bot.sendMessage(chatId, chunk, {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });
        }
    }
};