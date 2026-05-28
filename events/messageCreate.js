const { Events } = require("discord.js");

const fs = require("fs");
const path = require("path");

const PREFIX = "a.";

const afkPath =
    path.join(__dirname, "../data/afk.json");

module.exports = {
    name: Events.MessageCreate,

    async execute(message, client) {

        if (message.author.bot) return;

        let afkData = {};

        if (fs.existsSync(afkPath)) {
            afkData = JSON.parse(
                fs.readFileSync(afkPath, "utf8")
            );
        }

        // remove AFK when user talks
        if (
            afkData[message.author.id] &&
            !message.content.startsWith(`${PREFIX}afk`)
        ) {
            delete afkData[message.author.id];

            fs.writeFileSync(
                afkPath,
                JSON.stringify(afkData, null, 4)
            );

            await message.reply(
                "🌙 AFK modundan çıktın."
            );
        }

        // mention AFK users
        message.mentions.users.forEach(user => {
            if (afkData[user.id]) {
                message.reply(
                    `🌙 ${user.tag} şu anda AFK.\nSebep: **${afkData[user.id].reason}**`
                );
            }
        });

        // prefix commands
        if (!message.content.startsWith(PREFIX)) return;

        const args = message.content
            .slice(PREFIX.length)
            .trim()
            .split(/ +/);

        const commandName =
            args.shift().toLowerCase();

        const command =
            client.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(
                message,
                args,
                client
            );
        } catch (error) {
            console.error(error);

            message.reply(
                "❌ Komut çalıştırılırken hata oluştu."
            );
        }
    }
};