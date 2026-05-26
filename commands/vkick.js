const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "vkick",

    async execute(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
            return message.reply("❌ Bu komutu kullanamazsın.");
        }

        const member = message.mentions.members.first();

        if (!member || !member.voice.channel) {
            return message.reply("❌ Kullanıcı ses kanalında değil.");
        }

        await member.voice.disconnect();
        await message.delete().catch(() => {});
    }
};