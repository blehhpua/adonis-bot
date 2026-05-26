const fs = require("fs");
const path = require("path");

const afkPath = path.join(__dirname, "../data/afk.json");

module.exports = {
    name: "afk",

    async execute(message, args) {
        let afkData = {};

        if (fs.existsSync(afkPath)) {
            afkData = JSON.parse(fs.readFileSync(afkPath, "utf8"));
        }

        const reason = args.join(" ") || "Sebep belirtilmedi.";

        afkData[message.author.id] = {
            reason: reason,
            time: Date.now()
        };

        fs.writeFileSync(afkPath, JSON.stringify(afkData, null, 4));

        message.reply(`🌙 AFK moduna geçtin. Sebep: **${reason}**`);
    }
};