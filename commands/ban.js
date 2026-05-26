const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const LOG_CHANNEL_ID = "1508896980565360690";

module.exports = {
    name: "ban",

    async execute(message, args) {

        if (
            !message.member.permissions.has(
                PermissionFlagsBits.BanMembers
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

        if (!member.bannable) {
            return message.reply(
                "❌ Bu üyeyi banlayamam."
            );
        }

        const reason =
            args.slice(1).join(" ")
            || "Sebep belirtilmedi.";

        await member.ban({
            reason
        });

        await message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("🔨 Kullanıcı Yasaklandı")
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