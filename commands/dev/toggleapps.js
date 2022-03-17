const Discord = require('discord.js');

const UserData = require('../../models/user');
const MA = require("../../models/modapp");

module.exports = {
    name: "toggleapps",
    aliases: ['startapps','stopapps'],
    meta: {
        category: 'Developer',
        description: "Start or stop moderator applications",
        syntax: '`toggleapps`',
        extra: null
    },
    help: "Start or stop moderator applications",
    async execute(message, msg, args, cmd, prefix, mention, client) {
        let tu = await UserData.findOne({uid: message.author.id});
        if ((!tu || !tu.developer) && !client.developers.includes(message.author.id)) {return message.channel.send("You must be a Luno developer to use this command.");}
        let ma = await MA.findOne({gid: client.misc.cf});
        ma.enabled = !ma.enabled;
        ma.markModified('enabled');
        ma.save();
        client.guilds.cache.get(client.misc.cf).channels.cache.get("840130787298115584").send(`Moderation applications are now ${ma.enabled ? 'open' : 'closed'}.`);
        return message.channel.send("Settings updated.");
    }
};