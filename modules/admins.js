module.exports = {
    name: 'admin',  // Tên lệnh
    description: 'Hiển thị ID của admin',
    execute: async (bot, msg, args) => {
        // Thay 'admin_id' bằng ID của admin mà bạn muốn hiển thị
        const adminID = '8014033911';  // Thay bằng ID thật của admin

        // Gửi ID admin cho người dùng
        bot.sendMessage(msg.chat.id, `📛 ID của admin là: ${adminID}`);
    }
};
