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
    name: "unjail",

    async execute(message, args) {

        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply("❌ Bu komutu kullanamazsın.");
        }

        const member = message.mentions.members.first();

        if (!member) {
            return message.reply("❌ Kullanım: `a.unjail @üye`");
        }

        if (!member.roles.cache.has(JAIL_ROLE_ID)) {
            return message.reply("❌ Bu kullanıcı jailde değil.");
        }

        if (!fs.existsSync(jailedPath)) {
            return message.reply("❌ Bu kullanıcının eski rol verisi bulunamadı.");
        }

        const jailedData = JSON.parse(
            fs.readFileSync(jailedPath, "utf8")
        );

        const userData = jailedData[member.id];

        if (!userData || !userData.roles) {
            return message.reply("❌ Bu kullanıcının eski rolleri kayıtlı değil.");
        }

        await member.roles.remove(JAIL_ROLE_ID).catch(() => {});

        const validRoles = userData.roles.filter(roleId => {
            const role = message.guild.roles.cache.get(roleId);

            return (
                role &&
                role.id !== JAIL_ROLE_ID &&
                role.id !== message.guild.id &&
                role.position < message.guild.members.me.roles.highest.position
            );
        });

        if (validRoles.length > 0) {
            await member.roles.add(validRoles).catch(() => {});
        }

        delete jailedData[member.id];

        fs.writeFileSync(
            jailedPath,
            JSON.stringify(jailedData, null, 4)
        );

        await message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("✦ A R C A N A Unjail Sistemi ✦")
            .setThumbnail(
                member.user.displayAvatarURL({
                    dynamic: true
                })
            )
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
                    name: "🎭 Geri Verilen Roller",
                    value: validRoles.length > 0
                        ? `${validRoles.length} rol geri verildi.`
                        : "Geri verilecek rol bulunamadı.",
                    inline: false
                }
            )
            .setFooter({
                text: "A R C A N A Moderasyon Sistemi"
            })
            .setTimestamp();

        const logChannel =
            message.guild.channels.cache.get(LOG_CHANNEL_ID);

        if (logChannel) {
            logChannel.send({
                embeds: [embed]
            });
        }
    }
};