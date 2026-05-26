const {
    Events,
    EmbedBuilder
} = require("discord.js");

const KAYITSIZ_ROLE_ID = "1508889870297333820";
const BOT_ROLE_ID = "1508897436939321414";

const WELCOME_CHANNEL_ID = "1508888262356504789";

module.exports = {
    name: Events.GuildMemberAdd,

    async execute(member) {

        // bot autorole
        if (member.user.bot) {

            await member.roles.add(
                BOT_ROLE_ID
            ).catch(() => {});

            return;
        }

        // give kayıtsız role
        await member.roles.add(
            KAYITSIZ_ROLE_ID
        ).catch(() => {});

        // set nickname
        await member.setNickname(
            "İsim | Yaş"
        ).catch(() => {});

        // fake account check
        const createdAt =
            member.user.createdTimestamp;

        const now = Date.now();

        const sevenDays =
            7 * 24 * 60 * 60 * 1000;

        const isSuspicious =
            now - createdAt < sevenDays;

        const channel =
            member.guild.channels.cache.get(
                WELCOME_CHANNEL_ID
            );

        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("✦ Adonis'e Hoş Geldin ✦")
            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true,
                    size: 1024
                })
            )
            .setDescription(
                `${member} sunucuya katıldı.\n\n` +
                `Kayıt olmak için kayıt yetkililerini bekle.\n` +
                `İsmini yaşınla birlikte belirtmeyi unutma.`
            )
            .addFields(
                {
                    name: "👤 Kullanıcı",
                    value: `${member.user.tag}`,
                    inline: true
                },
                {
                    name: "🆔 ID",
                    value: member.id,
                    inline: true
                },
                {
                    name: "📅 Hesap Oluşturma",
                    value:
                        `<t:${parseInt(member.user.createdTimestamp / 1000)}:R>`,
                    inline: true
                },
                {
                    name: "⚠️ Hesap Durumu",
                    value:
                        isSuspicious
                            ? "Şüpheli Hesap"
                            : "Güvenli Hesap",
                    inline: true
                }
            )
            .setFooter({
                text: "Adonis Welcome System"
            })
            .setTimestamp();

        channel.send({
            content:
                `${member} hoş geldin.`,
            embeds: [embed]
        });
    }
};