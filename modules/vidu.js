module.exports = {
    name: "example",
    description: "📢 Gửi một ví dụ về cách bot hoạt động.",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "🚀 Đây là một lệnh ví dụ! Bạn có thể chỉnh sửa nó để làm bất cứ điều gì bạn muốn.");
    }
};
