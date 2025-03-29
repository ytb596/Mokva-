const PImage = require('pureimage');
const THREE = require('three');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "adminbox",
    description: "📊 Hiển thị thông tin quản trị box",
    execute: async (bot, msg, args) => {
        try {
            const chatInfo = await bot.getChat(msg.chat.id);
            const memberCount = chatInfo.members_count;
            const title = chatInfo.title;

            // **📂 Tạo thư mục "images/" nếu chưa có**
            const saveDir = path.join(__dirname, '../images');  // **Thư mục ngoài "modules/"**
            if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

            const imagePath = path.join(saveDir, 'adminbox.png');

            // **🔤 Đường dẫn font Arial (vẫn nằm trong "modules/")**
            const fontPath = path.join(__dirname, '../modules/Arial.ttf');

            // **🏗️ Load font Arial từ "modules/"**
            const font = PImage.registerFont(fontPath, 'Arial');
            await font.load();

            // **1️⃣ Tạo ảnh nền chứa chữ**
            const width = 500, height = 300;
            const img = PImage.make(width, height);
            const ctx = img.getContext('2d');

            ctx.fillStyle = "#222"; 
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "#FFF"; 
            ctx.font = "22px Arial";
            ctx.fillText(`📌 Box: ${title}`, 20, 50);
            ctx.fillText(`👥 Thành viên: ${memberCount}`, 20, 90);

            const out = fs.createWriteStream(imagePath);
            await PImage.encodePNGToStream(img, out);

            // **2️⃣ Chỉnh sửa ảnh với Jimp**
            out.on('finish', async () => {
                const jimpImg = await Jimp.read(imagePath);
                jimpImg
                    .resize(500, 300)
                    .write(imagePath);

                // **3️⃣ Gửi ảnh từ thư mục "images/" & Xóa sau khi gửi**
                await bot.sendPhoto(msg.chat.id, imagePath, { caption: "📊 **Thông tin Quản trị Box**" });
                fs.unlinkSync(imagePath);
            });

        } catch (error) {
            console.error("[ERROR] Lỗi khi tạo ảnh:", error);
            bot.sendMessage(msg.chat.id, "⚠️ Đã xảy ra lỗi khi tạo ảnh quản trị box.");
        }
    }
};
