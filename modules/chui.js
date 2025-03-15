module.exports = {
  name: 'bot',
  description: 'Tự động chửi lại khi ai đó chửi bot',
  execute(bot, msg, args) {
    // Danh sách từ khóa chửi bot (viết hoa hay viết thường đều phát hiện được)
    const badWords = ["ngu", "đần", "óc chó", "mày ngu", "rác", "ngu vãi"];

    // Danh sách câu phản đòn của bot
    const roastReplies = [
      "Ngu thì câm nín đi, ở đây ai cũng thông minh trừ mày!",
      "Tao là AI, còn mày là đồ ngu nhân tạo! 🤖💀",
      "Chửi tao á? Não mày lag hơn cả mạng dial-up đấy!",
      "Tao ngu nhưng ít nhất tao còn hữu ích hơn mày. 😂",
      "Mày chửi tao làm gì? Chửi cái đầu mày đi trước đã! 🤡"
    ];

    // Danh sách ID admin để bot không phản ứng lại với admin
    const adminIDs = [123456789, 987654321]; // Thay ID admin thật của bạn vào đây

    // Kiểm tra nếu người chửi là admin thì bot không phản ứng
    if (adminIDs.includes(msg.from.id)) return;

    // Kiểm tra xem tin nhắn có chứa từ chửi không
    const regex = new RegExp(`\\b(${badWords.join("|")})\\b`, "i"); // Regex kiểm tra từ riêng lẻ
    if (regex.test(msg.text)) {
      // Chọn câu chửi ngẫu nhiên
      const randomRoast = roastReplies[Math.floor(Math.random() * roastReplies.length)];

      // Gửi tin nhắn phản hồi
      bot.sendMessage(msg.chat.id, `🔥 ${randomRoast}`);
    }
  }
};
