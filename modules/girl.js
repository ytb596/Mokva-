const fs = require("fs");

const filePath = "data_api/vdgai.json";
let girlList = [];

// Tải danh sách ảnh gái từ Catbox khi bot khởi động
function loadGirlList() {
    try {
        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath);
            const data = JSON.parse(rawData);

            // Kiểm tra để đảm bảo chỉ có link Catbox trong danh sách
            girlList = data.filter(url => url.includes("catbox.moe"));
            if (girlList.length > 0) {
                console.log(`✅ Đã nạp ${girlList.length} ảnh gái từ Catbox.`);
            } else {
                console.error("⚠️ Không tìm thấy ảnh Catbox hợp lệ.");
            }
        } else {
            console.error("❌ Không tìm thấy file data_api/vdgai.json!");
        }
    } catch (error) {
        console.error("❌ Lỗi khi tải danh sách ảnh gái:", error);
    }
}

// Tải lại danh sách ảnh khi có thay đổi trong tệp
fs.watch(filePath, (eventType, filename) => {
    if (filename && eventType === 'change') {
        console.log("🔄 Tệp vdgai.json đã thay đổi. Tải lại danh sách ảnh.");
        loadGirlList();
    }
});

// Tải ảnh gái khi bot khởi động
loadGirlList();

module.exports = {
    name: "girl",
    description: "📷 Gửi hình ảnh gái ngẫu nhiên từ danh sách Catbox.",
    execute: async (bot, msg) => {
        const chatId = msg.chat.id;

        if (girlList.length === 0) {
            return bot.sendMessage(chatId, "🚫 Hiện tại chưa có ảnh gái Catbox nào.");
        }

        // Chọn ngẫu nhiên một ảnh gái từ Catbox
        const randomGirl = girlList[Math.floor(Math.random() * girlList.length)];

        // Gửi ảnh gái kèm caption
        bot.sendPhoto(chatId, randomGirl, {
            caption: "🍑 Gái xinh đây anh em!"
        });
    }
};
