const axios = require("axios");

module.exports = {
    name: "fb",
    description: "📘 Lấy thông tin Facebook qua UID",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        if (!args[0]) {
            return bot.sendMessage(chatId, "📢 **Vui lòng nhập UID Facebook để lấy thông tin.**\n\n🔹 Cách dùng: `/infofb <uid>`");
        }

        const uid = args[0];
        const apiUrl = `https://keyherlyswar.x10.mx/Apidocs/getinfofb.php?uid=${uid}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data || Object.keys(data).length === 0) {
                return bot.sendMessage(chatId, "❌ Không tìm thấy thông tin Facebook. UID có thể không hợp lệ hoặc bị ẩn.");
            }

            // Kiểm tra và lấy dữ liệu
            const name = data.name || "Không có dữ liệu";
            const gender = data.gender || "Không có dữ liệu";
            const hometown = data.hometown || "Không có dữ liệu";
            const location = data.location || "Không có dữ liệu";
            const work = data.work || "Không có dữ liệu";
            const education = data.education || "Không có dữ liệu";
            const languages = data.languages || "Không có dữ liệu";
            const birthday = data.birthday || "Không có dữ liệu";
            const bio = data.bio || "Không có dữ liệu";
            const avatar = `https://graph.facebook.com/${uid}/picture?type=large`;

            let message = `📘 <b>THÔNG TIN FACEBOOK</b> 📘\n━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 <b>Tên:</b> ${name}\n`;
            message += `🆔 <b>UID:</b> ${uid}\n`;
            message += `🌍 <b>URL:</b> <a href="https://facebook.com/${uid}">Xem trang cá nhân</a>\n`;
            message += `👫 <b>Giới tính:</b> ${gender}\n`;
            message += `📍 <b>Quê quán:</b> ${hometown}\n`;
            message += `🏡 <b>Đang sống tại:</b> ${location}\n`;
            message += `💼 <b>Công việc:</b> ${work}\n`;
            message += `🎓 <b>Học vấn:</b> ${education}\n`;
            message += `💬 <b>Ngôn ngữ:</b> ${languages}\n`;
            message += `📅 <b>Ngày sinh:</b> ${birthday}\n`;
            message += `📜 <b>Tiểu sử:</b> ${bio}\n`;
            message += `📸 <b>Ảnh đại diện:</b> [Xem ảnh](${avatar})\n`;
            message += `━━━━━━━━━━━━━━━━━━━`;

            bot.sendMessage(chatId, message, { parse_mode: "HTML", disable_web_page_preview: false });
        } catch (error) {
            console.error("❌ Lỗi khi lấy thông tin Facebook:", error);
            bot.sendMessage(chatId, "❌ Không thể lấy thông tin Facebook. Hãy thử lại sau.");
        }
    }
};
