const fs = require("fs");
const axios = require("axios");

const IMGUR_CLIENT_ID = "622f03397d4c890"; // Thay bằng Client ID của bạn

async function uploadToImgur(filePath) {
    try {
        const fileData = fs.readFileSync(filePath);

        const response = await axios.post("https://api.imgur.com/3/upload", {
            image: fileData.toString("base64"),
            type: "base64"
        }, {
            headers: {
                Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
            }
        });

        return response.data.data.link;
    } catch (error) {
        console.error("❌ Lỗi upload Imgur:", error.response?.data || error.message);
        return null;
    }
}

module.exports = {
    name: "imgur",
    description: "📤 Upload ảnh/video lên Imgur.",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;

        // Kiểm tra nếu người dùng KHÔNG reply tin nhắn
        if (!msg.reply_to_message) {
            return bot.sendMessage(chatId, 
                "📢 **Hãy reply một tin nhắn chứa ảnh hoặc video để upload lên Imgur.**\n\n" +
                "🔹 **Lưu ý:**\n" +
                "✅ Dung lượng tối đa: **200MB**\n" +
                "✅ Video phải dưới **60 giây**"
            );
        }

        let fileMessage = msg.reply_to_message;

        // Kiểm tra nếu tin nhắn được reply có chứa ảnh, video hoặc file
        if (!fileMessage.photo && !fileMessage.video && !fileMessage.document) {
            return bot.sendMessage(chatId, "🚫 Tin nhắn bạn reply không chứa ảnh/video hợp lệ.");
        }

        const file = fileMessage.photo ? fileMessage.photo[fileMessage.photo.length - 1] : fileMessage.video || fileMessage.document;
        const fileId = file.file_id;

        try {
            const fileInfo = await bot.getFile(fileId);
            const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;
            const filePath = `./temp/${fileInfo.file_path.split('/').pop()}`;

            const response = await axios({ url: fileUrl, responseType: "stream" });
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            writer.on("finish", async () => {
                const imgurLink = await uploadToImgur(filePath);
                fs.unlinkSync(filePath);

                if (imgurLink) {
                    bot.sendMessage(chatId, `✅ **Upload thành công!**\n📎 Link: ${imgurLink}`);
                } else {
                    bot.sendMessage(chatId, "❌ Không thể upload lên Imgur.");
                }
            });

        } catch (error) {
            console.error("❌ Lỗi tải file từ Telegram:", error);
            bot.sendMessage(chatId, "❌ Không thể tải file từ Telegram.");
        }
    }
};
