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

const CREATE_VC_ID = "1509602693336006777";

const vcPath =
    path.join(__dirname, "../data/tempVcs.json");

module.exports = {
    name: Events.VoiceStateUpdate,

    async execute(oldState, newState, client) {

        const dataPath =
            path.join(__dirname, "../data");

        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath);
        }

        if (!fs.existsSync(vcPath)) {
            fs.writeFileSync(
                vcPath,
                JSON.stringify({}, null, 4)
            );
        }

        const vcData = JSON.parse(
            fs.readFileSync(vcPath, "utf8")
        );

        if (
            newState.channelId === CREATE_VC_ID &&
            oldState.channelId !== CREATE_VC_ID
        ) {
            const member = newState.member;
            const guild = newState.guild;

            const categoryId =
                newState.channel.parentId;

            const personalVc =
                await guild.channels.create({
                    name: `🎧 ${member.user.username}`,
                    type: ChannelType.GuildVoice,
                    parent: categoryId,
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
                                PermissionFlagsBits.ManageChannels,
                                PermissionFlagsBits.MoveMembers
                            ]
                        },
                        {
                            id: client.user.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.Connect,
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
                hidden: false
            };

            fs.writeFileSync(
                vcPath,
                JSON.stringify(vcData, null, 4)
            );

            await member.voice.setChannel(personalVc)
                .catch(() => {});

            const panelEmbed = new EmbedBuilder()
                .setColor("#2b1d0e")
                .setTitle("🎛 Kontrol Paneli")
                .setDescription(
                    "Bu ses kanalı sana ait.\n\nAşağıdaki butonlarla kanalını yönetebilirsin."
                )
                .setFooter({
                    text: "A R C A N A Kişisel VC Sistemi"
                });

            const panelRow = new ActionRowBuilder().addComponents(
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
                    .setCustomId("vc_hide")
                    .setLabel("Gizle")
                    .setEmoji("👁️")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("vc_show")
                    .setLabel("Göster")
                    .setEmoji("🌙")
                    .setStyle(ButtonStyle.Secondary)
            );

            await personalVc.send({
                embeds: [panelEmbed],
                components: [panelRow]
            }).catch(() => {});
        }

        if (
            oldState.channelId &&
            vcData[oldState.channelId]
        ) {
            const oldChannel =
                oldState.guild.channels.cache.get(oldState.channelId);

            if (
                oldChannel &&
                oldChannel.members.size === 0
            ) {
                delete vcData[oldState.channelId];

                fs.writeFileSync(
                    vcPath,
                    JSON.stringify(vcData, null, 4)
                );

                await oldChannel.delete()
                    .catch(() => {});
            }
        }
    }
};