const Discord = require('discord.js');
const Saves = require('../../models/saves');
const UserData = require('../../models/user');
const makeId = require('../../util/makeid');

module.exports = {
    name: "choke",
    help: "Sabatoge someones O2 levels with `{{p}}choke @person`!",
    aliases: ['choke' , 'strangle'],
    meta: {
        category: 'Social',
        description: "Silence someone forcefully!",
        syntax: '`Choke <@user>`',
        extra: null
    },
    async execute(message, msg, args, cmd, prefix, mention, client) {
        let savess = await Saves.findOne({name: 'choke'}) ? await Saves.findOne({name: 'choke'}) : new Saves({name: 'choke'});
        let saves = savess.saves;
        if (!args.length) {
            let name = message.guild ? message.member.displayName : message.author.username;
            return message.channel.send(message.guild ? {embeds: [new Discord.MessageEmbed()
                    .setTitle(`${name} needs to shut up now!`)
                    .setThumbnail(message.author.avatarURL({size: 2048}))
                    .setDescription(`Why don't you help them with \`${prefix}choke @${name}\`!`)
                    .setColor('ff76de')
                    .setFooter({text: "Luno", iconURL: client.user.avatarURL()})
                    .setTimestamp()]}
                : "I'll do the command if you do it harder~."
            );}
        if (mention && args[0].match(/^<@!?\d+>$/)) {
            if (!message.guild) {return message.reply("I'll do the command if you do it harder~.");}
            if (!message.guild.members.cache.has(mention.id)) {return message.reply("Can't choke someone who doesn't exist!");}
            if (message.author.id === mention.id) {return message.reply("I don't care how horny you are, NO CHOKING YOURSELF.");}
            let name = message.guild ? message.member.displayName : message.author.username;
            let uname = message.guild.members.cache.get(mention.id).displayName;
            return message.channel.send({embeds: [new Discord.MessageEmbed()
                .setAuthor({name: `${message.guild ? message.member.displayName : message.author.username} choked out ${message.guild.members.cache.get(mention.id).displayName}..||and they liked it..||`, iconURL: message.author.avatarURL()})
                .setImage(String(Array.from(saves.values())[Math.floor(Math.random() * saves.size)]))
                .setColor('ff76de')
            ]});
        }
        if (['s', 'save', 'n', 'new', 'a', 'add'].includes(args[0].toLowerCase())) {
            if (!args[1]) {return message.channel.send('oi there cunt, give me a link of an image to add!');}
            let tu = await UserData.findOne({uid: message.author.id});
            if ((!tu || !tu.developer) && !client.developers.includes(message.author.id) && !client.misc.savers.includes(message.author.id)) {return message.reply("You must be a Luno Developer in order to add new creampie GIFs.");}
            let e = true;
            let id;
            while (e === true) {id = makeId(6); if (!saves.has(id)) {e = false;}}
            args.shift();
            saves.set(id, args.join(" ").trim());
            savess.saves = saves;
            savess.save();
            return message.channel.send("More ways to choke people...hot.");
        }
    }
};