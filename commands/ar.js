const Discord = require('discord.js');

const AR = require('../models/ar');
const GuildData = require('../models/guild');

const ask = require('../util/ask');

module.exports = {
    name: "ar",
    aliases: ['autoresponse', 'autoresponses'],
    meta: {
        category: "",
        perms: "",
        staff: false,
        vip: "",
        serverPerms: [],
        writtenBy: "",
        serverOnly: true
    },
    tags: [],
    help: new Discord.MessageEmbed()
        .setTitle("Help -> Auto Responses")
        .setDescription("Create and edit automatic responses, which lets the bot say stuff when you say something in your server!")
        .addField("Syntax", "`ar <add|edit|delete|settings>`")
        .addField("Notice", "This command is server-only, and requires you to be an administrator or have the staff role."),
    async execute(message, msg, args, cmd, prefix, mention, client) {
        if (!message.guild) {return message.channel.send("You must be in a server in order to use this command.");}
        if (!args.length) {return message.channel.send(`Syntax: \`${prefix}<add|edit|delete|settings|list>\``);}
        const tg = await GuildData.findOne({gid: message.guild.id});
        if (['a', 'add', 'e', 'edit', 'delete', 'd'].includes(args[0].toLowerCase()) && (!tg || !tg.staffrole || !tg.staffrole.length || (message.member.roles.cache.has(tg.staffrole) && message.member.permissions.has("ADMINISTRATOR")))) {return message.channel.send("You must have the staff role or be an administrator in this server in order to edit AR settings.");}

        if (['a', 'add'].includes(args[0].toLowerCase())) {
            let trigger = await ask(message, "What would you like the trigger to be? This is the message that will make your AR work.", 120000); if (!trigger) {return null;}
            if (`${trigger}`.length > 150) {return message.channel.send("Your trigger needs to be less than 150 characters, please!");}
            let response = await ask(message, "What would you like my response to be?", 120000); if (!response) {return null;}
            if (`${response}`.length > 300) {return message.channel.send("Your response needs to be less than 300 characters, please!");}

            let tar = await AR.findOne({gid: message.guild.id}) || new AR({gid: message.guild.id});
            let h = false; let ar; for (ar of tar.triggers) {if (ar.toLowerCase() === `${trigger}`.toLowerCase()) {h = true;}}
            if (!h) {tar.triggers.push(trigger);}
        }
    }
};