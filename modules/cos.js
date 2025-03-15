const fs = require("fs");

const filePath = "data_api/cos/cosplay.json";  
let videoList = [];  

// **Hàm tải danh sách video cosplay**  
function loadVideoList() {  
    try {  
        if (fs.existsSync(filePath)) {  
            const rawData = fs.readFileSync(filePath);  
            const data = JSON.parse(rawData);  

            if (Array.isArray(data) && data.length > 0) {  
                videoList = data;  
                console.log(`✅ Đã cập nhật ${videoList.length} video từ ${filePath}`);  
            } else {  
                console.error("⚠️ Danh sách video trống hoặc không hợp lệ.");  
            }  
        } else {  
            console.error(`❌ Không tìm thấy file ${filePath}!`);  
        }  
    } catch (error) {  
        console.error("❌ Lỗi khi tải danh sách video:", error);  
    }  
}  

// **Tải danh sách video cosplay khi bot khởi động**  
loadVideoList();  

// **Tự động theo dõi file và cập nhật danh sách khi có thay đổi**  
fs.watch(filePath, (eventType) => {  
    if (eventType === "change") {  
        console.log("🔄 Phát hiện thay đổi trong cosplay.json, đang cập nhật...");  
        loadVideoList();  
    }  
});  

module.exports = {  
    name: "cos",  
    description: "🎥 Gửi video cosplay từ danh sách.",  
    execute: async (bot, msg) => {  
        const chatId = msg.chat.id;  

        if (videoList.length === 0) {  
            return bot.sendMessage(chatId, "🚫 Hiện tại chưa có video cosplay nào.");  
        }  

        // **Chọn ngẫu nhiên một video**  
        const randomVideo = videoList[Math.floor(Math.random() * videoList.length)];  

        // **Gửi video cosplay**  
        bot.sendVideo(chatId, randomVideo, {  
            caption: "🎭 Video cosplay cho anh em đây!"  
        });  
    }  
};
