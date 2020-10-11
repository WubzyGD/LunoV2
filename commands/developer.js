const Discord = require('discord.js');
const mongoose = require('mongoose');
const UserData = require('../models/user');

module.exports = {
    name: "developer",
    aliases: ['dev'],
    help: new Discord.MessageEmbed()
        .setTitle("Help -> Developer")
        .setDescription("Add or remove users as Natsuki developers.")
        .addField("Syntax", "`developer <add|remove> <@user|userID>`")
        .addField("Notice", "You must already be a developer of Natsuki in order to use this command."),
    async execute(message, msg, args, cmd, prefix, mention, client) {
        if (!message.guild) {return message.reply("This is a guild-only command!");}
        if (!args.length) {return message.channel.send(`Syntax: \`${prefix}developer <add|remove> <@user|userID>\``);}
        if (!['a', 'add', 'r', 'remove'].includes(args[0])) {return message.reply("You must specify whether to `add` or `remove` someone as a developer.");}
        let person = mention ? mention : args[1] ? client.users.cache.has(args[1]) ? client.users.cache.get(args[1]) : null : null;
        if (!person) {return message.reply("You must mention someone to add as a developer, or use their ID.");}
        let tu = await UserData.findOne({uid: person.id}) ? await UserData.findOne({uid: person.id}) : new UserData({uid: person.id});
        let atu = await UserData.findOne({uid: message.author.id});
        if (!atu && !atu.developer && !client.developers.includes(message.author.id)) {return message.reply('You must be a developer in order to add or remove someone else as a developer.');}
    }
};