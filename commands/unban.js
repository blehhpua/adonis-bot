const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const LOG_CHANNEL_ID = "1508896980565360690";

module.exports = {
    name: "unban",

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

        const userId = args[0];

        if (!userId) {
            return message.reply(
                "❌ Kullanım: `a.unban USER_ID`"
            );
        }

        const reason =
            args.slice(1).join(" ")
            || "Sebep belirtilmedi.";

        try {

            const bannedUsers =
                await message.guild.bans.fetch();

            const bannedUser =
                bannedUsers.get(userId);

            if (!bannedUser) {
                return message.reply(
                    "❌ Bu ID'ye sahip banlı kullanıcı bulunamadı."
                );
            }

            await message.guild.members.unban(
                userId,
                reason
            );

            await message.delete().catch(() => {});

            const embed = new EmbedBuilder()
                .setColor("#2b1d0e")
                .setTitle("✦ Adonis Unban Sistemi ✦")
                .setThumbnail(
                    bannedUser.user.displayAvatarURL({
                        dynamic: true
                    })
                )
                .addFields(
                    {
                        name: "👤 Kullanıcı",
                        value: `${bannedUser.user.tag}`,
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

        } catch (err) {

            console.error(err);

            message.reply(
                "❌ Ban kaldırılırken hata oluştu."
            );
        }
    }
};