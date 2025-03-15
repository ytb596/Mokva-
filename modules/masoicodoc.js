const axios = require("axios");

module.exports = {
    name: "masoicodoc",
    description: "🐺 Ma sói cô độc quay tay vận may!",
    async execute(bot, msg) {
        const chatId = msg.chat.id;

        // Gửi xúc xắc để quay may mắn 🎲
        bot.sendDice(chatId, { emoji: "🎲" }).then(async (result) => {
            setTimeout(async () => {
                const value = result.dice.value;

                if (value >= 4) {
                    // 🎉 May mắn -> Gửi ảnh gái xinh
                    try {
                        const response = await axios.get("https://api.waifu.pics/sfw/waifu");
                        const imgUrl = response.data.url;
                        bot.sendPhoto(chatId, imgUrl, { caption: "🔥 Bạn thật may mắn! Đây là quà của bạn. 😉" });
                    } catch (error) {
                        bot.sendMessage(chatId, "🚫 Lỗi tải ảnh, nhưng vẫn chúc bạn may mắn!");
                    }
                } else {
                    // 🤡 Xui xẻo -> Chế giễu
                    const loserMessages = [
                        "😔 Đúng là **ma sói cô độc**, không có gái đâu!",
                        "🤡 Quay lại lần sau đi, số này là **nghiệp chướng**!",
                        "👻 Lần này thì xui rồi, thử tiếp xem có gái không? 😂",
                        "😹 Ế bền vững, chuẩn **ma sói** không lệch phát nào!"
                    ];
                    const randomMessage = loserMessages[Math.floor(Math.random() * loserMessages.length)];
                    bot.sendMessage(chatId, `🎲 **Kết quả: ${value}**\n${randomMessage}`);
                }
            }, 3000);
        });
    }
};
