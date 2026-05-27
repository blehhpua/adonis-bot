const {
    Events,
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    AttachmentBuilder
} = require("discord.js");

const discordTranscripts = require("discord-html-transcripts");

const STAFF_ROLE_ID = "1509213176632180816";
const TICKET_LOG_CHANNEL_ID = "1509317934860861555";

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        if (interaction.customId === "create_ticket") {
            const guild = interaction.guild;
            const user = interaction.user;

            const staffRole = guild.roles.cache.get(STAFF_ROLE_ID);

            if (!staffRole) {
                return interaction.reply({
                    content: "❌ Ticket yetkili rolü bulunamadı.",
                    ephemeral: true
                });
            }

            const safeUsername = user.username
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-");

            const existing = guild.channels.cache.find(
                channel => channel.name === `ticket-${safeUsername}`
            );

            if (existing) {
                return interaction.reply({
                    content: `❌ Zaten açık bir ticketin var: ${existing}`,
                    ephemeral: true
                });
            }

            const ticketChannel = await guild.channels.create({
                name: `ticket-${safeUsername}`,
                type: ChannelType.GuildText,

                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
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
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageMessages
                        ]
                    },
                    {
                        id: client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    }
                ]
            });

            const ticketEmbed = new EmbedBuilder()
                .setColor("#2b1d0e")
                .setTitle("🎫 Ticket Oluşturuldu")
                .setDescription(
                    `${user}, hoş geldin.\n\nSorununu detaylı bir şekilde açıklarsan yetkililer en kısa sürede yardımcı olacaktır.`
                )
                .setFooter({ text: "A R C A N A Ticket Sistemi" });

            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("close_ticket")
                    .setLabel("Ticketi Kapat")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({
                content: `📩 ${user} ticket oluşturdu.\n<@&${STAFF_ROLE_ID}>`,
                embeds: [ticketEmbed],
                components: [closeRow]
            });

            return interaction.reply({
                content: `✅ Ticketin oluşturuldu: ${ticketChannel}`,
                ephemeral: true
            });
        }

        if (interaction.customId === "close_ticket") {
            if (!interaction.channel.name.startsWith("ticket-")) {
                return interaction.reply({
                    content: "❌ Bu kanal bir ticket kanalı değil.",
                    ephemeral: true
                });
            }

            await interaction.reply("🔒 Transcript hazırlanıyor, ticket kapatılıyor...");

            const transcript = await discordTranscripts.createTranscript(interaction.channel, {
                limit: -1,
                returnType: "attachment",
                filename: `${interaction.channel.name}-transcript.html`,
                saveImages: true,
                poweredBy: false
            });

            const logChannel = interaction.guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);

            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor("#2b1d0e")
                    .setTitle("📁 Ticket Transcript")
                    .addFields(
                        {
                            name: "Kanal",
                            value: `${interaction.channel.name}`,
                            inline: true
                        },
                        {
                            name: "Kapatan",
                            value: `${interaction.user}`,
                            inline: true
                        }
                    )
                    .setTimestamp();

                await logChannel.send({
                    embeds: [logEmbed],
                    files: [transcript]
                });
            }

            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 3000);
        }
    }
};