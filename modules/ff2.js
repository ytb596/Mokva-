const axios = require('axios');

module.exports = {
    name: "ff",
    description: "📊 Kiểm tra thông tin người chơi Free Fire từ API",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // Kiểm tra cú pháp
        if (args.length !== 1) {
            return bot.sendMessage(chatId, "⚠️ Sai cú pháp! Sử dụng: `/ff <UID>`", { parse_mode: "Markdown" });
        }

        const uid = args[0];

        // Kiểm tra định dạng UID
        if (!/^\d+$/.test(uid)) {
            return bot.sendMessage(chatId, "❌ UID phải là số!", { parse_mode: "Markdown" });
        }

        try {
            // Gọi API FF Community
            const response = await axios.get(`https://api.ffcommunity.site/info.php?uid=${uid}`);

            // Kiểm tra dữ liệu JSON từ API
            if (!response.data || Object.keys(response.data).length === 0) {
                return bot.sendMessage(chatId, "❌ Không tìm thấy thông tin người chơi!", { parse_mode: "Markdown" });
            }

            const userData = response.data;
            const equippedItems = userData["Equipped Items"]?.["Equipped Outfit"] || [];
            const equippedWeapons = userData["Equipped Items"]?.["Equipped Weapon"] || [];
            const petInfo = userData["Pet Information"] || {}; // Kiểm tra dữ liệu thú cưng

            let userInfo = `
📝 **Thông tin người chơi:**
👤 **UID:** ${userData.AccountUID}
💬 **Tên người dùng:** ${userData.AccountName}
🎮 **Rank BR:** ${userData.BrRank}
🏆 **Rank CS:** ${userData.CsRank || "Chưa xếp hạng"}
💎 **Level:** ${userData.AccountLevel}
❤️ **Lượt thích:** ${userData.AccountLikes}
🕹 **Kinh nghiệm:** ${userData.AccountEXP}

👕 **Trang phục:**  
${equippedItems.length > 0 ? equippedItems.map(item => `- ![🔹](${item["Items Icon"]})`).join('\n') : "Không có dữ liệu"}

🔫 **Vũ khí trang bị:**  
${equippedWeapons.length > 0 ? equippedWeapons.map(item => `- ![🔹](${item["Items Icon"]})`).join('\n') : "Không có dữ liệu"}

🐾 **Thú cưng:** ${petInfo.PetName ? `\n- **Tên:** ${petInfo.PetName}\n- **Cấp độ:** ${petInfo.PetLevel}\n- **Kinh nghiệm:** ${petInfo.PetEXP}` : "Không có thú cưng"}

🏅 **Guild:**
- **Tên:** ${userData["Guild Information"]?.GuildName || "Không có guild"}
- **Cấp:** ${userData["Guild Information"]?.GuildLevel || "N/A"}
- **Thành viên:** ${userData["Guild Information"]?.GuildMember || "N/A"}

📅 **Tài khoản tạo lúc:** ${userData.AccountCreateTime}
🕒 **Đăng nhập gần nhất:** ${userData.AccountLastLogin}

🚀 *Lấy thông tin từ FF Community API*
`;

            bot.sendMessage(chatId, userInfo, { parse_mode: "Markdown" });
        } catch (error) {
            console.error("Lỗi API:", error);
            return bot.sendMessage(chatId, "❌ Đã xảy ra lỗi khi lấy thông tin người chơi!", { parse_mode: "Markdown" });
        }
    }
};
