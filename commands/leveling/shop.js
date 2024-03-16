const Discord = require('discord.js');

const Monners = require("../../models/monners");
const Stores = require("../../models/stores");

module.exports = {
    name: "shop",
    aliases: ['store', 'sh'],
    meta: {
        category: 'Leveling',
        description: "Create and manage a shop!",
        syntax: '`shop [init|add|info|edit|delete] [item]`',
        extra: null,
        guildOnly: true
    },
    help: new Discord.MessageEmbed()
        .setTitle("Help -> Store/Shop")
        .setDescription("Create, manage, and use the store/shop within the server. This allows you to buy roles and more!")
        .addField("Shop Usage", "You can view the whole shop by running just `shop`, buy an item with `buy`, or get info on a set item with `info`.\n\nMods can manage the shop with `add`, `edit`, `delete`.")
        .addField("Syntax", "`shop [init|add|info|edit|delete] [item]`"),
    async execute(message, msg, args, cmd, prefix, mention, client) {
        const ts = await Stores.findOne({gid: message.guild.id});
        if (!args.length) {
            if (!ts) {return message.channel.send(`Your server doesn't have a shop setup! You can use \`${prefix}shop init\` to remedy that, though!`);}
            if (!ts.items.length) {return message.channel.send(`Your server has a shop, but it's empty! Add some items with \`${prefix}shop add\`!`);}
            return message.channel.send({embeds: [new Discord.MessageEmbed()
                .setTitle("Server Store")
                .setThumbnail(message.guild.iconURL({size: 1024, dynamic: true}))
                .setDescription(`Use \`${prefix}shop info\` to get more info on a specific item.`)
                .addField("Items", `${ts.items.map((x, i) => `\`${`${i}`.padStart(2, '0')}\` **${x.name}** *「${client.utils.c(x.buyType)}」* -> <:monners:926736756047495218>**${x.price}**`).join('\n')}`)
                .setColor('6049e3')
                .setFooter({text: "Luno", iconURL: client.user.avatarURL()})
                .setImage("https://cdn.discordapp.com/attachments/807646521825820682/1218495743032033360/miraimoney.gif")
                .setTimestamp()
            ]})
        }
        if (['init', 'setup', 'in', 'initialize', 'en', 'enable'].includes(args[0])) {
            if (!message.member.permissions.has("ADMINISTRATOR")) {return message.channel.send("You must be a server admin in order to do that, silly~!");}
            if (ts) {return message.channel.send("This server already has a store set up!");}
            const ns = new Stores({gid: message.guild.id});
            return ns.save()
                .then(() => message.channel.send("Done!"))
                .catch(() => message.channel.send("Something went wrong when trying to do that! Try again...?"));
        }
        if (!ts) {return message.channel.send("Your server doesn't have a shop setup~!");}
        if (['i', 'info', 'view', 'v'].includes(args[0])) {
            
        }
    }
};