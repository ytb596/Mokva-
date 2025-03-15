module.exports = {
    name: "uid",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const userName = msg.from.username || msg.from.first_name;
        const userId = msg.from.id;  // Lấy UID của người dùng

        console.log(`[LOG] User @${userName} (ID: ${userId}) đã thực hiện: /uid`);

        // Gửi UID của người dùng cho họ
        bot.sendMessage(chatId, `👤 **UID của bạn là:** ${userId}`);
    }
};
