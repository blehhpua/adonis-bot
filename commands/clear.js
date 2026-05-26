const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "clear",

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply("❌ Bu komutu kullanamazsın.");
        }

        const amount = parseInt(args[0]);

        if (!amount || amount < 1 || amount > 100) {
            return message.reply("❌ Kullanım: `a.clear 1-100`");
        }

        await message.channel.bulkDelete(amount, true);

        const msg = await message.channel.send(`🧹 ${amount} mesaj silindi.`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
    }
};