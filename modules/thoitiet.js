const axios = require("axios");

const apiKey = "deae5206758c44f38b0184151232208"; // 🔹 Thay thế bằng API Key của bạn

module.exports = {
    name: "thoitiet",
    description: "⛅ Xem thông tin thời tiết chi tiết của một thành phố.",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;

        // Kiểm tra nếu không có tên thành phố
        if (!args[0]) {
            return bot.sendMessage(chatId, "📢 **Vui lòng nhập tên thành phố để xem thời tiết!**\n\n" +
                "🔹 Cách dùng: `/thoitiet <tên thành phố>`");
        }

        const city = args.join(" ");
        const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;

        try {
            // Gửi request đến WeatherAPI
            const response = await axios.get(apiUrl);
            const weather = response.data;

            // Trích xuất thông tin
            const location = `${weather.location.name}, ${weather.location.country}`;
            const tempC = weather.current.temp_c;
            const condition = weather.current.condition.text;
            const iconUrl = `https:${weather.current.condition.icon}`;
            const humidity = weather.current.humidity;
            const windKph = weather.current.wind_kph;
            const feelsLike = weather.current.feelslike_c;
            const cloud = weather.current.cloud; // Độ phủ mây (%)
            const uvIndex = weather.current.uv; // Chỉ số UV
            const pressure = weather.current.pressure_mb; // Áp suất không khí (hPa)
            const visibility = weather.current.vis_km; // Tầm nhìn xa (km)
            const lastUpdated = weather.current.last_updated;

            // Đánh giá thời tiết
            let weatherStatus = "🌞 **Thời tiết đẹp, thích hợp ra ngoài!**";
            if (cloud > 70 || humidity > 80 || windKph > 30) {
                weatherStatus = "🌥 **Thời tiết hơi xấu, cần chú ý!**";
            }
            if (uvIndex > 7) {
                weatherStatus += "\n⚠️ **Chỉ số UV cao, hãy bảo vệ da!**";
            }
            if (humidity > 90 && windKph > 40) {
                weatherStatus = "⛈ **Thời tiết xấu, hãy ở trong nhà!**";
            }

            // Tin nhắn phản hồi
            const weatherMessage = `🌍 **Thời tiết tại ${location}:**\n\n` +
                `🌡 **Nhiệt độ:** ${tempC}°C (Cảm giác như ${feelsLike}°C)\n` +
                `🌤 **Trạng thái:** ${condition}\n` +
                `☁️ **Độ phủ mây:** ${cloud}%\n` +
                `💧 **Độ ẩm:** ${humidity}%\n` +
                `💨 **Tốc độ gió:** ${windKph} km/h\n` +
                `🌡 **Áp suất không khí:** ${pressure} hPa\n` +
                `🔭 **Tầm nhìn xa:** ${visibility} km\n` +
                `🔆 **Chỉ số UV:** ${uvIndex}\n\n` +
                `🕒 **Cập nhật lần cuối:** ${lastUpdated}\n\n` +
                `📢 ${weatherStatus}`;

            // Gửi ảnh icon thời tiết kèm tin nhắn
            bot.sendPhoto(chatId, iconUrl, { caption: weatherMessage });

        } catch (error) {
            console.error("❌ Lỗi lấy dữ liệu thời tiết:", error);
            bot.sendMessage(chatId, "❌ **Không thể lấy thông tin thời tiết.**\n📌 **Hãy kiểm tra lại tên thành phố và thử lại!**");
        }
    }
};
