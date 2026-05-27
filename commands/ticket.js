const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    name: "ticket",
    description: "Ticket panelini oluşturur",

    async execute(message) {

        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply(
                "❌ Bu komutu kullanmak için yetkin yok."
            );
        }

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("🎫 Destek Sistemi")
            .setDescription(
                "Destek almak için aşağıdaki butona basarak bir ticket oluşturabilirsin."
            )
            .setFooter({
                text: "A R C A N A Ticket Sistemi"
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("create_ticket")
                .setLabel("Ticket Oluştur")
                .setEmoji("🎫")
                .setStyle(ButtonStyle.Secondary)
        );

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });

        await message.reply(
            "✅ Ticket başarıyla oluşturuldu."
        );
    }
};