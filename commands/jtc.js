const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data");
const configPath = path.join(dataPath, "vcConfig.json");

function ensureConfig() {
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
    }

    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({}, null, 4));
    }
}

function saveCreateChannel(channelId) {
    ensureConfig();

    let config = {};

    try {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch {
        config = {};
    }

    config.createChannelId = channelId;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}

module.exports = {
    name: "jtc",
    description: "Kişisel ses odası sistemini kurar.",

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply(
                "❌ Bu komutu kullanmak için Kanal Yönet yetkisine sahip olmalısın."
            );
        }

        const existingChannelId = args[0]?.replace(/[<#>]/g, "");

        if (existingChannelId) {
            const existingChannel =
                message.guild.channels.cache.get(existingChannelId);

            if (
                !existingChannel ||
                existingChannel.type !== ChannelType.GuildVoice
            ) {
                return message.reply(
                    "❌ Verdiğin ID bir ses kanalına ait değil."
                );
            }

            saveCreateChannel(existingChannel.id);

            return message.reply(
                `✅ Join to create kanalı ayarlandı: ${existingChannel}`
            );
        }

        const createChannel = await message.guild.channels.create({
            name: "➕ Oda Oluştur",
            type: ChannelType.GuildVoice,
            parent: message.channel.parentId,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect
                    ]
                },
                {
                    id: message.client.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.MoveMembers
                    ]
                }
            ]
        });

        saveCreateChannel(createChannel.id);

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("🎧 Kişisel Ses Sistemi Kuruldu")
            .setDescription(
                `${createChannel} kanalına giren herkes için otomatik kişisel ses odası açılacak.`
            )
            .setFooter({
                text: "A R C A N A Join To Create"
            });

        return message.reply({
            embeds: [embed]
        });
    }
};
