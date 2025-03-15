module.exports = {
    name: "quayso",
    description: "🎰 Quay số may mắn với máy đánh bạc!",
    execute(bot, msg) {
        const chatId = msg.chat.id;
        
        // Gửi biểu tượng 🎰 để quay số
        bot.sendDice(chatId, { emoji: "🎰" }).then(result => {
            setTimeout(() => {
                const value = result.dice.value;

                // Kết quả từ Telegram (1-64), trong đó 22, 43, 64 là thắng
                if (value === 22 || value === 43 || value === 64) {
                    bot.sendMessage(chatId, `🎉 Chúc mừng! Bạn đã thắng với số **${value}**! 🚀`);
                } else {
                    const loserMessages = [
                        "💀 Thua rồi! Đừng cay cú nhé... 😭",
                        "🤡 Vận đen thôi mà, nghỉ ngơi chút đi!",
                        "🎭 Lần sau có thể may mắn hơn... hoặc không! 🤔",
                        "⏳ Thua nữa là phá sản đấy, cẩn thận nha! 💸",
                        "🔴 Nhìn mà xem, may mắn không đứng về phía bạn đâu...!"
                    ];
                    const randomMessage = loserMessages[Math.floor(Math.random() * loserMessages.length)];
                    bot.sendMessage(chatId, `🎰 **Số quay: ${value}**\n${randomMessage}`);
                }
            }, 3000); // Chờ 3 giây rồi phản hồi kết quả
        });
    }
};
