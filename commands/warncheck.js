const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const warningsPath = path.join(__dirname, "../data/warnings.json");

module.exports = {
    name: "warncheck",

    async execute(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply("❌ Bu komutu kullanamazsın.");
        }

        const member = message.mentions.members.first();

        if (!member) {
            return message.reply("❌ Kullanım: `a.warncheck @üye`");
        }

        let warnings = {};

        if (fs.existsSync(warningsPath)) {
            warnings = JSON.parse(fs.readFileSync(warningsPath, "utf8"));
        }

        const data = warnings[member.id];

        if (!data) {
            return message.reply("✅ Bu kullanıcının warn kaydı yok.");
        }

        const reasons = data.reasons
            .map((w, i) => `**${i + 1}.** ${w.reason} — ${w.moderator} — ${w.date}`)
            .join("\n");

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("✦ Adonis Warn Kontrol ✦")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: "👤 Kullanıcı",
                    value: `${member.user.tag}`,
                    inline: true
                },
                {
                    name: "⚠️ Warn Sayısı",
                    value: `${data.count}/3`,
                    inline: true
                },
                {
                    name: "📄 Sebepler",
                    value: reasons || "Sebep yok."
                }
            )
            .setFooter({
                text: "Adonis Moderasyon Sistemi"
            })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};