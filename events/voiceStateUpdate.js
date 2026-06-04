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

const dataPath = path.join(__dirname, "../data");
const vcPath = path.join(dataPath, "tempVcs.json");
const configPath = path.join(dataPath, "vcConfig.json");
const fallbackCreateVcId = "1509602693336006777";

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

function getCreateChannelId() {
    const config = readJson(configPath, {});

    return (
        config.createChannelId ||
        process.env.JOIN_TO_CREATE_VC_ID ||
        fallbackCreateVcId
    );
}

module.exports = {
    name: Events.VoiceStateUpdate,

    async execute(oldState, newState, client) {
        const createVcId = getCreateChannelId();
        const vcData = readJson(vcPath, {});

        if (
            newState.channelId === createVcId &&
            oldState.channelId !== createVcId
        ) {
            const member = newState.member;
            const guild = newState.guild;
            const triggerChannel = newState.channel;

            const personalVc = await guild.channels.create({
                name: `🎧 ${member.displayName}`,
                type: ChannelType.GuildVoice,
                parent: triggerChannel.parentId,
                userLimit: triggerChannel.userLimit || 0,
                bitrate: triggerChannel.bitrate,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.Connect
                        ]
                    },
                    {
                        id: member.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.Connect,
                            PermissionFlagsBits.Speak,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.MoveMembers
                        ]
                    },
                    {
                        id: client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.Connect,
                            PermissionFlagsBits.Speak,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.MoveMembers,
                            PermissionFlagsBits.SendMessages
                        ]
                    }
                ]
            });

            vcData[personalVc.id] = {
                owner: member.id,
                createdAt: Date.now(),
                locked: false,
                micMuted: false,
                userLimit: personalVc.userLimit
            };

            writeJson(vcPath, vcData);

            await member.voice.setChannel(personalVc).catch(() => {});

            const panelEmbed = new EmbedBuilder()
                .setColor("#2b1d0e")
                .setTitle("🎛 Kişisel Oda Paneli")
                .setDescription(
                    "Bu ses kanalı sana ait.\n\nAşağıdaki butonlarla odanı yönetebilirsin."
                )
                .setFooter({
                    text: "A R C A N A Kişisel Ses Sistemi"
                });

            const mainPanelRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("vc_lock")
                    .setLabel("Kilitle")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("vc_unlock")
                    .setLabel("Aç")
                    .setEmoji("🔓")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("vc_mic_mute")
                    .setLabel("Mik Kapat")
                    .setEmoji("🎙️")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("vc_mic_unmute")
                    .setLabel("Mik Aç")
                    .setEmoji("🔊")
                    .setStyle(ButtonStyle.Secondary)
            );

            const settingsPanelRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("vc_user_limit")
                    .setLabel("Limit")
                    .setEmoji("👥")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("vc_transfer")
                    .setLabel("Sahiplik Ver")
                    .setEmoji("👑")
                    .setStyle(ButtonStyle.Secondary)
            );

            await personalVc.send({
                embeds: [panelEmbed],
                components: [mainPanelRow, settingsPanelRow]
            }).catch(() => {});
        }

        if (oldState.channelId && vcData[oldState.channelId]) {
            const oldChannel =
                oldState.guild.channels.cache.get(oldState.channelId);

            if (oldChannel && oldChannel.members.size === 0) {
                delete vcData[oldState.channelId];
                writeJson(vcPath, vcData);

                await oldChannel.delete("Kişisel ses odası boş kaldı.")
                    .catch(() => {});
            }
        }
    }
};
