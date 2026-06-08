const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const warningsPath = path.join(__dirname, "../data/warnings.json");

const WARN_ROLES = {
    warn1: "1508902057346728046",
    warn2: "1508902094432768071"
};

module.exports = {
    name: "warn-remove",

    async execute(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply("❌ Bu komutu kullanamazsın.");
        }

        const member = message.mentions.members.first();

        if (!member) {
            return message.reply("❌ Kullanım: `a.warn-remove @üye`");
        }

        let warnings = {};

        if (fs.existsSync(warningsPath)) {
            warnings = JSON.parse(fs.readFileSync(warningsPath, "utf8"));
        }

        if (!warnings[member.id]) {
            return message.reply("❌ Bu kullanıcının warn kaydı yok.");
        }

        warnings[member.id].count -= 1;
        warnings[member.id].reasons.pop();

        if (warnings[member.id].count <= 0) {
            delete warnings[member.id];
            await member.roles.remove([WARN_ROLES.warn1, WARN_ROLES.warn2]).catch(() => {});
        } else if (warnings[member.id].count === 1) {
            await member.roles.remove(WARN_ROLES.warn2).catch(() => {});
            await member.roles.add(WARN_ROLES.warn1).catch(() => {});
        }

        fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 4));

        const embed = new EmbedBuilder()
            .setColor("#360258")
            .setDescription(`${member} kullanıcısından 1 warn kaldırıldı.`)
            .setFooter({
                text: "A R C A N A Waen Sistemi"
            })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};