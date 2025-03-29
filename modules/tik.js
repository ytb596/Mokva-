const axios = require("axios");

module.exports = {
    name: "tiksearch",
    description: "🔍 Tìm kiếm video TikTok dựa trên từ khóa và hiển thị link video.",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        
        // Kiểm tra cú pháp: yêu cầu người dùng nhập từ khóa
        if (args.length < 1) {
            return bot.sendMessage(chatId, "⚠️ Vui lòng nhập từ khóa tìm kiếm, ví dụ: `/tiksearch sad`", { parse_mode: "Markdown" });
        }
        
        const query = args.join(" ");
        const apiUrl = `https://api.sumiproject.net/tiktok?search=${encodeURIComponent(query)}`;
        
        try {
            const response = await axios.get(apiUrl);
            // Kiểm tra nếu API trả về lỗi hoặc không có dữ liệu video
            if (response.data.code !== 0 || !response.data.data || !response.data.data.videos) {
                return bot.sendMessage(chatId, "❌ Không tìm thấy video nào với từ khóa này.", { parse_mode: "Markdown" });
            }
            
            const videos = response.data.data.videos;
            if (!Array.isArray(videos) || videos.length === 0) {
                return bot.sendMessage(chatId, "❌ Không tìm thấy video nào với từ khóa này.", { parse_mode: "Markdown" });
            }
            
            // Tạo thông báo tóm tắt thông tin cho 5 video đầu tiên (nếu có)
            let messageText = `🔍 **Kết quả tìm kiếm cho từ khóa:** \`${query}\`\n\n`;
            videos.slice(0, 5).forEach((video, index) => {
                // Sử dụng trường "play" làm link video
                const videoLink = video.play;
                messageText += `**${index + 1}.** Video ID: \`${video.video_id}\`\n`;
                messageText += `   📃 **Tiêu đề:** ${video.title}\n`;
                messageText += `   ⏱ **Thời lượng:** ${video.duration} giây\n`;
                messageText += `   👀 **Lượt xem:** ${video.play_count}\n`;
                messageText += `   📺 **Link video:** [Xem video](${videoLink})\n\n`;
            });
            messageText += `_Tìm được ${videos.length} video_`;
            
            bot.sendMessage(chatId, messageText, { parse_mode: "Markdown" });
        } catch (error) {
            console.error("Lỗi khi gọi API tiksearch:", error);
            return bot.sendMessage(chatId, "❌ Đã xảy ra lỗi khi tìm kiếm video TikTok.", { parse_mode: "Markdown" });
        }
    }
};
