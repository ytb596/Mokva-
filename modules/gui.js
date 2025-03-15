module.exports = bot => {
    // Danh sách lời chúc cho từng giờ
    const hourlyMessages = {
        1: "🌙 Đã 1h sáng, ai còn thức thì ngủ đi nhé! 😴",
        2: "🕑 2h sáng rồi, ngủ sớm mai còn dậy nhé!",
        3: "🌌 3h sáng, chúc những ai còn thức ngủ ngon!",
        4: "🌅 4h sáng, trời sắp sáng rồi đó!",
        5: "🌄 5h sáng, dậy sớm cho ngày mới năng động nhé!",
        6: "☀ 6h sáng, chúc buổi sáng vui vẻ! ☕",
        7: "🌅 7h sáng, chào ngày mới với năng lượng tràn đầy!",
        8: "🌞 8h sáng, chúc ngày mới thành công!",
        9: "⏰ 9h sáng, làm việc chăm chỉ nhé!",
        10: "🌤 10h sáng, đừng quên uống nước!",
        11: "🍽 11h trưa, chuẩn bị ăn trưa thôi!",
        12: "🌞 12h trưa, nghỉ trưa để có sức làm việc!",
        13: "😴 13h chiều, ngủ trưa một chút đi nào!",
        14: "🌤 14h chiều, tiếp tục công việc thôi!",
        15: "☕ 15h chiều, làm ly cà phê nào!",
        16: "🌆 16h chiều, cố lên sắp hết ngày rồi!",
        17: "🌇 17h chiều, ai tan làm thì về nhà thôi!",
        18: "🌅 18h tối, ăn tối ngon miệng nhé!",
        19: "🌙 19h tối, thư giãn một chút đi nào!",
        20: "🌠 20h tối, nghỉ ngơi để ngày mai chiến tiếp!",
        21: "🌜 21h tối, đọc sách hoặc xem phim thư giãn!",
        22: "🌑 22h tối, ngủ sớm cho khỏe nhé!",
        23: "🛌 23h tối, chuẩn bị ngủ nào!"
    };

    // Hàm lấy danh sách nhóm bot đang tham gia
    async function getGroups() {
        const updates = await bot.getUpdates();
        const groupIds = new Set();

        updates.forEach(update => {
            if (update.message && update.message.chat.type !== 'private') {
                groupIds.add(update.message.chat.id);
            }
        });

        return [...groupIds];
    }

    async function checkAndSendMessage() {
        const now = new Date();
        now.setHours(now.getHours() + 7); // Đổi sang giờ Việt Nam
        const currentHour = now.getHours();

        if (hourlyMessages[currentHour]) {
            const groups = await getGroups();
            groups.forEach(chatId => {
                bot.sendMessage(chatId, hourlyMessages[currentHour]);
            });
        }
    }

    // Gửi ngay khi bot khởi động
    checkAndSendMessage();

    // Kiểm tra và gửi tin nhắn mỗi phút
    setInterval(checkAndSendMessage, 60 * 1000);
};
