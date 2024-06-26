const Discord = require('discord.js');

const UserData = require('../../models/user');

const ask = require("../../util/ask");

module.exports = {
    name: "marry",
    meta: {
        category: 'Fun',
        description: "Marry someone to get some extra fun benefits!",
        syntax: '`marry <@user|status|decline>`',
        extra: null,
        guildOnly: true
    },
    help: new Discord.MessageEmbed()
        .setTitle("Help -> Marriage")
        .setDescription("Marry another Luno user. They'll have to accept your marriage request for you to be able to marry them, though.")
        .addField("Syntax", "`marry <@user|status|decline>`"),
    async execute(message, msg, args, cmd, prefix, mention, client) {
        if (!args.length) {return message.channel.send(`Syntax: \`${prefix}marry <@user|status|decline>\``);}
        if (['s', 'status', 'v', 'view'].includes(args[0].toLowerCase())) {
            const tu = await UserData.findOne({uid: message.author.id});
            if (!tu || !tu.marriedTo) {return message.channel.send("You aren't married to anyone :(");}
            else {return message.channel.send({embeds: [new Discord.MessageEmbed()
                .setTitle("Marriage Status")
                .setDescription(`<@${message.author.id}> is married to <@${tu.marriedTo}>!`)
                .setColor('6049e3')
                .setFooter({text: "Luno", iconURL: client.user.avatarURL()})
                .setTimestamp()
            ]});}
        } else if (['d', 'decline', 'r', 'reject'].includes(args[0].toLowerCase())) {
            let requests = client.misc.cache.marriageRequests.filter(u => u === message.author.id);
            if (!requests.size) {return message.channel.send("You don't have any people trying to marry you!");}
            let ra = Array.from(requests.keys());
            message.channel.send({embeds: [new Discord.MessageEmbed()
                .setTitle("Current Marriage Requests")
                .setDescription(ra.map((r, i) => `${i+1}. <@${r}>`).join("\n"))
                .addField("Decline", "To decline someone's request, please reply with the number that corresponds to the person you'd like to decline.")
                .setColor('6049e3')
                .setFooter({text: "Luno", iconURL: client.user.avatarURL()})
                .setTimestamp()
            ]});
            try {
                let res = await message.channel.awaitMessages({filter: (m) => m.author.id === message.author.id, max: 1, errors: ['time'], time: 60000});
                res = res.first().content;
                if (isNaN(Number(res))) {return message.channel.send("You must reply with a number!");}
                res = Number(res);
                if (res < 1 || res > ra.length + 1) {return message.channel.send("That number isn't in your list.");}
                let person = ra[res-1];
                let err = false;
                await message.guild.members.fetch(person).catch(() => err = true);
                if (err) {return message.channel.send("There was an error in trying to do that!");}
                let conf = await ask(message, `Are you sure you want to decline ${client.utils.ps(message.guild.members.cache.get(person).displayName)} marriage request?`, 60000);
                if (!conf) {return;}
                if (!['y', 'yes', 'ye', 'sure', 'mhm'].includes(conf.toLowerCase())) {return message.channel.send("Okay, nevermind then!");}
                client.misc.cache.marriageRequests.delete(person);
                return message.channel.send("Request declined.");
            } catch {return message.reply("That request timed out. Please try again.");}
        } else {
            if (!mention) {return message.channel.send("You have to mention the person you'd like to marry!");}
            if (!message.guild.members.cache.has(mention.id)) {return message.channel.send("I can't find that user! Make sure they're in this server before trying to marry them, or go to a server they're in. If you're certain that person is in this server, then wait for them to come online and send a message first; that might help.");}
            if (mention.id === client.user.id) {return message.channel.send("Bonk! Don't try to hit on a taken man uwu");}
            if (mention.bot) {return message.channel.send("Us bots aren't smart enough to respond to a marriage request and we're really too boring to wanna marry in the first place, so I'll just stop you in your tracks now.");}
            if (mention.id === message.author.id) {return message.channel.send("ehe :sweat_smile: it doesn't work that way...");}
            const tu = await UserData.findOne({uid: message.author.id}) || new UserData({uid: message.author.id});
            if (tu.marriedTo) {return message.channel.send("Looks like you're already married to someone. Cheating, are we?");}
            const ou = await UserData.findOne({uid: mention.id}) || new UserData({uid: mention.id});
            if (ou.marriedTo) {return message.channel.send("Looks like that person is already in a relationship. Yikes, good luck with that.");}
            if (client.misc.cache.marriageRequests.has(ou.uid) && client.misc.cache.marriageRequests.get(ou.uid) === message.author.id) {
                tu.marriedTo = ou.uid; ou.marriedTo = tu.uid;
                tu.markModified('marriedTo'); ou.markModified('marriedTo');
                await tu.save(); await ou.save();
                return message.channel.send({embeds: [new Discord.MessageEmbed()
                    .setTitle(`New Marriage!`)
                    .setDescription(`With the powers invested in me by Wubzy ~~and myself because I'm cool like that~~, I now pronounce ${message.member.displayName} and ${message.guild.members.cache.get(ou.uid).displayName} a married couple till debt and richer Discord users do you part.`)
                    .setColor('6049e3')
                    .setFooter({text: "Luno", iconURL: client.user.avatarURL()})
                    .setTimestamp()
                ]});
            }
            if (client.misc.cache.marriageRequests.has(message.author.id)) {return message.channel.send("You're already waiting on another marriage response.");}
            if (client.misc.cache.marriageRequests.filter(u => u === ou.uid).size > 10) {return message.channel.send("*10 people are waiting on a response to marry this person. Yikes.*");}
            client.misc.cache.marriageRequests.set(message.author.id, ou.uid);
            return message.channel.send(`<@${ou.uid}>, you have a marriage request from ${message.member.displayName}. Send \`${prefix}marry @${message.member.displayName}\` to accept!`);
        }
    }
};