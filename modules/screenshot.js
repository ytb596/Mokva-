
const axios = require('axios');

module.exports = {
    name: "screenshot",
    description: "📸 Chụp ảnh màn hình trang web",
    execute: async (bot, msg, args) => {
        if (!args[0]) {
            return bot.sendMessage(msg.chat.id, "❌ Vui lòng nhập URL website cần chụp!\nVí dụ: /screenshot https://google.com");
        }

        let url = args[0];
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        const waitMessage = await bot.sendMessage(msg.chat.id, "⏳ Đang chụp ảnh màn hình...");
        
        try {
            const response = await axios.get(`https://api.telegram.org/bot${bot.token}/getWebPagePreview?url=${encodeURIComponent(url)}`);
            
            if (response.data.ok && response.data.result.photo) {
                const photo = response.data.result.photo;
                await bot.sendPhoto(msg.chat.id, photo[photo.length - 1].file_id, {
                    caption: `🌐 Website: ${url}\n📸 Chụp thành công!`
                });
            } else {
                throw new Error("Không thể chụp ảnh màn hình");
            }
        } catch (error) {
            await bot.sendMessage(msg.chat.id, "❌ Có lỗi xảy ra khi chụp ảnh màn hình!");
        }

        await bot.deleteMessage(msg.chat.id, waitMessage.message_id);
    }
};
