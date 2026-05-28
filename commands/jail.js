const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const JAIL_ROLE_ID = "1508905746501337109";
const LOG_CHANNEL_ID = "1508905668978147328";

const jailedPath =
    path.join(__dirname, "..", "data", "jailedUsers.json");

module.exports = {
    name: "jail",

    async execute(message, args) {

        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply("❌ Bu komutu kullanamazsın.");
        }

        const member = message.mentions.members.first();

        if (!member) {
            return message.reply("❌ Kullanım: `a.jail @üye sebep`");
        }

        const jailRole = message.guild.roles.cache.get(JAIL_ROLE_ID);

        if (!jailRole) {
            return message.reply("❌ Jail rolü bulunamadı. Role ID yanlış.");
        }

        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return message.reply("❌ Botta `Manage Roles` yetkisi yok.");
        }

        if (jailRole.position >= message.guild.members.me.roles.highest.position) {
            return message.reply("❌ Jail rolü bot rolünden yukarıda veya aynı seviyede.");
        }

        if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            return message.reply("❌ Bu kullanıcının rolleri bot rolünden yukarıda veya aynı seviyede.");
        }

        const dataPath =
            path.join(__dirname, "..", "data");

        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath);
        }

        if (!fs.existsSync(jailedPath)) {
            fs.writeFileSync(
                jailedPath,
                JSON.stringify({}, null, 4)
            );
        }

        const jailedData = JSON.parse(
            fs.readFileSync(jailedPath, "utf8")
        );

        const oldRoles = member.roles.cache
            .filter(role =>
                role.id !== message.guild.id &&
                role.id !== JAIL_ROLE_ID &&
                role.managed === false &&
                role.position < message.guild.members.me.roles.highest.position
            )
            .map(role => role.id);

        jailedData[member.id] = {
            roles: oldRoles,
            jailedBy: message.author.id,
            jailedAt: Date.now(),
            reason: args.slice(1).join(" ") || "Sebep belirtilmedi."
        };

        fs.writeFileSync(
            jailedPath,
            JSON.stringify(jailedData, null, 4)
        );

        await member.roles.set([JAIL_ROLE_ID]);

        await message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("✦ A R C A N A Jail Sistemi ✦")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: "👤 Kullanıcı",
                    value: `${member.user.tag}`,
                    inline: true
                },
                {
                    name: "🛡 Yetkili",
                    value: `${message.author.tag}`,
                    inline: true
                },
                {
                    name: "📄 Sebep",
                    value: jailedData[member.id].reason,
                    inline: false
                },
                {
                    name: "🎭 Alınan Roller",
                    value: oldRoles.length > 0
                        ? `${oldRoles.length} rol kaydedildi.`
                        : "Kaydedilecek rol yok.",
                    inline: false
                }
            )
            .setFooter({ text: "A R C A N A Moderasyon Sistemi" })
            .setTimestamp();

        const logChannel =
            message.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }
    }
};