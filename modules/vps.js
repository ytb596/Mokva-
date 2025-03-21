const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
    name: 'vps',
    execute: async (ctx, args) => {
        const start = Date.now();
        const now = new Date();

        // Kiểm tra ctx.from trước khi lấy thông tin người dùng
        const userName = ctx.from ? (ctx.from.username || `${ctx.from.first_name} ${ctx.from.last_name || ''}`.trim()) : 'Khách';

        // Gửi tin nhắn đầu tiên
        const message = await ctx.telegram.sendMessage(ctx.chat.id, '🏓 Pong!');
        const end = Date.now();
        const latency = end - start;

        // Giả lập thông tin VPS
        const uptime = os.uptime(); // Thời gian hoạt động của hệ thống (giây)
        
        // Giả lập CPU và RAM trên Termux
        const cpuUsage = (Math.random() * 100).toFixed(2);  // Giả lập CPU load từ 0 đến 100
        const ramUsage = ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2); // RAM đã sử dụng (%)

        // Giả lập thông tin hệ điều hành
        const simulatedOsType = 'Windows'; // Giả lập hệ điều hành Windows
        const simulatedOsPlatform = 'x64'; // Giả lập nền tảng Windows x64
        const simulatedOsRelease = '10.0.19042'; // Phiên bản giả lập của Windows 10

        // Tạo phản hồi
        const response = `
⏰ Thời gian: ${now.toLocaleString('vi-VN')}
👤 Người thực hiện: ${userName}
⏱ Độ trễ: ${latency}ms
🖥 Thông tin cơ bản VPS:
  - ⏳ Uptime: ${(uptime / 3600).toFixed(2)} giờ
  - 🏎 CPU Load: ${cpuUsage}%
  - 📊 RAM Usage: ${ramUsage}%
  - 🖥 Hệ điều hành: ${simulatedOsType} ${simulatedOsPlatform} ${simulatedOsRelease}
        `.trim();

        await ctx.telegram.sendMessage(ctx.chat.id, response);

        // Đọc tệp videos.json và gửi video
        const videoListPath = path.join(__dirname, 'modules', 'videos.json');
        fs.readFile(videoListPath, 'utf8', async (err, data) => {
            if (err) {
                console.error('Không thể đọc tệp videos.json:', err);
                return;
            }

            try {
                const videos = JSON.parse(data);  // Chuyển đổi dữ liệu JSON thành mảng
                if (videos && videos.length > 0) {
                    // Gửi video đầu tiên từ danh sách
                    const videoPath = path.join(__dirname, 'modules', videos[0]); // Giả sử video nằm trong thư mục 'modules'
                    await ctx.telegram.sendVideo(ctx.chat.id, videoPath); // Gửi video
                } else {
                    console.log('Không có video để gửi.');
                }
            } catch (e) {
                console.error('Lỗi khi xử lý videos.json:', e);
            }
        });
    }
};
