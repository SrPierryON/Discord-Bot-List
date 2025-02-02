const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");


module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["bot-info", "info"],
            usage: '[User:user]'
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Dê um ping em um **bot** para obter informações sobre.`);
        if (user.id === message.client.user.id) return message.channel.send(`-_- Não`);

        const bot = await Bots.findOne({ botid: user.id }, { _id: false })
        if (!bot) return message.channel.send(`Bot não encontrado.`);
        let servers;
        if (bot.servers[bot.servers.length - 1])
            servers = bot.servers[bot.servers.length - 1].count;
        else servers = null;
        const botUser = await this.client.users.fetch(user.id);
        if (bot.logo !== botUser.displayAvatarURL({format: "png", size: 256}))
            await Bots.updateOne({ botid: user.id }, {$set: {logo: botUser.displayAvatarURL({format: "png", size: 256})}});
        let e = new MessageEmbed()
            e.setColor(0x6b83aa)
            e.setAuthor(bot.username, botUser.displayAvatarURL({format: "png", size: 256}), bot.invite)
            e.setDescription(bot.description)
            e.addField(`Prefixo`, bot.prefix ? bot.prefix : "Unknown", true)
            e.addField(`Servidor de Suporte`, !bot.support ? "Not Added" : `[Click Here](${bot.support})`, true)
            e.addField(`Website`, !bot.website ? "Not Added" : `[Click Here](${bot.website})`, true)
            e.addField(`Github`, !bot.github ? "Not Added" : `[Click Here](${bot.github})`, true)
            e.addField(`Votos`, `${bot.likes || 0} Likes`, true)
            e.addField(`Contagem de servidores`, `${servers || 0} Servers`, true)
            e.addField(`Developer`, `<@${bot.owners.primary}>`, true)
            e.addField(`Estado`, bot.state, true)
        message.channel.send(e);
    }
};
