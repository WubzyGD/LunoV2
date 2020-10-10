const Discord = require('discord.js');
const GuildSettings = require('../models/guild');

module.exports = {
    name: "staffrole",
    aliases: ['sr', 'setstaffrole'],
    help: "Set your server's staff role, which allows users with that role to modify my settings in this server. You must be an admin in the server to change this setting.",
    async execute(message, msg, args, cmd, prefix, mention, client) {
        if (!message.guild) {return message.reply("This is a guild-only command!");}
        if (!args.length) {return message.channel.send(`Syntax: \`${prefix}staffrole <@role|roleID|clear|view>\``);}
        if (!message.member.permissions.has("ADMINISTRATOR")) {return message.reply("You must be an admin in this server in order to change this setting!");}

        let tguild = await GuildSettings.findOne({gid: message.guild.id})
            ? await GuildSettings.findOne({gid: message.guild.id})
            : new GuildSettings({gid: message.guild.id});

        if (['view', 'v'].includes(args[0].trim().toLocaleLowerCase())) {return message.reply(
            tguild.staffrole.length
                ? message.guild.roles.cache.has(tguild.staffrole)
                    ? `\`People with the ${message.guild.roles.cache.get(tguild.staffrole).name}\` role can edit my setting here.`
                    : `I have a role stored for this server, but it doesn't seem to exist anymore, so only admins can edit my settings right now.`
                : 'Only admins may edit settings in this server.'
        );}

        let role = !['c', 'clear', 'n', 'none'].includes(args[0].trim().toLowerCase()) ? message.mentions.roles.size ? message.mentions.roles.first() : message.guild.roles.cache.has(args[0]) ? message.guild.roles.cache.get(args[0]) : null : 'c';

        if (!role) {return message.reply("I couldn't find that role!");}
        if (role === "c") {
            tguild.staffrole = '';
            tguild.save();
            return message.reply("Got it, only admins can edit my settings in this server.");
        } else {
            tguild.staffrole = role.id;
            tguild.save();
            let upm = message.reply("Sure thing!");
            await require('../util/wait')(1750);
            return upm.edit(new Discord.MessageEmbed()
                .setAuthor('Staff role updated!', message.author.avatarURL())
                .setDescription(`<@${tguild.staffrole}> can now edit my settings in this server.`)
                .addField('Auditing Admin', message.member.displayName, true)
                .addField('Role-Holders', `${message.guild.members.cache.filter(m => m.roles.cache.has(tguild.staffrole) && !client.users.cache.get(m.id).bot)}+ members have this role`)
                .setColor('c375f0')
                .setFooter('Natsuki', client.user.avatarURL())
                .setTimestamp()
            );
        }
    }
};