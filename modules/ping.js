module.exports = {
    name: "ping",
    execute: async (bot, msg, args) => {
        const start = Date.now();
        const sentMessage = await bot.sendMessage(msg.chat.id, "🏓 Pong!");
        const end = Date.now();
        await bot.sendMessage(msg.chat.id, `⏱ Độ trễ: ${end - start}ms`);
    }
};
