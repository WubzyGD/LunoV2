const Discord = require('discord.js');
const Saves = require('../../models/saves');
const UserData = require('../../models/user');
const makeId = require('../../util/makeid');

module.exports = {
    name: "boop",
    help: "Boop someones cheek with `{{p}}boop @person`!",
    aliases: ['boop' , 'choke'],
    meta: {
        category: 'Social',
        description: "Boop someone cutely!",
        syntax: '`Boop <@user>`',
        extra: null
    },
    async execute(message, msg, args, cmd, prefix, mention, client) {
        let savess = await Saves.findOne({name: 'boop'}) ? await Saves.findOne({name: 'boop'}) : new Saves({name: 'boop'});
        let saves = savess.saves;
        if (!args.length) {
            let name = message.guild ? message.member.displayName : message.author.username;
            return message.channel.send(message.guild ? {embeds: [new Discord.MessageEmbed()
                    .setTitle(`${name} needs to be booped!`)
                    .setThumbnail(message.author.avatarURL({size: 2048}))
                    .setDescription(`Give 'em a little boop with \`${prefix}boop @${name}\`!`)
                    .setColor('fec5e5')
                    .setFooter({text: "Luno", iconURL: client.user.avatarURL()})
                    .setTimestamp()]}
                : "Hey, no boops!."
            );}
        if (mention && args[0].match(/^<@!?\d+>$/)) {
            if (!message.guild) {return message.reply("Hey, no boops!");}
            if (!message.guild.members.cache.has(mention.id)) {return message.reply("Can't boop a ghost!");}
            if (message.author.id === mention.id) {return message.reply("You just touched your own cheek..kinda weird.");}
            let name = message.guild ? message.member.displayName : message.author.username;
            let uname = message.guild.members.cache.get(mention.id).displayName;
            return message.channel.send({embeds: [new Discord.MessageEmbed()
                .setAuthor({name: `${message.guild ? message.member.displayName : message.author.username} boops ${message.guild.members.cache.get(mention.id).displayName} cutely!`, iconURL: message.author.avatarURL()})
                .setImage(String(Array.from(saves.values())[Math.floor(Math.random() * saves.size)]))
                .setColor('fec5e5')
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
            return message.channel.send("More boobs- I mean boops!");
        }
    }
};