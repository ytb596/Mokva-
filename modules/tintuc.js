const axios = require('axios'); // Thư viện HTTP để gửi yêu cầu

module.exports = {
    name: 'tintuc',
    description: 'Nhận tin tức từ các báo Việt Nam qua News API',
    async execute(bot, msg, args) {
        // Kiểm tra xem người dùng có nhập từ khóa tìm kiếm không
        let query = args.join(' ') || 'Việt Nam'; // Nếu không nhập từ khóa, mặc định tìm kiếm về "Việt Nam"

        // Tạo URL với News API
        const apiKey = '8b76b89d26dc4c76bad254864c712cef'; // Thay 'YOUR_API_KEY' bằng API key của bạn
        const url = `https://newsapi.org/v2/everything?q=${query}&language=vi&pageSize=5&apiKey=${apiKey}`;

        try {
            // Gửi yêu cầu đến News API
            const response = await axios.get(url);

            if (response.data.articles.length === 0) {
                return bot.sendMessage(msg.chat.id, 'Không tìm thấy tin tức nào về chủ đề này!');
            }

            // Lấy thông tin các bài viết
            const articles = response.data.articles;

            // Tạo thông điệp để gửi cho người dùng
            let message = '🔔 Tin tức mới nhất:\n\n';

            articles.forEach(article => {
                message += `**Tiêu đề:** ${article.title}\n`;
                message += `**Nguồn:** ${article.source.name}\n`;
                message += `**Mô tả:** ${article.description || 'Không có mô tả'}\n`;
                message += `**Link:** [Đọc thêm](${article.url})\n\n`;
            });

            // Gửi tin nhắn cho người dùng
            bot.sendMessage(msg.chat.id, message);
        } catch (error) {
            console.error(error);
            bot.sendMessage(msg.chat.id, 'Có lỗi xảy ra khi lấy tin tức. Vui lòng thử lại sau!');
        }
    }
};
