const axios = require('axios');

module.exports = {
    name: "qr",
    description: "Tạo hoặc quét mã QR từ link hoặc ảnh",
    async execute(bot, msg, args) {
        if (args.length > 0) {
            // 📌 **Tạo mã QR từ link**
            const link = args.join(" ");
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
            bot.sendPhoto(msg.chat.id, qrUrl, { caption: `✅ **Mã QR cho:**\n${link}` });
        } else if (msg.reply_to_message && msg.reply_to_message.photo) {
            // 📌 **Quét QR từ ảnh**
            const photo = msg.reply_to_message.photo.pop();
            const fileId = photo.file_id;
            
            try {
                const file = await bot.getFile(fileId);
                const filePath = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

                bot.sendMessage(msg.chat.id, "🔍 **Đang quét mã QR...**");

                const response = await axios.post("https://api.qrserver.com/v1/read-qr-code/", null, {
                    params: { fileurl: filePath }
                });

                const qrData = response.data[0]?.symbol[0]?.data;
                bot.sendMessage(msg.chat.id, qrData ? `📜 **Nội dung QR:**\n${qrData}` : "❌ **Không đọc được mã QR!**");
            } catch (error) {
                console.error(error);
                bot.sendMessage(msg.chat.id, "❌ **Lỗi khi quét mã QR!**");
            }
        } else {
            bot.sendMessage(msg.chat.id, "📌 **Hướng dẫn sử dụng:**\n- `qr <link>` để tạo mã QR từ link.\n- **Hoặc** reply ảnh QR và nhập lệnh `qr` để quét.");
        }
    }
};
