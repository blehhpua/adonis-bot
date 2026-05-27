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
            .setColor("#2b1d0e")
            .setTitle("🔒 Kanal Kilitlendi")
            .setDescription(
                "Bu kanal yetkililer tarafından kilitlendi."
            )
            .setFooter({
                text: "A R C A N A Moderasyon Sistemi"
            })
            .setTimestamp();

        message.channel.send({
            embeds: [embed]
        });
    }
};