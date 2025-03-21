const fs = require("fs");
const axios = require("axios");

const USERS_FILE = "./modules/users.json";
const FAKE_BILL_API = "https://keyherlyswar.x10.mx/fake-bill-acb-bank"; // API Fake Bill

module.exports = {
    name: "ct",
    description: "💸 Chuyển tiền đến người khác",
    execute(bot, msg, args) {
        const chatId = msg.chat.id;
        const senderId = msg.from.id.toString();
        const senderName = msg.from.username || msg.from.first_name;

        // Kiểm tra cú pháp lệnh
        if (args.length < 3) {
            return bot.sendMessage(chatId, "⚠️ Sai cú pháp!\n🔹 Dùng: `/ct @nguoinhan 100000 Nội dung` hoặc `/ct ID 100000 Nội dung`", { parse_mode: "Markdown" });
        }

        const receiverInput = args[0].replace("@", ""); // Xóa @ nếu có
        const amount = parseFloat(args[1]);
        const note = args.slice(2).join(" ");

        if (isNaN(amount) || amount <= 0) {
            return bot.sendMessage(chatId, "⚠️ Số tiền không hợp lệ!");
        }

        // Đọc dữ liệu users.json
        let users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));

        // Kiểm tra người gửi có tồn tại không
        if (!users[senderId] || users[senderId].xu < amount) {
            return bot.sendMessage(chatId, "❌ Bạn không đủ tiền để chuyển!");
        }

        let receiverId = null;
        let receiverName = null;

        // Kiểm tra nếu nhập ID
        if (users[receiverInput]) {
            receiverId = receiverInput;
            receiverName = users[receiverId].username;
        } else {
            // Tìm theo username
            for (let id in users) {
                if (users[id].username === receiverInput) {
                    receiverId = id;
                    receiverName = users[id].username;
                    break;
                }
            }
        }

        if (!receiverId) {
            return bot.sendMessage(chatId, `❌ Không tìm thấy người nhận!`);
        }

        // Trừ tiền người gửi, cộng tiền người nhận
        users[senderId].xu -= amount;
        users[receiverId].xu += amount;

        // Lưu lại dữ liệu
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

        // Gửi request tạo Fake Bill
        axios.post(FAKE_BILL_API, {
            ten_chuyen: senderName,
            stk_chuyen: senderId,
            ngan_hang_nhan: "ACB Bank",
            stk_nhan: receiverId,
            ten_nhan: receiverName,
            so_tien: amount,
            noi_dung: note
        })
        .then(response => {
            const billLink = response.data.bill_url || "Không có link bill.";

            bot.sendMessage(chatId, `✅ **Chuyển tiền thành công!**\n💳 **Từ:** ${senderName}\n💰 **Đến:** @${receiverName} (ID: ${receiverId})\n💵 **Số tiền:** ${amount.toLocaleString()} Xu\n📝 **Nội dung:** ${note}\n📜 **Hóa đơn:** [Xem bill](${billLink})`, { parse_mode: "Markdown" });
        })
        .catch(error => {
            console.error("Lỗi API:", error);
            bot.sendMessage(chatId, "⚠️ Chuyển tiền thành công nhưng không thể tạo Fake Bill!");
        });
    }
};
