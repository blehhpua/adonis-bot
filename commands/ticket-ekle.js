const fs = require("fs");
const path = require("path");

const {
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const ticketsPath =
    path.join(__dirname, "..", "data", "tickets.json");

module.exports = {
    name: "ticket-ekle",

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
            return message.reply("❌ Bir kullanıcı etiketlemelisin. Örnek: `a.ekle @user`");
        }

        if (user.bot) {
            return message.reply("❌ Botları ticketa ekleyemezsin.");
        }

        await message.channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        if (!ticket.addedUsers) {
            ticket.addedUsers = [];
        }

        if (!ticket.addedUsers.includes(user.id)) {
            ticket.addedUsers.push(user.id);
        }

        fs.writeFileSync(
            ticketsPath,
            JSON.stringify(tickets, null, 4)
        );

        const embed = new EmbedBuilder()
            .setColor("#360258")
            .setDescription(`☾ ${user} bu ticketa eklendi.`);

        return message.channel.send({
            embeds: [embed]
        });
    }
};