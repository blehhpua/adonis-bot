const {
    Events,
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const discordTranscripts = require("discord-html-transcripts");

const STAFF_ROLE_ID = "1509213176632180816";
const TICKET_LOG_CHANNEL_ID = "1509317934860861555";

const dataPath = path.join(__dirname, "../data");
const ticketsPath = path.join(dataPath, "tickets.json");

function ensureJson(filePath, defaultValue) {
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 4));
    }
}

function readJson(filePath, defaultValue) {
    ensureJson(filePath, defaultValue);
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
        fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 4));
        return defaultValue;
    }
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {

        if (!interaction.isButton()) return;

        // CREATE
        if (interaction.customId === "create_ticket") {
            const guild = interaction.guild;
            const user = interaction.user;
            const staffRole = guild.roles.cache.get(STAFF_ROLE_ID);

            if (!staffRole) {
                return interaction.reply({ content: "❌ Ticket yetkili rolü bulunamadı.", ephemeral: true });
            }

            const tickets = readJson(ticketsPath, {});
            const alreadyOpen = Object.entries(tickets).find(
                ([id, t]) => t.owner === user.id && guild.channels.cache.has(id)
            );

            if (alreadyOpen) {
                return interaction.reply({
                    content: `❌ Zaten açık bir ticketin var: <#${alreadyOpen[0]}>`,
                    ephemeral: true
                });
            }

            const safeUsername = user.username.toLowerCase().replace(/[^a-z0-9]/g, "-");

            const ticketChannel = await guild.channels.create({
                name: `ticket-${safeUsername}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    {
                        id: user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: STAFF_ROLE_ID,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages
                        ]
                    }
                ]
            });

            tickets[ticketChannel.id] = {
                owner: user.id,
                claimedBy: null
            };

            writeJson(ticketsPath, tickets);

            const embed = new EmbedBuilder()
                .setColor("#360258")
                .setTitle("🎫 Ticket")
                .setDescription(`${user}, hoş geldin.\n\nSorununu detaylı bir şekilde açıklarsan yetkililer en kısa sürede yardımcı olacaktır.`);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("claim_ticket")
                    .setLabel("Devral")
                    .setEmoji("📌")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("close_ticket")
                    .setLabel("Kapat")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({
                content: `📩 ${user} ticket oluşturdu.\n<@&${STAFF_ROLE_ID}>`,
                embeds: [embed],
                components: [row]
            });

            return interaction.reply({
                content: `✅ Ticketin oluşturuldu: ${ticketChannel}`,
                ephemeral: true
            });
        }

        // CLAIM
        if (interaction.customId === "claim_ticket") {
            const tickets = readJson(ticketsPath, {});
            const ticket = tickets[interaction.channel.id];

            if (!ticket) return interaction.reply({ content: "❌ Bu kanal bir ticket kanalı değil.", ephemeral: true });

            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                return interaction.reply({ content: "❌ Bu ticketi devralmak için yetkin yok.", ephemeral: true });
            }

            if (ticket.claimedBy) {
                return interaction.reply({
                    content: `❌ Bu ticket zaten <@${ticket.claimedBy}> tarafından devralınmış.`,
                    ephemeral: true
                });
            }

            ticket.claimedBy = interaction.user.id;
            writeJson(ticketsPath, tickets);

            await interaction.channel.setName(`ticket-${interaction.user.username}`).catch(() => {});

            return interaction.reply({ content: "✅ Devralındı." });
        }

        // CLOSE
        if (interaction.customId === "close_ticket") {
            const tickets = readJson(ticketsPath, {});
            const ticket = tickets[interaction.channel.id];

            if (!ticket) return interaction.reply({ content: "❌ Bu kanal bir ticket kanalı değil.", ephemeral: true });

            await interaction.reply("🔒 Transcript hazırlanıyor, ticket kapatılıyor...");

            const transcript = await discordTranscripts.createTranscript(interaction.channel, {
                returnType: "attachment"
            });

            const logChannel = interaction.guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);

            if (logChannel) {
                await logChannel.send({
                    content: `Ticket kapandı | Açan: <@${ticket.owner}>`,
                    files: [transcript]
                });
            }

            delete tickets[interaction.channel.id];
            writeJson(ticketsPath, tickets);

            setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
        }
    }
};