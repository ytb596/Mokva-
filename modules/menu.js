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

            if (command.name && command.description) {
                commandList.push(`<b>/${command.name}</b> - ${command.description}`);
            }
        }

        // Nếu danh sách lệnh quá dài, chia nhỏ tin nhắn thành nhiều phần
        const chunkSize = 4000; // Telegram giới hạn 4096 ký tự, trừ khoảng cách an toàn
        let messageChunks = [];
        let currentChunk = "";

        commandList.forEach((cmd) => {
            if ((currentChunk + cmd).length > chunkSize) {
                messageChunks.push(currentChunk);
                currentChunk = "";
            }
            currentChunk += cmd + "\n";
        });

        if (currentChunk.length > 0) {
            messageChunks.push(currentChunk);
        }

        // Gửi từng phần của danh sách lệnh
        for (const chunk of messageChunks) {
            await bot.sendMessage(chatId, menuMessage + chunk + "\n━━━━━━━━━━━━━━━━━━━", {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });
        }
    }
};
