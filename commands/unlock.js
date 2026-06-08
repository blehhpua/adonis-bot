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
            .setColor("#360258")
            .setTitle("🔓 Kanal Kilidi Açıldı")
            .setDescription(
                "Bu kanal tekrar kullanıma açıldı."
            )
            .setFooter({
                text: "A R C A N A Lock Sistemi"
            })
            .setTimestamp();

        message.channel.send({
            embeds: [embed]
        });
    }
};