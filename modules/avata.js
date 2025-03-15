const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "avatar",
    description: "🎭 Tạo avatar nhân vật ngẫu nhiên hoặc chỉnh sửa ảnh đại diện!",
    async execute(bot, msg, args) {
        const chatId = msg.chat.id;
        const command = args[0]; // Kiểm tra người dùng muốn loại avatar nào

        if (command === "random") {
            // 🔥 Tạo avatar ngẫu nhiên từ API
            const apiList = [
                "https://api.lolicon.app/setu/v2", // API anime girl
                "https://nekos.best/api/v2/neko", // API neko
                "https://robohash.org/random.png", // API robot
                "https://api.multiavatar.com/random.png" // API pixel avatar
            ];
            const randomApi = apiList[Math.floor(Math.random() * apiList.length)];

            try {
                const response = await axios.get(randomApi);
                const imageUrl = response.data.url || response.data.images[0].url;
                bot.sendPhoto(chatId, imageUrl, { caption: "🔥 Avatar ngẫu nhiên dành cho bạn!" });
            } catch (error) {
                console.error(error);
                bot.sendMessage(chatId, "❌ Lỗi khi tạo avatar ngẫu nhiên.");
            }
        } else if (msg.reply_to_message && msg.reply_to_message.photo) {
            // 📸 Chỉnh sửa ảnh avatar từ ảnh người dùng gửi
            const fileId = msg.reply_to_message.photo.pop().file_id;

            bot.getFileLink(fileId).then(async (fileUrl) => {
                const editedImagePath = path.join(__dirname, "../temp/avatar_edited.jpg");

                // Tải ảnh về máy
                const writer = fs.createWriteStream(editedImagePath);
                const response = await axios({
                    url: fileUrl,
                    method: "GET",
                    responseType: "stream",
                });
                response.data.pipe(writer);

                writer.on("finish", async () => {
                    bot.sendPhoto(chatId, editedImagePath, { caption: "🎨 Đây là avatar mới của bạn!" });
                    fs.unlinkSync(editedImagePath); // Xóa file sau khi gửi
                });
            }).catch(() => bot.sendMessage(chatId, "❌ Lỗi khi xử lý ảnh!"));
        } else {
            // 🛠 Hướng dẫn sử dụng
            bot.sendMessage(chatId, `
📌 **Cách sử dụng lệnh "avatar":**
- **avatar random** → 🎭 Tạo avatar ngẫu nhiên (anime, pixel, robot, v.v.).
- **Gửi ảnh + reply "avatar"** → 📸 Chỉnh sửa ảnh thành avatar.
            
🔥 Thử ngay nào!
            `);
        }
    }
};
