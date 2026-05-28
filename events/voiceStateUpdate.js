const {
    Events,
    ChannelType,
    PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const CREATE_VC_ID = "1509602693336006777";

const vcPath =
    path.join(__dirname, "../data/tempVcs.json");

module.exports = {
    name: Events.VoiceStateUpdate,

    async execute(oldState, newState, client) {

        if (!fs.existsSync(path.join(__dirname, "../data"))) {
            fs.mkdirSync(path.join(__dirname, "../data"));
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

        // user joined create-vc
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
                                PermissionFlagsBits.MoveMembers
                            ]
                        }
                    ]
                });

            vcData[personalVc.id] = {
                owner: member.id,
                createdAt: Date.now()
            };

            fs.writeFileSync(
                vcPath,
                JSON.stringify(vcData, null, 4)
            );

            await member.voice.setChannel(personalVc)
                .catch(() => {});
        }

        // auto delete empty personal vc
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