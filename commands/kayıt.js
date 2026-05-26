const {
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const ROLES = {
    kayitsiz: "1508889870297333820",
    uye: "1508889918439559312",
    kadin: "1508890008793255987",
    erkek: "1508889977029656608",
    yetkili: "1508889839246774282"
};

const LOG_CHANNEL_ID = "1508888206710538261";

module.exports = {
    name: "k",

    async execute(message, args) {
        if (!message.member.roles.cache.has(ROLES.yetkili)) {
            return message.reply("❌ Bu komutu kullanamazsın.");
        }

        const member = message.mentions.members.first();

        if (!member) {
            return message.reply("❌ Kullanım: `a.k @üye İsim Yaş kadın/erkek`");
        }

        const name = args[1];
        const age = args[2];
        const gender = args[3]?.toLowerCase();

        if (!name || !age || !gender) {
            return message.reply("❌ Kullanım: `a.k @üye İsim Yaş kadın/erkek`");
        }

        let genderRole;
        let genderText;

        if (["kadın", "kadin", "kız", "kiz"].includes(gender)) {
            genderRole = ROLES.kadin;
            genderText = "Kadın";
        } else if (gender === "erkek") {
            genderRole = ROLES.erkek;
            genderText = "Erkek";
        } else {
            return message.reply("❌ Cinsiyet `kadın` veya `erkek` olmalı.");
        }

        await member.roles.remove(ROLES.kayitsiz).catch(() => {});
        await member.roles.add([ROLES.uye, genderRole]).catch(() => {});
        await member.setNickname(`${name} | ${age}`).catch(() => {});

        await message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor("#2b1d0e")
            .setTitle("✦ Adonis Kayıt Sistemi ✦")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "👤 Kullanıcı", value: `${member.user.tag}`, inline: true },
                { name: "📝 İsim", value: name, inline: true },
                { name: "🎂 Yaş", value: age, inline: true },
                { name: "⚧ Cinsiyet", value: genderText, inline: true },
                { name: "🛡 Yetkili", value: `${message.author.tag}`, inline: true }
            )
            .setFooter({ text: "Adonis Kayıt Sistemi" })
            .setTimestamp();

        const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) logChannel.send({ embeds: [embed] });
    }
};