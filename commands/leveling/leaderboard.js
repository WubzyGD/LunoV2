const Discord = require('discord.js');

const XP = require('../../models/localxp');
const Monners = require('../../models/monners');

module.exports = {
    name: "leaderboard",
    aliases: ['lb', 'rank'],
    meta: {
        category: 'Leveling',
        description: "Find your place in the server's ranks and see the top-ranking members in the server.",
        syntax: '`leaderboard`',
        extra: null,
        guildOnly: true
    },
    cooldown: 10000,
    help: "Find your place in the server's ranks and see the top-ranking members in the server.",
    async execute(message, msg, args, cmd, prefix, mention, client) {
        let cfmh = '<a:xp:870418598047387668>';

        let gxp = await XP.findOne({gid: message.guild.id});
        if (!gxp) {return message.channel.send("Your server doesn't have XP enabled! If it's something you want to use, you can enable it with the `setupleveling` command");}
        let xp = gxp.xp;
    
        let lvlp = Object.keys(xp).sort((a, b) => {return xp[a][1] - xp[b][1];}).reverse();
        let lvl = lvlp.slice(0, Object.keys(xp).length >= 10 ? 10 : Object.keys(xp).length);
        let lvls = ``;
        let i; for (i=0; i<lvl.length; i++) {lvls += `${i+1}. <@${lvl[i]}> -> **Level ${xp[lvl[i]][1]}**\n`;}
        lvls += `\n${cfmh} *You are ranked **#${lvlp.indexOf(message.author.id) + 1}** at Level ${xp[lvlp[lvlp.indexOf(message.author.id)]][1]}.*`;

        let monners = [];
        for await (const monner of Monners.find()) {
            monners.push(monner);
        }

        const sm = monners.sort((a, b) => a.currency - b.currency).reverse();

        return message.channel.send({embeds: [new Discord.MessageEmbed()
            .setTitle("Server Leaderboard")
            .setThumbnail(message.guild.iconURL({size: 2048, dynamic: true}))
            .addField("Level", lvls)
            .addField("Monners", `${sm.slice(0, 10).map((m, i) => `${i+1}. <@${m.uid}> -> **${m.currency}** <a:CF_mooners:868652679717589012>`).join("\n")}\n\n<a:CF_mooners2:868653224817741864> *You are ranked **#${sm.indexOf(sm.filter(m => m.uid === message.author.id)[0]) + 1}** at ${sm[sm.indexOf(sm.filter(m => m.uid === message.author.id)[0])].currency} <a:CF_mooners:868652679717589012>.*`)
            .setColor('6049e3')
            .setFooter({text: "Luno | Stats may be up to 2 minutes out of sync"})
            .setTimestamp()
        ]});

        /*u = Object.keys(tm.messages.members).sort((a, b) => {return tm.messages.members[a] - tm.messages.members[b];}).reverse().slice(0, Object.keys(tm.messages.members).length >= 5 ? 5 : Object.keys(tm.messages.members).length);
        us = ``;
        let i2; for (i2=0; i2<u.length; i2++) {us += `${i2+1}. <@${u[i2]}> -> **${tm.messages.members[u[i2]]} Messages**\n`;}*/
        //if (args[0] && ['mooners', 'currency', 'balance', 'bal'].includes(args[0].toLowerCase())) {}
        //else {}
    }
};
