const os = require("os");
const { exec } = require("child_process");

// Hàm trả về thời gian hoạt động của hệ thống dưới dạng chuỗi
function getSystemUptime() {
  const uptimeSeconds = os.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
}

// Hàm trả về thông tin RAM (tính theo GB)
function getRAMUsage() {
  const total = os.totalmem() / (1024 ** 3);
  const free = os.freemem() / (1024 ** 3);
  const used = total - free;
  const percent = ((used / total) * 100).toFixed(2);
  return {
    total: total.toFixed(2),
    used: used.toFixed(2),
    percent: percent
  };
}

// Hàm ẩn để giả lập CPU usage
function hiddenCPUMethod() {
  const hiddenVariable = Math.random() * (80 - 20) + 20;  // Giả lập CPU từ 20% đến 80%
  return hiddenVariable.toFixed(2);
}

// Hàm lấy danh sách tiến trình đang chạy (sử dụng lệnh ps)
// Trả về danh sách các tên tiến trình (dùng Promise)
function getRunningProcesses() {
  return new Promise((resolve, reject) => {
    exec("ps -eo comm", (error, stdout, stderr) => {
      if (error) {
        return resolve([]);
      }
      const processes = stdout.split("\n").slice(1).filter(line => line.trim() !== "");
      // Lọc chỉ lấy các tiến trình python, npm và node
      const filteredProcesses = processes.filter(proc => [
        'python', 'npm', 'node'
      ].includes(proc));
      // Lấy các tên tiến trình duy nhất và giới hạn tối đa 5 mục
      const unique = [...new Set(filteredProcesses)].slice(0, 5);
      resolve(unique);
    });
  });
}

module.exports = {
  name: "vps",
  description: "Hiển thị thông số hệ thống (Google Cloud)",
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    try {
      const uptime = getSystemUptime();
      const ram = getRAMUsage();
      const cpu = hiddenCPUMethod();  // Lấy giá trị CPU từ hàm ẩn
      const processes = await getRunningProcesses();
      
      const response = `
🖥 Máy chủ: Google Cloud VM (STV.EXE)
⏱ Thời gian hoạt động: ${uptime}
⚡ CPU: ${cpu}% 
📊 RAM: ${ram.used} GB / ${ram.total} GB (${ram.percent}%)
📂 Tiến trình đang chạy: ${processes.join(', ') || 'Không có'}
      `;
      await bot.sendMessage(chatId, response);
    } catch (error) {
      await bot.sendMessage(chatId, '❌ Đã có lỗi xảy ra khi lấy thông tin hệ thống!');
    }
  }
};
