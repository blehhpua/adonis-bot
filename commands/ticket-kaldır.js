const fs = require("fs");
const path = require("path");

const {
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const ticketsPath =
    path.join(__dirname, "..", "data", "tickets.json");

module.exports = {
    name: "ticket-kaldır",

    async execute(message, args) {

        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply("❌ Yetkin yok.");
        }

        if (!fs.existsSync(ticketsPath)) {
            return message.reply("❌ Ticket verisi bulunamadı.");
        }

        const tickets = JSON.parse(
            fs.readFileSync(ticketsPath, "utf8")
        );

        const ticket = tickets[message.channel.id];

        if (!ticket) {
            return message.reply("❌ Bu kanal bir ticket kanalı değil.");
        }

        const user = message.mentions.users.first();

        if (!user) {
            return message.reply("❌ Bir kullanıcı etiketlemelisin. Örnek: `a.kaldir @user`");
        }

        if (user.id === ticket.owner) {
            return message.reply("❌ Ticket sahibini kaldıramazsın.");
        }

        if (user.id === ticket.claimedBy) {
            return message.reply("❌ Ticketi devralan yetkiliyi kaldıramazsın.");
        }

        await message.channel.permissionOverwrites.delete(user.id)
            .catch(() => {});

        if (!ticket.addedUsers) {
            ticket.addedUsers = [];
        }

        ticket.addedUsers =
            ticket.addedUsers.filter(id => id !== user.id);

        fs.writeFileSync(
            ticketsPath,
            JSON.stringify(tickets, null, 4)
        );

        const embed = new EmbedBuilder()
            .setColor("#360258")
            .setDescription(`☾ ${user} bu ticketten kaldırıldı.`);

        return message.channel.send({
            embeds: [embed]
        });
    }
};