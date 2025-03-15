const players = new Map();

const roles = [
  { name: '🐺 Ma Sói', count: 2 },
  { name: '👨‍🌾 Dân Làng', count: 3 },
  { name: '🔮 Tiên Tri', count: 1 },
  { name: '🛡️ Bảo Vệ', count: 1 },
  { name: '🏹 Thợ Săn', count: 1 }
];

module.exports = {
  name: 'masoi',
  description: 'Chơi Ma Sói với bạn bè!',
  execute(bot, msg, args) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.first_name;

    if (!args[0]) {
      return bot.sendMessage(chatId, '🧐 Dùng: `/masoi join` để tham gia, `/masoi start` để bắt đầu.', { parse_mode: 'Markdown' });
    }

    const command = args[0].toLowerCase();

    if (command === 'join') {
      if (!players.has(userId)) {
        players.set(userId, userName);
        bot.sendMessage(chatId, `✅ *${userName}* đã tham gia Ma Sói! (${players.size} người)`, { parse_mode: 'Markdown' });
      } else {
        bot.sendMessage(chatId, `⚠️ *${userName}* đã tham gia rồi!`, { parse_mode: 'Markdown' });
      }
    }

    if (command === 'start') {
      if (players.size < 5) {
        return bot.sendMessage(chatId, '❌ Cần ít nhất 5 người để chơi Ma Sói.', { parse_mode: 'Markdown' });
      }

      let shuffledPlayers = Array.from(players.keys()).sort(() => Math.random() - 0.5);
      let assignedRoles = [];

      // Gán vai trò theo số lượng
      for (let role of roles) {
        for (let i = 0; i < role.count; i++) {
          if (shuffledPlayers.length > 0) {
            assignedRoles.push({ id: shuffledPlayers.pop(), role: role.name });
          }
        }
      }

      // Gửi vai trò riêng tư
      assignedRoles.forEach(player => {
        bot.sendMessage(player.id, `🎭 Bạn là: *${player.role}*`, { parse_mode: 'Markdown' });
      });

      bot.sendMessage(chatId, '🎲 Trò chơi Ma Sói đã bắt đầu! Vai trò của bạn đã được gửi riêng tư.');
      players.clear();
    }
  }
};
