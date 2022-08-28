const Discord = require('discord.js');

const Monners = require("../../models/monners");

const ask = require('../../util/ask');
const wait = require("../../util/wait");

const slots = [ //emoji, mode, amount, bonus
    ["<:CF_AquaSob:809230820412882954>", 0, .25, 100],
    ["<a:CF_ChikaAutism:815284612661510175>", 0, .25, 250],
    ["<:CF_CursedCrescent:835931890379653181>", 1, .5, 10000],
    ["<a:CF_Clapping:833942937435242496>", 0, .35, 500],
    ["<a:CF_PopCat:808154108741550120>", 0, .25, 1000],
    ["<:CF_StarryEyes:825151634216583199>", 0, .75, 1500],
    ["<:CF_TanjiroDisgust:809231355174322196>", 0, .25, 750],
    ["<a:CF_Sussy:856904424671674379>", 0, .2, 100],
    ["<a:CF_mooners:868652679717589012>", 1, .1, 3500],
    ["<a:CF_mooners2:868653224817741864>", 0, .1, 1000],
    ["<a:CF_NekoNod:820187587057549343>", 0, .6, 2250],
    ["<a:CF_Coolest:834459148006588447>", 0, .05, 50],
];

module.exports = {
    name: "slots",
    meta: {
        category: 'Leveling',
        description: "Try your hand at the slot machine!",
        syntax: '`slots [amount]`',
        extra: null
    },
    cooldown: {
        time: 10000,
        message: "Slow down there, pardner! I'm not tryna be an enabler for that gambling addiction you've got going on over there. You need to wait ten seconds in between slot rolls!"
    },
    help: new Discord.MessageEmbed()
        .setTitle("Help -> Slots")
        .setDescription("Put your Monners in the machine and try your luck at getting rich")
        .addField("Syntax", "`slots [amount]`"),
    async execute(message, msg, args, cmd, prefix, mention, client) {
        let amount;
        if (!args.length) {
            const conf = await ask(message, "Does the default amount of 100 work for you?", 30000, false, true); if (!conf) {return;}
            if (['n', 'no'].includes(conf.trim().toLowerCase())) {
                amount = await ask(message, "How much would you like to gamble?", 60000, false, true); if (!amount) {return;}
            }
            if (!['yes', 'ye', 'y', 'sure'].includes(conf.trim().toLowerCase())) {return;}
            amount = 100;
        } else {amount = args[0].toLowerCase();}
        if (isNaN(Number(amount))) {return message.channel.send("Looks like your specified amount wasn't actually a number. Try again?");}
        amount = Number(amount);
        if (amount < 1) {return message.channel.send("You have to actually gamble something!");}
        let tm = await Monners.findOne({uid: message.author.id});
        if (!tm || !tm.currency) {return message.channel.send("Looks like you don't have any money to gamble in the first place!");}
        if (tm.currency < amount) {return message.channel.send(`You tried to bet **${amount}** <:monners:926736756047495218>, but you only have **${tm.currency}** <:monners:926736756047495218>.`);}

        const pick = () => slots[Math.floor(Math.random() * slots.length)];
        const dis = () => [[pick(), pick(), pick()],[pick(), pick(), pick()],[pick(), pick(), pick()]];
        const roll = [pick(), pick(), pick()];
        let machine = dis().map(l => l.map(r => r[0])).map(l => l.join(" "));
        machine = `> \<:blank:1013570884239372408> ${machine[0]}\n> \n> -  -  -  -  -  -  -  -  -  -\n> <a:CF_moonheart:868653516913246208> ${machine[1]}\n> -  -  -  -  -  -  -  -  -  -\n> \n> \<:blank:1013570884239372408> ${machine[2]}`;
        const em = await message.channel.send({content: "Rolling...", embeds: [new Discord.MessageEmbed()
            .setTitle(`Slots | ${amount}`)
            .setAuthor({name: message.member ? message.member.displayName : message.author.username, iconURL: message[message.member ? 'member' : 'author'].displayAvatarURL()})
            .setDescription(machine)
            .setColor('6049e3')
            .setFooter({text: "Luno"})
            .setTimestamp()
        ]});
        await wait(2000);
        machine = dis().map(l => l.map(r => r[0])).map(l => l.join(" "));
        machine = `> \<:blank:1013570884239372408> ${machine[0]}\n> \n> -  -  -  -  -  -  -  -  -  -\n> <a:CF_moonheart:868653516913246208> ${machine[1]}\n> -  -  -  -  -  -  -  -  -  -\n> \n> \<:blank:1013570884239372408> ${machine[2]}`;
        await em.edit({embeds: [em.embeds[0].setDescription(machine)]});
        await wait(2000);
        machine = dis();
        machine[1] = roll;
        machine = machine.map(l => l.map(r => r[0])).map(l => `${l.join(" ")}`);
        machine = `> \<:blank:1013570884239372408> ${machine[0]}\n> \n> -  -  -  -  -  -  -  -  -  -\n> <a:CF_moonheart:868653516913246208> ${machine[1]}\n> -  -  -  -  -  -  -  -  -  -\n> \n> \<:blank:1013570884239372408> ${machine[2]}`;
        let bonus = roll[0][0] === roll[1][0] && roll[0][0] == roll[2][0];
        let reward = 0;
        if (bonus) {reward += amount + roll[0][3] + roll[1][3] + roll[2][3];}
        let rewt = roll.map(r => (r[1] === 0 ? 1 : bonus ? 1 : -1) * r[2] * amount);
        rewt.forEach(r => reward += r);
        reward -= amount; reward = Math.floor(reward);
        let loss = reward < 0;
        let dr = reward;
        if (loss) {dr *= -1;}
        await em.edit({content: "Slots complete!", embeds: [
            em.embeds[0]
                .setDescription(machine)
                .addField("Result", `You ${loss ? 'lost' : 'gained'} **${dr}** <:monners:926736756047495218>`)
                .setColor(loss ? 'dc134c' : bonus ? 'ea42ff' : '25a242')
        ]});
        client.misc.cache.monners[message.author.id] += reward;
    }
};