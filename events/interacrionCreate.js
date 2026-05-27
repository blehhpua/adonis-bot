// events/interactionCreate.js

const {
    Events,
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {

        if (!interaction.isButton()) return;

        // TICKET OLUŞTUR
        if (interaction.customId === "create_ticket") {

            const guild = interaction.guild;
            const user = interaction.user;

            // TICKET STAFF ROLE ID
            const staffRoleId = "1509213176632180816";

            const staffRole = guild.roles.cache.get(staffRoleId);

            if (!staffRole) {
                return interaction.reply({
                    content: "❌ Ticket Staff rolü bulunamadı.",
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

                    // everyone göremez
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },

                    // ticket sahibi görebilir
                    {
                        id: user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },

                    // ticket staff görebilir
                    {
                        id: staffRole.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageMessages
                        ]
                    },

                    // bot görebilir
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
                .setFooter({
                    text: "Adonis Ticket Sistemi"
                });

            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("close_ticket")
                    .setLabel("Ticketi Kapat")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({
                content: `📩 ${user} ticket oluşturdu.\n<@&${staffRoleId}>`,
                embeds: [ticketEmbed],
                components: [closeRow]
            });

            return interaction.reply({
                content: `✅ Ticketin oluşturuldu: ${ticketChannel}`,
                ephemeral: true
            });
        }

        // TICKET KAPAT
        if (interaction.customId === "close_ticket") {

            if (!interaction.channel.name.startsWith("ticket-")) {
                return interaction.reply({
                    content: "❌ Bu kanal bir ticket kanalı değil.",
                    ephemeral: true
                });
            }

            await interaction.reply(
                "🔒 Ticket 5 saniye içinde kapatılacak..."
            );

            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 5000);
        }
    }
};