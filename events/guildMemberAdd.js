const {
    Events,
    EmbedBuilder
} = require("discord.js");

const KAYITSIZ_ROLE_ID = "1508889870297333820";
const BOT_ROLE_ID = "1508897436939321414";

const WELCOME_CHANNEL_ID = "1508888262356504789";

const RAID_LOG_CHANNEL_ID = "1509318603969925260";
const QUARANTINE_ROLE_ID = "1508889870297333820";

const joins = new Map();

const JOIN_LIMIT = 5;
const TIME_WINDOW = 10000;
const LOCK_TIME = 60000;

let raidMode = false;

module.exports = {
    name: Events.GuildMemberAdd,

    async execute(member) {
        const guild = member.guild;
        const now = Date.now();

        if (!joins.has(guild.id)) {
            joins.set(guild.id, []);
        }

        const guildJoins = joins.get(guild.id);
        guildJoins.push(now);

        const recentJoins = guildJoins.filter(
            time => now - time < TIME_WINDOW
        );

        joins.set(guild.id, recentJoins);

        // bot autorole
        if (member.user.bot) {
            await member.roles.add(BOT_ROLE_ID).catch(() => {});
            return;
        }

        // anti-raid active
        if (raidMode) {
            await member.roles.add(QUARANTINE_ROLE_ID).catch(() => {});

            const raidLog = guild.channels.cache.get(RAID_LOG_CHANNEL_ID);

            if (raidLog) {
                await raidLog.send(
                    `🚨 Raid modu aktif olduğu için ${member} karantinaya alındı.`
                );
            }

            return;
        }

        // anti-raid trigger
        if (recentJoins.length >= JOIN_LIMIT) {
            raidMode = true;

            const raidLog = guild.channels.cache.get(RAID_LOG_CHANNEL_ID);

            if (raidLog) {
                const raidEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("🚨 Anti-Raid Aktif")
                    .setDescription(
                        `Kısa sürede **${recentJoins.length}** kişi sunucuya katıldı.\n\nYeni gelen üyeler geçici olarak karantinaya alınacak.`
                    )
                    .setTimestamp();

                await raidLog.send({
                    embeds: [raidEmbed]
                });
            }

            await member.roles.add(QUARANTINE_ROLE_ID).catch(() => {});

            setTimeout(async () => {
                raidMode = false;

                const raidLog = guild.channels.cache.get(RAID_LOG_CHANNEL_ID);

                if (raidLog) {
                    await raidLog.send(
                        "✅ Anti-raid modu kapatıldı. Sunucu normale döndü."
                    );
                }
            }, LOCK_TIME);

            return;
        }

        // give kayıtsız role
        await member.roles.add(KAYITSIZ_ROLE_ID).catch(() => {});

        // set nickname
        await member.setNickname("İsim | Yaş").catch(() => {});

        // fake account check
        const createdAt = member.user.createdTimestamp;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        const isSuspicious = now - createdAt < sevenDays;

        const channel = guild.channels.cache.get(WELCOME_CHANNEL_ID);

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
            content: `${member} hoş geldin.`,
            embeds: [embed]
        });
    }
};