const fs = require("fs");
const path = require("path");
const PImage = require("pureimage");

const usersFile = path.join(__dirname, "../modules/users.json");
const fontPath = path.join(__dirname, "../modules/DejaVuSansMono.ttf");

if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, "{}");
if (!fs.existsSync("./data")) fs.mkdirSync("./data");

module.exports = {
    name: "tx2",
    execute: function (bot) {
        bot.onText(/\/tx (\d+)/, async (msg, match) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id.toString();
            const userBet = parseInt(match[1]);

            let users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
            if (!users[userId]) users[userId] = { xu: 1000, streak: 1 };

            if (users[userId].xu < userBet) {
                return bot.sendMessage(chatId, "❌ Bạn không đủ xu để cược!");
            }

            await bot.sendDice(chatId, { emoji: "🎲" });

            const result = Math.random() > 0.5 ? "win" : "lose";
            let winAmount = userBet * users[userId].streak * 2;

            if (result === "win") {
                users[userId].xu += winAmount;
                users[userId].streak++;
                bot.sendMessage(chatId, `🎉 Bạn thắng ${winAmount} xu! 🎲`);
                await generateWinImage(bot, chatId, winAmount);
            } else {
                users[userId].xu -= userBet;
                users[userId].streak = 1;
                bot.sendMessage(chatId, `😢 Bạn thua ${userBet} xu! 🎲`);
                await generateLoseImage(bot, chatId);
            }

            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        });
    }
};

// 🎨 Tạo ảnh kết quả
async function generateWinImage(bot, chatId, amount) {
    let img = PImage.make(400, 200);
    let ctx = img.getContext("2d");

    let font = PImage.registerFont(fontPath, "DejaVuSansMono");
    try {
        font.loadSync();
    } catch (error) {
        console.error("⚠️ Lỗi load font:", error);
        return bot.sendMessage(chatId, "⚠️ Không thể tạo ảnh kết quả!");
    }

    ctx.fillStyle = "#0A0";
    ctx.fillRect(0, 0, 400, 200);
    ctx.fillStyle = "#FFF";
    ctx.font = "24px DejaVuSansMono";
    ctx.fillText(`🏆 Bạn thắng ${amount} xu!`, 50, 100);

    let filePath = "./data/win.png";
    try {
        await PImage.encodePNGToStream(img, fs.createWriteStream(filePath));
        bot.sendPhoto(chatId, filePath, { caption: "🔥 Đại gia tài xỉu xuất hiện!" });
    } catch (error) {
        console.error("⚠️ Lỗi tạo ảnh:", error);
        bot.sendMessage(chatId, "⚠️ Không thể tạo ảnh kết quả!");
    }
}

async function generateLoseImage(bot, chatId) {
    let img = PImage.make(400, 200);
    let ctx = img.getContext("2d");

    let font = PImage.registerFont(fontPath, "DejaVuSansMono");
    try {
        font.loadSync();
    } catch (error) {
        console.error("⚠️ Lỗi load font:", error);
        return bot.sendMessage(chatId, "⚠️ Không thể tạo ảnh kết quả!");
    }

    ctx.fillStyle = "#A00";
    ctx.fillRect(0, 0, 400, 200);
    ctx.fillStyle = "#FFF";
    ctx.font = "24px DejaVuSansMono";
    ctx.fillText("💔 Bạn thua rồi, thử lại nhé!", 50, 100);

    let filePath = "./data/lose.png";
    try {
        await PImage.encodePNGToStream(img, fs.createWriteStream(filePath));
        bot.sendPhoto(chatId, filePath, { caption: "💔 Hãy thử lại nhé!" });
    } catch (error) {
        console.error("⚠️ Lỗi tạo ảnh:", error);
        bot.sendMessage(chatId, "⚠️ Không thể tạo ảnh kết quả!");
    }
}
