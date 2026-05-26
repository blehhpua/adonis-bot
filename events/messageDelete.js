const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageDelete,

    async execute(message, client) {
        if (!message.guild) return;
        if (message.author?.bot) return;

        client.snipes = client.snipes || new Map();

        client.snipes.set(message.channel.id, {
            content: message.content || "Mesaj içeriği yok.",
            author: message.author,
            image: message.attachments.first()?.proxyURL || null,
            date: Date.now()
        });
    }
};