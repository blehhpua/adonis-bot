const {
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: "info",

    async execute(message, args) {

        const member =
            message.mentions.members.first()
            || message.member;

        const roles =
            member.roles.cache
                .filter(role => role.id !== message.guild.id)
                .map(role => role)
                .join(", ");

        const embed = new EmbedBuilder()
            .setColor("#360258")
            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true,
                    size: 1024
                })
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
                    name: "🤖 Bot mu?",
                    value: member.user.bot ? "Evet" : "Hayır",
                    inline: true
                },
                {
                    name: "📅 Hesap Oluşturma",
                    value:
                        `<t:${parseInt(member.user.createdTimestamp / 1000)}:F>`,
                    inline: false
                },
                {
                    name: "📥 Sunucuya Katılma",
                    value:
                        `<t:${parseInt(member.joinedTimestamp / 1000)}:F>`,
                    inline: false
                },
                {
                    name: "🎭 Roller",
                    value:
                        roles.length > 0
                            ? roles
                            : "Rol yok."
                }
            )
            .setTimestamp();

        message.channel.send({
            embeds: [embed]
        });
    }
};