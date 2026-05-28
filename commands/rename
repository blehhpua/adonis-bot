const fs = require("fs");
const path = require("path");

const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const ticketsPath =
    path.join(__dirname, "..", "data", "tickets.json");

module.exports = {
    name: "rename",

    async execute(message, args) {

        // permission check
        if (
            !message.member.permissions.has(
                PermissionFlagsBits.ManageChannels
            )
        ) {
            return message.reply(
                "❌ Yetkin yok."
            );
        }

        // check ticket file
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

        // check if ticket
        if (!ticket) {
            return message.reply(
                "❌ Bu kanal bir ticket kanalı değil."
            );
        }

        // get new name
        const newName = args.join("-")
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "");

        if (!newName) {
            return message.reply(
                "❌ Yeni bir isim belirtmelisin.\nÖrnek: `a.rename ödeme-sorunu`"
            );
        }

        // rename channel
        await message.channel.setName(
            `ticket-${newName}`
        );

        // embed
        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setDescription(
                `☾ Ticket ismi \`ticket-${newName}\` olarak değiştirildi.`
            );

        return message.channel.send({
            embeds: [embed]
        });
    }
};