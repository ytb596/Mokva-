const axios = require("axios");

module.exports = {
    name: "tiktokinfo",
    description: "📲 Lấy thông tin tài khoản TikTok",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        if (args.length < 1) {
            return bot.sendMessage(chatId, "⚠️ Vui lòng nhập tên người dùng TikTok!\nVí dụ: `/tiktokinfo dungkon2002`", { parse_mode: "Markdown" });
        }

        const username = args[0];
        const apiUrl = `https://api.sumiproject.net/tiktok?info=${username}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.code !== 0 || !data.data) {
                return bot.sendMessage(chatId, "❌ Không tìm thấy tài khoản TikTok!", { parse_mode: "Markdown" });
            }

            const user = data.data.user;
            const stats = data.data.stats;

            const profileMessage = `
======[ 𝙏𝙄𝙆𝙏𝙊𝙆 𝙄𝙉𝙁𝙊 ]======  

👤 **Tên hiển thị:** ${user.nickname}  
🆔 **Username:** @${user.uniqueId}  
🔗 **Profile:** [Xem trên TikTok](https://www.tiktok.com/@${user.uniqueId})  

📊 **Thống kê:**  
├ 👥 **Người theo dõi:** ${stats.followerCount}  
├ 👤 **Đang theo dõi:** ${stats.followingCount}  
├ ❤️ **Tổng lượt thích:** ${stats.heartCount}  
├ 🎥 **Số video:** ${stats.videoCount}  

🔗 **Mạng xã hội khác:**  
${user.youtube_channel_id ? `▶️ [YouTube](https://www.youtube.com/channel/${user.youtube_channel_id})` : "🚫 Không có YouTube"}  
${user.signature ? `📌 **Bio:** ${user.signature}` : "🚫 Không có mô tả"}  
        `;

            bot.sendPhoto(chatId, user.avatarLarger, { caption: profileMessage, parse_mode: "Markdown" });

        } catch (error) {
            bot.sendMessage(chatId, "⚠️ Lỗi khi lấy thông tin tài khoản TikTok!", { parse_mode: "Markdown" });
            console.error(error);
        }
    }
};
