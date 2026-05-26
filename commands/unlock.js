const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: "unlock",

    async execute(message) {

        if (
            !message.member.permissions.has(
                PermissionFlagsBits.ManageChannels
            )
        ) {
            return message.reply(
                "❌ Bu komutu kullanamazsın."
            );
        }

        await message.channel.permissionOverwrites.edit(
            message.guild.roles.everyone,
            {
                SendMessages: null
            }
        );

        await message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("🔓 Kanal Kilidi Açıldı")
            .setDescription(
                "Bu kanal tekrar kullanıma açıldı."
            )
            .setFooter({
                text: "Adonis Moderasyon Sistemi"
            })
            .setTimestamp();

        message.channel.send({
            embeds: [embed]
        });
    }
};