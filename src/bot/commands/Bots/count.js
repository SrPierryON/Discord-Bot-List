const { Command } = require('klasa');
const Bots = require("@models/bots");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'count',
            runIn: ['text'],
            aliases: ["list", "botcount", "bot-count"],
            permLevel: 0,
            botPerms: ["SEND_MESSAGES"],
            requiredSettings: [],
            description: "Verifique quantos bots existem na lista."
        });
    }

    async run(message) {
        let bots = await Bots.find({}, { _id: false })
        bots = bots.filter(bot => bot.state !== "deleted");
        if (bots.length === 1) message.channel.send(`Há \`1\` bot na lista.`)
        else message.channel.send(`Existem \`${bots.length}\` bots na lista.`)
    }
};
