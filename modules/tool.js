module.exports = {
    name: "tool",
    description: "Hiển thị link tải trang web.",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;
        const downloadUrl = "https://www.mediafire.com/file/0piy5fmx7j1c1mk/uhv2.py/file"; // Thay bằng link tải thực tế của bạn

        bot.sendMessage(chatId, `🔗 Link tải: [Nhấn vào đây](${downloadUrl})`, { parse_mode: "Markdown" });
    }
};
