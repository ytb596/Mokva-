module.exports = {
    name: "antiout",
    execute: async (ctx) => {
        // Kiểm tra nếu ctx.message không tồn tại
        if (!ctx.message || !ctx.message.text) {
            return ctx.reply("⚠️ Lệnh không hợp lệ hoặc bị lỗi.");
        }

        const text = ctx.message.text.toLowerCase().trim(); // Chuyển chữ thường và xóa khoảng trắng

        if (text === "/antiout on") {
            global.antiOut = true;
            return ctx.reply("✅ Anti-Out đã bật! Thành viên rời nhóm sẽ bị nhắc quay lại.");
        } else if (text === "/antiout off") {
            global.antiOut = false;
            return ctx.reply("❌ Anti-Out đã tắt! Thành viên rời nhóm sẽ không bị nhắc quay lại.");
        }
    },
    onLeftChatMember: async (ctx) => {
        if (!global.antiOut) return;
        if (!ctx.message || !ctx.message.left_chat_member) return;

        const member = ctx.message.left_chat_member;
        const userName = member.first_name || "Người dùng";

        try {
            // Lấy link nhóm tự động
            const chatInviteLink = await ctx.telegram.exportChatInviteLink(ctx.chat.id);

            await ctx.telegram.sendMessage(
                member.id,
                `⚠️ ${userName}, bạn đã rời nhóm *${ctx.chat.title}*.\n🔗 Link quay lại: [Click vào đây](${chatInviteLink})`,
                { parse_mode: "Markdown" }
            );
            await ctx.reply(`🔄 Đã gửi link mời lại cho **${userName}**.`);
        } catch (error) {
            console.error(error);
            await ctx.reply(`❌ Không thể gửi tin nhắn cho **${userName}**.`);
        }
    }
};
