module.exports = {
    name: "tool1",
    description: "Hiển thị 2 link ẩn, chỉ khi nhấn vào mới mở.",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // 2 link cố định
        const link1 = "https://www.mediafire.com/file/9xug4wkya10c32s/gopvip.py/file";
        const link2 = "https://dichvukey.site/";

        // Tạo các nút bấm chứa link
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "📍 Link 1", url: link1 }],
                    [{ text: "📍 Link 2", url: link2 }]
                ]
            }
        };

        // Gửi tin nhắn với các nút bấm
        bot.sendMessage(chatId, "🔗 **tool của bạn Đây:**", options);
    }
};
