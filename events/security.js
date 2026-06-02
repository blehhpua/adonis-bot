const {
    Events,
    PermissionFlagsBits
} = require("discord.js");

const LOG_CHANNEL_ID = "1508917588615368864";

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {

        if (message.author.bot) return;
        if (!message.guild) return;

        if (
            message.member.permissions.has(
                PermissionFlagsBits.ManageMessages
            )
        ) return;

        const content =
            message.content.toLowerCase();

        const hasLink =
            content.includes("http://") ||
            content.includes("discord.gg/");

        if (hasLink) {

            await message.delete().catch(() => {});

            message.channel.send({
                content:
                    `${message.author}, link paylaşmak yasak.`
            }).then(msg => {

                setTimeout(() => {
                    msg.delete().catch(() => {});
                }, 4000);

            });

            const logChannel =
                message.guild.channels.cache.get(
                    LOG_CHANNEL_ID
                );

            if (logChannel) {

                logChannel.send(
                    `🛡 Anti-Link Sistemi\n\n` +
                    `👤 Kullanıcı: ${message.author.tag}\n` +
                    `📺 Kanal: ${message.channel}\n` +
                    `💬 Mesaj: ${message.content}`
                );
            }
        }
    }
};