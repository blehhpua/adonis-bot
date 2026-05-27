const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "snipe",

    async execute(message, args, client) {
        const snipe = client.snipes?.get(message.channel.id);

        if (!snipe) {
            return message.reply("❌ Bu kanalda silinen mesaj bulunamadı.");
        }

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("✦ A R C A N A Snipe Sistemi ✦")
            .setThumbnail(
                snipe.author.displayAvatarURL({
                    dynamic: true
                })
            )
            .addFields(
                {
                    name: "👤 Kullanıcı",
                    value: `${snipe.author.tag}`,
                    inline: true
                },
                {
                    name: "💬 Mesaj",
                    value: snipe.content,
                    inline: false
                },
                {
                    name: "⏰ Silinme Zamanı",
                    value: `<t:${parseInt(snipe.date / 1000)}:R>`,
                    inline: true
                }
            )
            .setFooter({
                text: "A R C A N A Moderasyon Sistemi"
            })
            .setTimestamp();

        if (snipe.image) {
            embed.setImage(snipe.image);
        }

        message.channel.send({
            embeds: [embed]
        });
    }
};