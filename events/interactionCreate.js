const {
    Events,
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const discordTranscripts = require("discord-html-transcripts");

const STAFF_ROLE_ID = "1509213176632180816";
const TICKET_LOG_CHANNEL_ID = "1509317934860861555";

const dataPath = path.join(__dirname, "../data");
const ticketsPath = path.join(dataPath, "tickets.json");
const vcPath = path.join(dataPath, "tempVcs.json");

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

function getPersonalVc(interaction) {
    const vcData = readJson(vcPath, {});
    const vc = vcData[interaction.channel.id];

    return {
        vcData,
        vc
    };
}

function isVcOwner(interaction, vc) {
    return vc && vc.owner === interaction.user.id;
}

function createLimitModal() {
    const input = new TextInputBuilder()
        .setCustomId("vc_limit_value")
        .setLabel("Kullanıcı limiti")
        .setPlaceholder("0-99 arası yaz. 0 limitsiz yapar.")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(2);

    return new ModalBuilder()
        .setCustomId("vc_user_limit_modal")
        .setTitle("Kullanıcı Limiti")
        .addComponents(
            new ActionRowBuilder().addComponents(input)
        );
}

function createTransferModal() {
    const input = new TextInputBuilder()
        .setCustomId("vc_transfer_user")
        .setLabel("Yeni sahip")
        .setPlaceholder("Kullanıcı ID veya @etiket yaz")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    return new ModalBuilder()
        .setCustomId("vc_transfer_modal")
        .setTitle("Sahiplik Devri")
        .addComponents(
            new ActionRowBuilder().addComponents(input)
        );
}

async function replyNotPersonalVc(interaction) {
    return interaction.reply({
        content: "❌ Bu kanal kişisel bir ses kanalı değil.",
        ephemeral: true
    });
}

async function replyNotOwner(interaction) {
    return interaction.reply({
        content: "❌ Bu ses kanalının sahibi sen değilsin.",
        ephemeral: true
    });
}

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {
        if (interaction.isModalSubmit()) {
            if (
                interaction.customId !== "vc_user_limit_modal" &&
                interaction.customId !== "vc_transfer_modal"
            ) {
                return;
            }

            const { vcData, vc } = getPersonalVc(interaction);

            if (!vc) {
                return replyNotPersonalVc(interaction);
            }

            if (!isVcOwner(interaction, vc)) {
                return replyNotOwner(interaction);
            }

            if (interaction.customId === "vc_user_limit_modal") {
                const limitText = interaction.fields
                    .getTextInputValue("vc_limit_value")
                    .trim();

                const limit = Number(limitText);

                if (
                    !Number.isInteger(limit) ||
                    limit < 0 ||
                    limit > 99
                ) {
                    return interaction.reply({
                        content: "❌ Limit 0 ile 99 arasında bir sayı olmalı.",
                        ephemeral: true
                    });
                }

                await interaction.channel.setUserLimit(
                    limit,
                    "Kişisel oda sahibi kullanıcı limitini değiştirdi."
                );

                vc.userLimit = limit;
                writeJson(vcPath, vcData);

                return interaction.reply({
                    content: limit === 0
                        ? "✅ Oda limiti kaldırıldı."
                        : `✅ Oda limiti ${limit} olarak ayarlandı.`,
                    ephemeral: true
                });
            }

            if (interaction.customId === "vc_transfer_modal") {
                const targetText = interaction.fields
                    .getTextInputValue("vc_transfer_user")
                    .trim();

                const targetId = targetText.match(/\d{17,20}/)?.[0];

                if (!targetId) {
                    return interaction.reply({
                        content: "❌ Geçerli bir kullanıcı ID veya etiket yazmalısın.",
                        ephemeral: true
                    });
                }

                const targetMember =
                    await interaction.guild.members.fetch(targetId)
                        .catch(() => null);

                if (!targetMember || targetMember.user.bot) {
                    return interaction.reply({
                        content: "❌ Bu kullanıcı sunucuda bulunamadı.",
                        ephemeral: true
                    });
                }

                if (!interaction.channel.members.has(targetMember.id)) {
                    return interaction.reply({
                        content: "❌ Sahipliği vereceğin kişi bu ses odasında olmalı.",
                        ephemeral: true
                    });
                }

                await interaction.channel.permissionOverwrites.delete(
                    vc.owner,
                    "Kişisel oda sahipliği devredildi."
                ).catch(() => {});

                await interaction.channel.permissionOverwrites.edit(
                    targetMember.id,
                    {
                        ViewChannel: true,
                        Connect: true,
                        Speak: true,
                        ManageChannels: true,
                        MoveMembers: true
                    },
                    { reason: "Kişisel oda sahipliği devredildi." }
                );

                vc.owner = targetMember.id;
                writeJson(vcPath, vcData);

                await interaction.channel.setName(
                    `🎧 ${targetMember.displayName}`
                ).catch(() => {});

                return interaction.reply({
                    content: `👑 Oda sahipliği ${targetMember} kullanıcısına verildi.`,
                    ephemeral: true
                });
            }

            return;
        }

        if (!interaction.isButton()) return;

        const vcButtonIds = [
            "vc_lock",
            "vc_unlock",
            "vc_mic_mute",
            "vc_mic_unmute",
            "vc_user_limit",
            "vc_transfer"
        ];

        if (vcButtonIds.includes(interaction.customId)) {
            const { vcData, vc } = getPersonalVc(interaction);

            if (!vc) {
                return replyNotPersonalVc(interaction);
            }

            if (!isVcOwner(interaction, vc)) {
                return replyNotOwner(interaction);
            }

            if (interaction.customId === "vc_user_limit") {
                return interaction.showModal(createLimitModal());
            }

            if (interaction.customId === "vc_transfer") {
                return interaction.showModal(createTransferModal());
            }

            let response = "✅ Ses kanalı ayarı güncellendi.";

            if (interaction.customId === "vc_lock") {
                await interaction.channel.permissionOverwrites.edit(
                    interaction.guild.id,
                    { Connect: false },
                    { reason: "Kişisel oda sahibi odayı kilitledi." }
                );

                vc.locked = true;
                response = "🔒 Odan kilitlendi.";
            }

            if (interaction.customId === "vc_unlock") {
                await interaction.channel.permissionOverwrites.edit(
                    interaction.guild.id,
                    { Connect: true },
                    { reason: "Kişisel oda sahibi kilidi açtı." }
                );

                vc.locked = false;
                response = "🔓 Odan herkese açıldı.";
            }

            if (interaction.customId === "vc_mic_mute") {
                await interaction.channel.permissionOverwrites.edit(
                    interaction.guild.id,
                    { Speak: false },
                    { reason: "Kişisel oda sahibi mikrofonları kapattı." }
                );

                await interaction.channel.permissionOverwrites.edit(
                    vc.owner,
                    { Speak: true },
                    { reason: "Oda sahibi konuşabilmeye devam eder." }
                );

                vc.micMuted = true;
                response = "🎙️ Oda mikrofonları kapatıldı.";
            }

            if (interaction.customId === "vc_mic_unmute") {
                await interaction.channel.permissionOverwrites.edit(
                    interaction.guild.id,
                    { Speak: true },
                    { reason: "Kişisel oda sahibi mikrofonları açtı." }
                );

                vc.micMuted = false;
                response = "🔊 Oda mikrofonları açıldı.";
            }

            writeJson(vcPath, vcData);

            return interaction.reply({
                content: response,
                ephemeral: true
            });
        }

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

            const tickets = readJson(ticketsPath, {});
            const alreadyOpen = Object.entries(tickets).find(
                ([channelId, ticket]) =>
                    ticket.owner === user.id &&
                    guild.channels.cache.has(channelId)
            );

            if (alreadyOpen) {
                return interaction.reply({
                    content: `❌ Zaten açık bir ticketin var: <#${alreadyOpen[0]}>`,
                    ephemeral: true
                });
            }

            const safeUsername = user.username
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-");

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

            tickets[ticketChannel.id] = {
                owner: user.id,
                claimedBy: null,
                addedUsers: [],
                createdAt: Date.now()
            };

            writeJson(ticketsPath, tickets);

            const ticketEmbed = new EmbedBuilder()
                .setColor("#2b1d0e")
                .setTitle("🎫 Ticket Oluşturuldu")
                .setDescription(
                    `${user}, hoş geldin.\n\nSorununu detaylı bir şekilde açıklarsan yetkililer en kısa sürede yardımcı olacaktır.`
                )
                .setFooter({
                    text: "A R C A N A Ticket Sistemi"
                });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("claim_ticket")
                    .setLabel("Devral")
                    .setEmoji("📌")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("close_ticket")
                    .setLabel("Ticketi Kapat")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger)
            );

            await ticketChannel.send({
                content: `📩 ${user} ticket oluşturdu.\n<@&${STAFF_ROLE_ID}>`,
                embeds: [ticketEmbed],
                components: [row]
            });

            return interaction.reply({
                content: `✅ Ticketin oluşturuldu: ${ticketChannel}`,
                ephemeral: true
            });
        }

        if (interaction.customId === "claim_ticket") {
            const tickets = readJson(ticketsPath, {});
            const ticket = tickets[interaction.channel.id];

            if (!ticket) {
                return interaction.reply({
                    content: "❌ Bu kanal bir ticket kanalı değil.",
                    ephemeral: true
                });
            }

            if (!interaction.member.roles.cache.has(STAFF_ROLE_ID)) {
                return interaction.reply({
                    content: "❌ Bu ticketi devralmak için yetkin yok.",
                    ephemeral: true
                });
            }

            if (ticket.claimedBy) {
                return interaction.reply({
                    content: `❌ Bu ticket zaten <@${ticket.claimedBy}> tarafından devralınmış.`,
                    ephemeral: true
                });
            }

            ticket.claimedBy = interaction.user.id;
            writeJson(ticketsPath, tickets);

            await interaction.channel.setName(
                `ticket-${interaction.user.username}`
            ).catch(() => {});

            const embed = new EmbedBuilder()
                .setColor("#2b1d0e")
                .setDescription(
                    `☾ Ticket ${interaction.user} tarafından devralındı.`
                );

            return interaction.reply({
                embeds: [embed]
            });
        }

        if (interaction.customId === "close_ticket") {
            const tickets = readJson(ticketsPath, {});
            const ticket = tickets[interaction.channel.id];

            if (!ticket) {
                return interaction.reply({
                    content: "❌ Bu kanal bir ticket kanalı değil.",
                    ephemeral: true
                });
            }

            await interaction.reply(
                "🔒 Transcript hazırlanıyor, ticket kapatılıyor..."
            );

            const transcript =
                await discordTranscripts.createTranscript(
                    interaction.channel,
                    {
                        limit: -1,
                        returnType: "attachment",
                        filename: `${interaction.channel.name}-transcript.html`,
                        saveImages: true,
                        poweredBy: false
                    }
                );

            const logChannel =
                interaction.guild.channels.cache.get(
                    TICKET_LOG_CHANNEL_ID
                );

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
                            name: "Açan",
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

            delete tickets[interaction.channel.id];
            writeJson(ticketsPath, tickets);

            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 3000);
        }
    }
};
