const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const JAIL_ROLE_ID = "1508905746501337109";
const LOG_CHANNEL_ID = "1508905668978147328";

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

        const reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";

        await member.roles.add(jailRole);

        await message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("✦ Adonis Jail Sistemi ✦")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "👤 Kullanıcı", value: `${member.user.tag}`, inline: true },
                { name: "🛡 Yetkili", value: `${message.author.tag}`, inline: true },
                { name: "📄 Sebep", value: reason, inline: false }
            )
            .setFooter({ text: "Adonis Moderasyon Sistemi" })
            .setTimestamp();

        const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }
    }
};