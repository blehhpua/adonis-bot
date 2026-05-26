const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "vunmute",

    async execute(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return message.reply("❌ Bu komutu kullanamazsın.");
        }

        const member = message.mentions.members.first();

        if (!member || !member.voice.channel) {
            return message.reply("❌ Kullanıcı ses kanalında değil.");
        }

        await member.voice.setMute(false);
        await message.delete().catch(() => {});
    }
};