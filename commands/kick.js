const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const LOG_CHANNEL_ID = "1508896999276155005";

module.exports = {
    name: "kick",

    async execute(message, args) {

        if (
            !message.member.permissions.has(
                PermissionFlagsBits.KickMembers
            )
        ) {
            return message.reply(
                "❌ Bu komutu kullanamazsın."
            );
        }

        const member =
            message.mentions.members.first();

        if (!member) {
            return message.reply(
                "❌ Bir üye etiketle."
            );
        }

        if (!member.kickable) {
            return message.reply(
                "❌ Bu üyeyi atamam."
            );
        }

        const reason =
            args.slice(1).join(" ")
            || "Sebep belirtilmedi.";

        await member.kick(reason);

        await message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("✦ Adonis Kick Sistemi ✦")
            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true
                })
            )
            .addFields(
                {
                    name: "👤 Kullanıcı",
                    value: `${member.user.tag}`,
                    inline: true
                },
                {
                    name: "🛡 Yetkili",
                    value: `${message.author.tag}`,
                    inline: true
                },
                {
                    name: "📄 Sebep",
                    value: reason,
                    inline: false
                }
            )
            .setFooter({
                text: "Adonis Moderasyon Sistemi"
            })
            .setTimestamp();

        const logChannel =
            message.guild.channels.cache.get(
                LOG_CHANNEL_ID
            );

        if (logChannel) {
            logChannel.send({
                embeds: [embed]
            });
        }
    }
};