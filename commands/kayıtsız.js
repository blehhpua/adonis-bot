const {
    EmbedBuilder
} = require("discord.js");

const ROLES = {
    kayitsiz: "1508889870297333820",
    uye: "1508889918439559312",
    kadin: "1508890008793255987",
    erkek: "1508889977029656608",
    yetkili: "1508889839246774282"
};

const LOG_CHANNEL_ID = "1508888206710538261";

module.exports = {
    name: "ka",

    async execute(message, args) {

        if (
            !message.member.roles.cache.has(
                ROLES.yetkili
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
                "❌ Kullanım: `a.ka @üye`"
            );
        }

        await member.roles.remove([
            ROLES.uye,
            ROLES.kadin,
            ROLES.erkek
        ]).catch(() => {});

        await member.roles.add(
            ROLES.kayitsiz
        ).catch(() => {});

        await member.setNickname(null)
            .catch(() => {});

        await message.delete()
            .catch(() => {});

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("✦ A R C A N A Kayıtsız Sistemi ✦")
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
                text: "A R C A N A Kayıt Sistemi"
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