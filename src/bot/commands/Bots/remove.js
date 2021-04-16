const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");

const { server: {mod_log_id, role_ids} } = require("@root/config.json");

const reasons = {
    "1": `Seu bot estava offline quando tentamos verificá-lo.`,
    "2": `Seu bot é um clone de outro bot`,
    "3": `Seu bot responde a outros bots`,
    "4": `Seu bot não tem comandos de trabalho / suficientes. (Mínimo: 7)`,
    "5": `Seu bot tem comandos NSFW que funcionam em canais não marcados com NSFW`,
    "6": `Seu bot não tem um comando de ajuda ou lista de comandos funcionando`
}
var modLog;

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'remove',
            runIn: ['text'],
            aliases: ["delete"],
            permissionLevel: 8,
            botPerms: ["SEND_MESSAGES"],
            description: "Remova um bot da lista de bots",
            usage: '[Membro:user]'
        });
    }

    async run(message, [Member]) {
        if (!Member || !Member.bot) return message.channel.send(`Você não fez ping em um bot para remover.`)
        let e = new MessageEmbed()
            .setTitle('Razões')
            .setColor(0x6b83aa)
            .addField(`Removendo bot`, `${Member}`)
        let cont = ``;
        for (let k in reasons) {
            let r = reasons[k];
            cont += ` - **${k}**: ${r}\n`
        }
        cont += `\nEnter a valid reason number or your own reason.`
        e.setDescription(cont)
        message.channel.send(e);
        let filter = m => m.author.id === message.author.id;

        let collected = await message.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
        let reason = collected.first().content
        let r = collected.first().content;
        if (parseInt(reason)) {
            r = reasons[reason]
            if (!r) return message.channel.send("Número do motivo inválido.")
        }

        let bot = await Bots.findOne({ botid: Member.id }, { _id: false });
        await Bots.updateOne({ botid: Member.id }, { $set: { state: "deleted", owners: {primary: bot.owners.primary, additional: []} } });
        const botUser = await this.client.users.fetch(Member.id);

        if (!bot) return message.channel.send(`Erro desconhecido. Bot não encontrado.`)
        let owners = [bot.owners.primary].concat(bot.owners.additional)
        e = new MessageEmbed()
            .setTitle('Bot removido')
            .addField(`Bot`, `<@${bot.botid}>`, true)
            .addField(`Owner`, owners.map(x => x ? `<@${x}>` : ""), true)
            .addField("Mod", message.author, true)
            .addField("Razão", r)
            .setThumbnail(botUser.displayAvatarURL({format: "png", size: 256}))
            .setTimestamp()
            .setColor(0xffaa00)
        modLog.send(e)
        modLog.send(owners.map(x => x ? `<@${x}>` : "")).then(m => { m.delete() });
        message.channel.send(`Removido <@${bot.botid}> Verificar <#${mod_log_id}>.`)
        
        owners = await message.guild.members.fetch({user: owners})
        owners.forEach(o => {
            o.send(`Seu bot ${bot.username} foi removido:\n>>> ${r}`)
        })
        if (!message.client.users.cache.find(u => u.id === bot.botid).bot) return;
        try {
            message.guild.members.fetch(message.client.users.cache.find(u => u.id === bot.botid))
                .then(bot => {
                    bot.kick().then(() => {})
                        .catch(e => { console.log(e) })
                }).catch(e => { console.log(e) });
        } catch (e) { console.log(e) }
    }

    async init() {
        modLog = await this.client.channels.fetch(mod_log_id);
    }
};
