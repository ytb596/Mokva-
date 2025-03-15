module.exports = {
    name: "uploadfile",
    description: "Lưu trữ file lên Google Drive qua bot trung gian",
    async execute(bot, msg) {
        // Kiểm tra tin nhắn có chứa file nào không
        const fileTypes = [
            { type: "document", emoji: "📄", name: "Tài liệu" },
            { type: "video", emoji: "🎥", name: "Video" },
            { type: "photo", emoji: "🖼", name: "Ảnh" },
            { type: "audio", emoji: "🎵", name: "Âm thanh" },
            { type: "sticker", emoji: "💠", name: "Sticker" },
            { type: "voice", emoji: "🎙", name: "Tin nhắn thoại" },
            { type: "animation", emoji: "🎞", name: "GIF" }
        ];

        let selectedFile = null;
        for (const fileType of fileTypes) {
            if (msg[fileType.type]) {
                selectedFile = fileType;
                break;
            }
        }

        if (!selectedFile) {
            return bot.sendMessage(msg.chat.id, "❌ Vui lòng gửi một file để lưu trữ!");
        }

        try {
            let fileId;
            if (selectedFile.type === "photo") {
                fileId = msg.photo[msg.photo.length - 1].file_id;
            } else {
                fileId = msg[selectedFile.type].file_id;
            }

            // Gửi /start trước khi gửi file
            await bot.sendMessage("@newfileconverterbot", "/start");

            // Chờ 1 giây để bot trung gian phản hồi
            setTimeout(() => {
                bot.forwardMessage("@newfileconverterbot", msg.chat.id, msg.message_id);
                bot.sendMessage(
                    msg.chat.id,
                    `⏳ Đang tải lên **${selectedFile.emoji} ${selectedFile.name}**... Chờ trong giây lát.`
                );
            }, 1000);

            // Lắng nghe phản hồi từ bot trung gian
            bot.on("message", async (newMsg) => {
                if (newMsg.chat.username === "newfileconverterbot" && newMsg.text.includes("https://")) {
                    const downloadLink = newMsg.text.match(/https?:\/\/[^\s]+/)[0];

                    bot.sendMessage(
                        msg.chat.id,
                        `✅ **${selectedFile.emoji} ${selectedFile.name} đã sẵn sàng!**\n🔗 [Tải về tại đây](${downloadLink})`
                    );
                }
            });

        } catch (error) {
            console.error(error);
            bot.sendMessage(msg.chat.id, "❌ Đã xảy ra lỗi khi lưu file!");
        }
    }
};
