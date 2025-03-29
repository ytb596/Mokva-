const fs = require("fs");
const path = require("path");
const axios = require("axios"); // Thêm axios để gọi API

// Định nghĩa thư mục lưu dữ liệu
const dirPath = path.join(__dirname, "../thu_cung");
const filePath = path.join(dirPath, "pet.json");

// Tạo thư mục nếu chưa có
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}

// Kiểm tra và tạo file JSON nếu chưa có
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf-8");
}

// Load dữ liệu thú cưng từ file JSON
function loadPets() {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// Lưu dữ liệu thú cưng vào file JSON
function savePets(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Gọi API Dog CEO để lấy hình ảnh ngẫu nhiên
async function getRandomDogImage() {
    try {
        const response = await axios.get("https://dog.ceo/api/breeds/image/random");
        return response.data.message; // Trả về URL hình ảnh ngẫu nhiên
    } catch (error) {
        console.error("Lỗi khi lấy hình ảnh từ API Dog CEO:", error);
        return null; // Nếu lỗi xảy ra, trả về null
    }
}

module.exports = {
    name: "pet",
    description: "🐾 Hệ thống nuôi thú ảo!",
    execute(bot, msg, args) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const pets = loadPets();

        // Nếu chưa có thú cưng, tạo mới
        if (!pets[userId]) {
            pets[userId] = {
                name: "Thú Cưng Bí Ẩn",
                health: 100,
                hunger: 50,
                mood: "😊"
            };
            savePets(pets);
            return bot.sendMessage(chatId, "🎉 Bạn đã nhận được một thú cưng mới! Hãy chăm sóc nó nhé.");
        }

        const pet = pets[userId];

        // Các lệnh tương tác
        if (args[0] === "info") {
            return bot.sendMessage(chatId, `🐾 **Thú cưng của bạn:**  
🏷 **Tên:** ${pet.name}  
❤️ **Sức khỏe:** ${pet.health}/100  
🍖 **Độ đói:** ${pet.hunger}/100  
😊 **Cảm xúc:** ${pet.mood}`);
        }

        if (args[0] === "rename") {
            const newName = args.slice(1).join(" ");
            if (!newName) return bot.sendMessage(chatId, "🚫 Hãy nhập tên mới cho thú cưng!");
            pet.name = newName;
            savePets(pets);
            return bot.sendMessage(chatId, `✅ Thú cưng của bạn bây giờ có tên là **${newName}**!`);
        }

        if (args[0] === "feed") {
            pet.hunger += 20;
            if (pet.hunger > 100) pet.hunger = 100;
            pet.mood = "😊";
            savePets(pets);

            // Lấy hình ảnh chó ngẫu nhiên và gửi cho người dùng
            getRandomDogImage().then(imageUrl => {
                if (imageUrl) {
                    bot.sendPhoto(chatId, imageUrl, { caption: "🍖 Bạn đã cho thú cưng ăn! Nó đang rất vui vẻ!" });
                } else {
                    bot.sendMessage(chatId, "🍖 Bạn đã cho thú cưng ăn! Nó đang rất vui vẻ!");
                }
            });
            return;
        }

        if (args[0] === "play") {
            pet.mood = "😆";
            savePets(pets);

            // Lấy hình ảnh chó ngẫu nhiên và gửi cho người dùng
            getRandomDogImage().then(imageUrl => {
                if (imageUrl) {
                    bot.sendPhoto(chatId, imageUrl, { caption: "🎾 Bạn đã chơi với thú cưng! Nó đang rất vui vẻ!" });
                } else {
                    bot.sendMessage(chatId, "🎾 Bạn đã chơi với thú cưng! Nó đang rất vui vẻ!");
                }
            });
            return;
        }

        return bot.sendMessage(chatId, "📖 Các lệnh nuôi thú ảo:\n`pet info` - Xem thông tin thú cưng\n`pet rename [tên]` - Đổi tên\n`pet feed` - Cho ăn\n`pet play` - Chơi đùa");
    }
};

// Chạy tự động mỗi giờ: Thú cưng tự kiếm ăn
setInterval(() => {
    const pets = loadPets();

    for (let userId in pets) {
        const pet = pets[userId];

        // Nếu đói quá, thú cưng tự kiếm ăn
        if (pet.hunger <= 20) {
            pet.hunger += 30; // Kiếm được đồ ăn
            if (pet.hunger > 100) pet.hunger = 100;
            pet.mood = "😊";
        } else {
            pet.hunger -= 10; // Dần dần đói nếu không được ăn
            if (pet.hunger <= 0) {
                pet.health -= 10; // Sức khỏe giảm nếu quá đói
                pet.mood = "🥺";
            }
        }

        // Nếu sức khỏe quá thấp, thú cưng bỏ đi
        if (pet.health <= 0) {
            delete pets[userId];
        }
    }

    savePets(pets);
}, 60 * 60 * 1000); // Mỗi giờ kiểm tra
