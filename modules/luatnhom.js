const fs = require('fs');

const RULES_FILE = 'rules.json';

module.exports = {
  name: 'luatnhom',
  description: 'Quản lý luật nhóm!',
  execute(bot, msg, args) {
    const chatId = msg.chat.id;

    // Đọc luật từ file (nếu có)
    let rules = {};
    if (fs.existsSync(RULES_FILE)) {
      rules = JSON.parse(fs.readFileSync(RULES_FILE, 'utf8'));
    }

    // Lệnh "xem luật"
    if (!args.length) {
      const groupRules = rules[chatId] || ["❌ Nhóm này chưa có luật nào."];
      return bot.sendMessage(chatId, `📜 **Luật nhóm:**\n\n${groupRules.join("\n")}`);
    }

    // Kiểm tra xem người dùng có phải admin không
    bot.getChatMember(chatId, msg.from.id).then(member => {
      if (!["administrator", "creator"].includes(member.status)) {
        return bot.sendMessage(chatId, "🚫 Bạn không có quyền chỉnh sửa luật nhóm.");
      }

      const command = args[0].toLowerCase();

      if (command === "add") {
        const newRule = args.slice(1).join(" ");
        if (!newRule) return bot.sendMessage(chatId, "⚠️ Hãy nhập nội dung luật cần thêm!");

        rules[chatId] = rules[chatId] || [];
        rules[chatId].push(`🔹 ${newRule}`);
      } else if (command === "remove") {
        const index = parseInt(args[1]);
        if (isNaN(index) || !rules[chatId] || !rules[chatId][index - 1]) {
          return bot.sendMessage(chatId, "⚠️ Số thứ tự luật không hợp lệ.");
        }
        rules[chatId].splice(index - 1, 1);
      } else if (command === "clear") {
        delete rules[chatId];
      } else {
        return bot.sendMessage(chatId, "⚠️ Lệnh không hợp lệ! Dùng: `add`, `remove [số]`, hoặc `clear`.");
      }

      // Lưu lại luật mới
      fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2));

      bot.sendMessage(chatId, "✅ Luật nhóm đã được cập nhật!");
    });
  }
};
