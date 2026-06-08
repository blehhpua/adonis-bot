const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: "lock",

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
                SendMessages: false
            }
        );

        await message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor("#360258")
            .setTitle("🔒 Kanal Kilitlendi")
            .setDescription(
                "Bu kanal yetkililer tarafından kilitlendi."
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