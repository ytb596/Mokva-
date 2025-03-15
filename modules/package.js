const { spawn } = require("child_process");
const os = require("os");

module.exports = {
    name: "package",
    execute: async (bot, msg, args) => {
        const chatId = msg.chat.id;
        const userName = msg.from.username || msg.from.first_name;

        console.log(`[LOG] User @${userName} đã thực hiện: /package ${args.join(" ")}`);

        if (args.length < 1) {
            return bot.sendMessage(chatId, "❌ Sai cú pháp!\n"
                + "📌 Sử dụng:\n"
                + "/package install <package>\n"
                + "/package uninstall <package>\n"
                + "/package update\n"
                + "/package version");
        }

        const command = args[0];  
        const packageName = args[1] || "";  

        // Kiểm tra nền tảng Termux
        const isTermux = os.platform() === "android";

        // Xác định lệnh cho `pkg` hoặc `npm`
        const cmdMap = {
            "install": isTermux ? ["pkg", ["install", packageName, "-y"]] : ["npm", ["install", packageName, "-y"]],
            "uninstall": isTermux ? ["pkg", ["uninstall", packageName, "-y"]] : ["npm", ["uninstall", packageName, "-y"]],
            "update": isTermux ? ["pkg", ["update", "-y"]] : ["npm", ["update", "-y"]],
            "version": isTermux ? ["pkg", ["--version"]] : ["npm", ["-v"]]
        };

        if (!cmdMap[command]) {
            return bot.sendMessage(chatId, "❌ Lệnh không hợp lệ!");
        }

        const [cmd, cmdArgs] = cmdMap[command];

        bot.sendMessage(chatId, `⏳ Đang thực thi: \`${cmd} ${cmdArgs.join(" ")}\``);

        const process = spawn(cmd, cmdArgs);

        process.stdout.on("data", (data) => {
            const output = data.toString().trim();
            console.log(`[OUT] ${output}`);
            if (command === "version") {
                bot.sendMessage(chatId, `📌 Phiên bản: \`${output}\``);
            }
        });

        process.stderr.on("data", (data) => {
            console.error(`[ERROR] ${data.toString()}`);
        });

        process.on("close", (code) => {
            if (command !== "version") {
                bot.sendMessage(chatId, `✅ Hoàn thành với mã thoát: ${code}`);
            }
        });
    }
};
