const Discord = require('discord.js');

const Mod = require('../../models/mod');
const {Pagination} = require('../../util/pagination');

module.exports = {
    name: "checkwarnings",
    aliases: ['checkwarn', 'chw', 'warncheck', 'checkwarning'],
    meta: {
        category: 'Moderation',
        description: "Check a user's warnings in your server.",
        syntax: '`checkwarnings [@user|userID]`',
        extra: null,
        guildOnly: true
    },
    help: new Discord.MessageEmbed()
        .setTitle("Help -> Warn Clearing")
        .setDescription("Checks the warnings of a user")
        .addField("Syntax", "`checkwarnings [@user|userID]`")
        .addField("Notice", "You must be a server moderator in order to use this command."),
    async execute(message, msg, args, cmd, prefix, mention, client) {
        if (!args.length) {return message.channel.send(`Syntax: \`${prefix}checkwarnings [@user|userID]\``);}
        if (!message.member.permissions.has("MANAGE_MESSAGES") && !message.member.permissions.has("MANAGE_GUILD")) {return message.reply("You must be a server moderator (manage messages or manage server permissions) to use this command.");}
        
        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) {return message.channel.send("You didn't mention a valid user or provide an ID for me to check the warnings of!");}
        let mh = await Mod.findOne({gid: message.guild.id});
        if (!mh || !Object.keys(mh.warnings).length) {return message.reply("There are no warnings available in this server.");}

        if (!mh.warnings[user.id] || !mh.warnings[user.id].length) {return message.reply(`${user.id === message.author.id ? 'You have' : 'That user has'} never been warned in this server.`);}
        let ws = [];
        let cwc = 0;
        let warning; for (warning of mh.warnings[user.id]) {
            let tcase = mh.cases[warning - 1];
            if (tcase.status !== "Cleared") {
                ws.push(`Case \`#${warning}\` - Issued by <@${tcase.moderators[0]}>\n${tcase.reason}\n\n`);
            } else {cwc++;}
        }
        if (cwc > 0) {ws[ws.length - 1] += '\n*Plus ' + cwc + ' other warnings that have been cleared.*';}
        if (cwc === mh.warnings[user.id].length) {return message.reply("That user has no uncleared warnings.");}
        return new Pagination(message.channel, [...client.utils.split(ws, 5)].map(x => new Discord.MessageEmbed()
            .setTitle("User Warnings")
            .setThumbnail(client.users.cache.get(user.id).displayAvatarURL({size: 1024}))
            .setDescription(`For ${user.displayName}`)
            .addField("Warnings", x.join(``))
            .setColor("6049e3")
            .setFooter({text: "Luno", iconURL: client.user.avatarURL()})
            .setTimestamp()
        ), message, client).start({endTime: 60000});
    }
};