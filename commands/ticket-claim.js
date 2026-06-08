const fs = require("fs");
const path = require("path");

const {
    EmbedBuilder,
    PermissionsBitField
} = require("discord.js");

const ticketsPath =
    path.join(__dirname, "..", "data", "tickets.json");

module.exports = {
    name: "ticket-claim",

    async execute(message) {

        // permission check
        if (
            !message.member.permissions.has(
                PermissionsBitField.Flags.ManageChannels
            )
        ) {
            return message.reply(
                "❌ Yetkin yok."
            );
        }

        // check file exists
        if (!fs.existsSync(ticketsPath)) {

            fs.writeFileSync(
                ticketsPath,
                JSON.stringify({}, null, 4)
            );
        }

        // load tickets
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

        // already claimed
        if (ticket.claimedBy) {
            return message.reply(
                `❌ Bu ticket zaten <@${ticket.claimedBy}> tarafından devralınmış.`
            );
        }

        // claim
        ticket.claimedBy =
            message.author.id;

        // save
        fs.writeFileSync(
            ticketsPath,
            JSON.stringify(tickets, null, 4)
        );

        // rename channel
        await message.channel.setName(
            `ticket-${message.author.username}`
        ).catch(() => {});

        // embed
        const embed = new EmbedBuilder()
            .setColor("#360258")
            .setDescription(
                `Ticket ${message.author} tarafından devralındı.`
            );

        await message.channel.send({
            embeds: [embed]
        });
    }
};