const { Router } = require("express");
const bodyParser = require("body-parser");
const Bots = require("@models/bots");

const authApi = require("@utils/authApi");

const route = Router();
route.use(bodyParser.json({limit: '50mb'}));

route.post('/:id', authApi, async (req, res) => {
    let count = req.body.count || req.body.server_count;

    if (!count) return res.json({ success: "false", error: "Contagem não encontrada no corpo." });
    count = parseInt(count);
    if (!count) return res.json({ success: "false", error: "Contagem não inteira." });

    let bot = await Bots.findOne({ botid: req.params.id }, { _id: false })
    if (bot.servers.length > 0 && bot.servers[bot.servers.length-1] &&  Date.now() - bot.servers[bot.servers.length-1].time < ratelimit * 1000) return res.json({ success: "false", error: "Você está sendo limitado pela taxa." });
    
    bot = await Bots.findOneAndUpdate({ botid: req.params.id }, {"$push":{"servers":{"$each": [{count}]}}}, { runValidators: true })
    res.json({ success: true });
});

module.exports = route;
