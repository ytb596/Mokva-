const axios = require("axios");
const querystring = require("querystring");

const PAGE_SIZE = 5;
const SEARCH_API = "https://keyherlyswar.x10.mx/Apidocs/searchyt.php?query=";
const DLVIDEO_API = "https://keyherlyswar.x10.mx/Apidocs/dlyt.php?url=";
const DLMP3_API = "https://keyherlyswar.x10.mx/Apidocs/mp3yt.php?url=";

function formatDuration(duration) {
  return duration || "0:00";
}

function formatViewCount(viewCount) {
  try {
    const views = parseInt(viewCount);
    if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`;
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
    return views.toString();
  } catch {
    return "0";
  }
}

async function searchYoutube(query) {
  const url = `${SEARCH_API}${querystring.escape(query)}`;
  try {
    const response = await axios.get(url);
    return response.data || { data: [] };
  } catch {
    return { data: [] };
  }
}

async function downloadVideo(url) {
  const apiUrl = `${DLVIDEO_API}${querystring.escape(url)}`;
  try {
    const response = await axios.get(apiUrl, { timeout: 30000 });
    if (response.status === 200 && response.data.status === "OK") {
      const formats = response.data.formats || [];
      let bestQuality = formats.find(fmt => fmt.qualityLabel === "1080p") || formats[formats.length - 1];
      return {
        status: "OK",
        title: response.data.title || "Không có tiêu đề",
        duration: response.data.lengthSeconds || "0",
        quality: bestQuality.qualityLabel || "Không rõ",
        url: bestQuality.url || ""
      };
    }
  } catch {
    return { status: "error", message: "Lỗi kết nối, vui lòng thử lại sau!" };
  }
  return { status: "error", message: "Không thể tải video. Vui lòng kiểm tra URL!" };
}

async function downloadMp3(url) {
  const apiUrl = `${DLMP3_API}${querystring.escape(url)}`;
  try {
    const response = await axios.get(apiUrl, { timeout: 10000 });
    return response.status === 200 ? response.data : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

module.exports = {
  name: "youtube",
  description: "Tìm kiếm & tải video/nhạc từ YouTube",
  args: true,
  usage: "<start|video|dlvideo|dlmp3> [parameters]",
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    if (!args[0]) {
      return bot.sendMessage(chatId, "Usage: /youtube <start|video|dlvideo|dlmp3> [parameters]");
    }
    const subcommand = args.shift().toLowerCase();
    if (subcommand === "start") {
      return bot.sendMessage(chatId,
        "📌 *Lệnh YouTube* 📌\n\n" +
        "/youtube video <từ khóa> - 🔎 Tìm kiếm video\n" +
        "/youtube dlvideo <url> - 📥 Tải video\n" +
        "/youtube dlmp3 <url> - 🎵 Tải nhạc MP3",
        { parse_mode: "Markdown" }
      );
    } else if (subcommand === "video") {
      if (args.length === 0) {
        return bot.sendMessage(chatId, "Vui lòng cung cấp từ khóa để tìm kiếm video.");
      }
      const searchQuery = args.join(" ");
      await bot.sendMessage(chatId, "🔎 Đang tìm kiếm video...");
      const results = await searchYoutube(searchQuery);
      if (!results.data || results.data.length === 0) {
        return bot.sendMessage(chatId, "Không tìm thấy video nào!");
      }
      let messageText = "🎥 *Kết Quả Tìm Kiếm*\n\n";
      results.data.slice(0, PAGE_SIZE).forEach((video, index) => {
        const title = video.title || "No Title";
        const duration = formatDuration(video.lengthText || "0:00");
        const views = formatViewCount(video.viewCount || "0");
        const channel = video.channelTitle || "Không xác định";
        const url = `https://youtube.com/watch?v=${video.videoId}`;
        messageText += `${index + 1}. *${title}*\n📺 Kênh: ${channel}\n⏱ ${duration} | 👁 ${views} lượt xem\n🔗 [Xem video](${url})\n📥 Tải: /youtube dlvideo ${url}\n🎵 MP3: /youtube dlmp3 ${url}\n\n`;
      });
      return bot.sendMessage(chatId, messageText, { parse_mode: "Markdown", disable_web_page_preview: true });
    } else if (subcommand === "dlvideo") {
      if (args.length === 0) {
        return bot.sendMessage(chatId, "Vui lòng cung cấp URL video để tải.");
      }
      const videoUrl = args.join(" ");
      await bot.sendMessage(chatId, "⏳ Đang tải video...");
      const result = await downloadVideo(videoUrl);
      let messageText = result.status === "OK"
        ? `🎥 *${result.title}*\n⏱ Thời lượng: ${result.duration}s\n🎬 Chất lượng: ${result.quality}\n⬇️ [Tải video](${result.url})`
        : `❌ ${result.message || 'Không thể tải video. Vui lòng kiểm tra URL!'}`;
      return bot.sendMessage(chatId, messageText, { parse_mode: "Markdown", disable_web_page_preview: true });
    } else if (subcommand === "dlmp3") {
      if (args.length === 0) {
        return bot.sendMessage(chatId, "Vui lòng cung cấp URL video để tải MP3.");
      }
      const videoUrl = args.join(" ");
      await bot.sendMessage(chatId, "⏳ Đang tải nhạc...");
      const result = await downloadMp3(videoUrl);
      let messageText = result.status === "ok"
        ? `🎵 *${result.title}*\n⏱ Thời lượng: ${result.duration || '0'}s\n⬇️ [Tải nhạc](${result.link || 'Không có'})`
        : "❌ Không thể tải nhạc. Vui lòng kiểm tra URL!";
      return bot.sendMessage(chatId, messageText, { parse_mode: "Markdown", disable_web_page_preview: true });
    } else {
      return bot.sendMessage(chatId, "Subcommand không xác định cho /youtube. Vui lòng sử dụng /youtube start để xem hướng dẫn.");
    }
  }
};
