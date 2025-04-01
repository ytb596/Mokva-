const axios = require("axios");

module.exports = {
    name: "hinh",
    description: "🎨 Tạo hình ảnh từ văn bản bằng Hugging Face API",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const apiKey = "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"; // Thay bằng API Key của bạn
        const prompt = args.join(" ") || "Một con rồng đang bay trên bầu trời";

        if (!apiKey) {
            return bot.sendMessage(chatId, "❌ Vui lòng cấu hình API Key trước khi sử dụng lệnh này.");
        }

        bot.sendMessage(chatId, "⏳ Đang tạo hình ảnh, vui lòng đợi...");

        try {
            const response = await axios.post(
                "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion",
                { inputs: prompt },
                {
                    headers: { Authorization: `Bearer ${apiKey}` },
                    responseType: "arraybuffer"
                }
            );

            const imageBuffer = Buffer.from(response.data, "binary");

            bot.sendPhoto(chatId, imageBuffer, { caption: `🖼 Hình ảnh tạo từ: *${prompt}*` });
        } catch (error) {
            bot.sendMessage(chatId, `❌ Lỗi: ${error.response ? error.response.data.error : error.message}`);
        }
    }
};
