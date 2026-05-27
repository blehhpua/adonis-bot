const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const JAIL_ROLE_ID = "1508905746501337109";
const LOG_CHANNEL_ID = "1508905668978147328";

module.exports = {
    name: "unjail",

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
                "❌ Kullanım: `a.unjail @üye`"
            );
        }

        const jailRole =
            message.guild.roles.cache.get(
                JAIL_ROLE_ID
            );

        if (!jailRole) {
            return message.reply(
                "❌ Jail rolü bulunamadı."
            );
        }

        if (
            !member.roles.cache.has(
                JAIL_ROLE_ID
            )
        ) {
            return message.reply(
                "❌ Bu kullanıcı jailde değil."
            );
        }

        await member.roles.remove(
            JAIL_ROLE_ID
        );

        await message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("✦ A R C A N A Unjail Sistemi ✦")
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
                text: "A R C A N A Moderasyon Sistemi"
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