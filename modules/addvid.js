const fs = require("fs");

const filePaths = {
    cosplay: "data_api/cos/cosplay.json",
    anime: "data_api/cos/anime.json",
    meme: "data_api/meme/meme.json"
};

// **Hàm thêm video vào file JSON**
function addVideoToFile(category, videoUrl) {
    if (!filePaths[category]) {
        return `❌ Danh mục không hợp lệ! Hãy chọn: ${Object.keys(filePaths).join(", ")}`;
    }

    const filePath = filePaths[category];

    try {
        let videoList = [];

        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath);
            videoList = JSON.parse(rawData);
        }

        if (!Array.isArray(videoList)) {
            videoList = [];
        }

        // **Kiểm tra trùng lặp**
        if (videoList.includes(videoUrl)) {
            return "⚠️ Link này đã tồn tại trong danh sách!";
        }

        // **Thêm link mới vào danh sách**
        videoList.push(videoUrl);
        fs.writeFileSync(filePath, JSON.stringify(videoList, null, 4));

        return `✅ Đã thêm video vào danh mục ${category}!`;
    } catch (error) {
        console.error("❌ Lỗi khi thêm video:", error);
        return "❌ Lỗi khi lưu video!";
    }
}

module.exports = {
    name: "addvideo",
    description: "➕ Thêm link video vào danh sách.",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // **Kiểm tra cú pháp**
        if (args.length < 2) {
            return bot.sendMessage(chatId, "📢 **Cách dùng:**\n`/addvideo <danh mục> <link>`\n\n🔹 Danh mục có thể là: cosplay, anime, meme.");
        }

        const category = args[0].toLowerCase();
        const videoUrl = args[1];

        // **Thêm video vào file JSON**
        const resultMessage = addVideoToFile(category, videoUrl);

        // **Gửi phản hồi**
        bot.sendMessage(chatId, resultMessage);
    }
};
