const Discord = require("discord.js");
const moment = require('moment');
const os = require('os');

const UserData = require('../../models/user');

module.exports = {
    name: "info",
    aliases: ["i", "botinfo", "bot"],
    help: "There's not really anything to help with here! Just use `{{p}}info` to learn more about me!",
    meta: {
        category: 'Misc',
        description: "Get info about me, my creators, and my status.",
        syntax: '`info`',
        extra: null
    },
    async execute(message, msg, args, cmd, prefix, mention, client) {
        let botData = await require('../../models/bot').findOne({finder: 'lel'});
        let user = await UserData.findOne({uid: message.author.id});

        return message.channel.send({embeds: [new Discord.MessageEmbed()
            .setAuthor({name: "About Me!", iconURL: client.users.cache.get(client.developers[Math.floor(Math.random() * client.developers.length)]).avatarURL()})
            .setThumbnail(client.user.avatarURL({size: 1024}))
            .setDescription(`I am created by WubzyGD#8766 for Crescent's Family as an all-purpose bot to end the need for more than one bot.`)
            .addField("Presence", `I'm watching over approximately **${client.users.cache.size}** people in this server!`)
            .addField("Restarts", `${botData.restarts}`, true)
            .addField("Commands Executed", `${botData.commands}${user ? `\nYou: **${user.commands}** | **${Math.floor((user.commands / botData.commands) * 100)}%**` : ''}`, true)
            .addField("Last Restart", moment(botData.lastRestart).fromNow(), true)
            .addField("Mem", `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB\` heap of \`${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)}MB\` allocated. | **${Math.floor((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)}%**\nTotal RAM: \`${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)}GB\` | Free RAM: \`${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)}GB\``, true)
            .setColor("6049e3")
            .setFooter({text: "Luno"})
            .setTimestamp()
        ]});
    }
};