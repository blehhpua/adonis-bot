const fs = require("fs");
const path = require("path");

const { EmbedBuilder } = require("discord.js");

const ticketsPath =
    path.join(__dirname, "..", "data", "tickets.json");

module.exports = {
    name: "ticketinfo",

    async execute(message) {

        if (!fs.existsSync(ticketsPath)) {
            return message.reply(
                "❌ Ticket verisi bulunamadı."
            );
        }

        const tickets = JSON.parse(
            fs.readFileSync(ticketsPath, "utf8")
        );

        const ticket =
            tickets[message.channel.id];

        if (!ticket) {
            return message.reply(
                "❌ Bu kanal bir ticket kanalı değil."
            );
        }

        const addedUsers =
            ticket.addedUsers?.length
                ? ticket.addedUsers
                    .map(id => `<@${id}>`)
                    .join(", ")
                : "Yok";

        const createdAt =
            `<t:${Math.floor(ticket.createdAt / 1000)}:R>`;

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("🎫 Ticket Bilgisi")
            .addFields(
                {
                    name: "Sahip",
                    value: `<@${ticket.owner}>`,
                    inline: true
                },
                {
                    name: "Devralan",
                    value: ticket.claimedBy
                        ? `<@${ticket.claimedBy}>`
                        : "Devralınmadı",
                    inline: true
                },
                {
                    name: "Eklenen Kullanıcılar",
                    value: addedUsers
                },
                {
                    name: "Oluşturulma",
                    value: createdAt,
                    inline: true
                },
                {
                    name: "Kanal ID",
                    value: message.channel.id,
                    inline: true
                }
            );

        return message.channel.send({
            embeds: [embed]
        });
    }
};