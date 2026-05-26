const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const LOG_CHANNEL_ID = "1508900068613161061";

module.exports = {
    name: "mute",

    async execute(message, args) {

        if (
            !message.member.permissions.has(
                PermissionFlagsBits.ModerateMembers
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

        const duration = args[1];

        if (!duration) {
            return message.reply(
                "❌ Kullanım: `a.mute @üye süre sebep`"
            );
        }

        const reason =
            args.slice(2).join(" ")
            || "Sebep belirtilmedi.";

        let time;

        if (duration.endsWith("m")) {
            time = parseInt(duration) * 60 * 1000;
        }
        else if (duration.endsWith("h")) {
            time = parseInt(duration) * 60 * 60 * 1000;
        }
        else if (duration.endsWith("d")) {
            time = parseInt(duration) * 24 * 60 * 60 * 1000;
        }
        else {
            return message.reply(
                "❌ Süre formatı: 10m / 1h / 1d"
            );
        }

        await member.timeout(time, reason);

        await message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("✦ Adonis Mute Sistemi ✦")
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
                    name: "⏰ Süre",
                    value: duration,
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