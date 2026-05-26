const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const LOG_CHANNEL_ID = "1508900068613161061";

module.exports = {
    name: "unmute",

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

        await member.timeout(null);

        await message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("✦ Adonis Unmute Sistemi ✦")
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