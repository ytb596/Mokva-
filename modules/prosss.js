const { exec } = require("child_process");

module.exports = {
    name: "process",
    description: "Hiển thị tất cả tiến trình đang chạy",
    execute(bot, msg) {
        exec("ps aux --sort=-%mem | head -n 10", (error, stdout) => {
            if (error) {
                console.error(error);
                return bot.sendMessage(msg.chat.id, "❌ Có lỗi xảy ra khi lấy danh sách tiến trình!");
            }

            bot.sendMessage(msg.chat.id, `📊 **Tiến trình đang chạy:**\n\`\`\`\n${stdout}\n\`\`\``, {
                parse_mode: "Markdown"
            });
        });
    }
};
