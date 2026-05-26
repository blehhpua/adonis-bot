const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const LOG_CHANNEL_ID = "1508902311819345920";

const WARN_ROLES = {
    warn1: "1508902057346728046",
    warn2: "1508902094432768071"
};

const warningsPath = path.join(__dirname, "../data/warnings.json");

module.exports = {
    name: "warn",

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply("❌ Bu komutu kullanamazsın.");
        }

        const member = message.mentions.members.first();

        if (!member) {
            return message.reply("❌ Kullanım: `a.warn @üye sebep`");
        }

        const reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";

        let warnings = {};

        if (fs.existsSync(warningsPath)) {
            warnings = JSON.parse(fs.readFileSync(warningsPath, "utf8"));
        }

        const userId = member.id;

        if (!warnings[userId]) {
            warnings[userId] = {
                count: 0,
                reasons: []
            };
        }

        warnings[userId].count += 1;
        warnings[userId].reasons.push({
            reason,
            moderator: message.author.tag,
            date: new Date().toLocaleString("tr-TR")
        });

        const count = warnings[userId].count;

        fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 4));

        await message.delete().catch(() => {});

        if (count === 1) {
            await member.roles.add(WARN_ROLES.warn1).catch(() => {});
        }

        if (count === 2) {
            await member.roles.remove(WARN_ROLES.warn1).catch(() => {});
            await member.roles.add(WARN_ROLES.warn2).catch(() => {});
        }

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("✦ Adonis Warn Sistemi ✦")
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
                    name: "⚠️ Warn Sayısı",
                    value: `${count}/3`,
                    inline: true
                },
                {
                    name: "📄 Sebep",
                    value: reason,
                    inline: false
                }
            )
            .setFooter({
                text: "Adonis Moderasyon Sistemi"
            })
            .setTimestamp();

        const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }

        if (count >= 3) {
            await member.ban({
                reason: `3 warn limiti doldu. Son sebep: ${reason}`
            });

            delete warnings[userId];
            fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 4));

            return;
        }

        member.send({ embeds: [embed] }).catch(() => {});
    }
};