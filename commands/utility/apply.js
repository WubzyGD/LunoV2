const Discord = require('discord.js');
const moment = require('moment');
require('moment-precise-range-plugin');

const ModApp = require('../../models/modapp');

const ask = require('../../util/ask');

module.exports = {
    name: "apply",
    meta: {
        category: 'Utility',
        description: "Apply for a moderation position here!",
        syntax: '`apply`',
        extra: null
    },
    help: "Apply for a moderation position here!",
    async execute(message, msg, args, cmd, prefix, mention, client) {
        if ((message.guild && message.guild.id === client.misc.alt) || !client.guilds.cache.get(client.misc.cf).members.cache.has(message.author.id)) {return message.channel.send("That command isn't available in this server *yet*");}
        let ma = await ModApp.findOne({gid: client.misc.cf}) || new ModApp({gid: client.misc.cf});
        if (!ma.enabled && !message.author.id === '330547934951112705') {return message.channel.send("Moderation applications are not currently open at this time! We'll announce when we're looking for mods, so keep your eyes peeled!");}
        if (ma.apps[message.author.id]) {return message.channel.send("Looks like you already have an application made! If you need it to be removed for some reason, contact WubzyGD.");};
        
        function clearDM() {client.misc.activeDMs.delete(message.author.id);}
        if (client.misc.activeDMs.has(message.author.id)) {return message.reply("I'm already asking you questions in DM! Finish that command before using this one.");}
        client.misc.activeDMs.set(message.author.id, 'modapp');
        if (message.guild) {message.channel.send("Check your DMs!");}
        let mesg = await message.author.send("I'll be asking you a few questions here about yourself. You can simply ignore the messages for a few minutes to cancel the process. If at any point I tell you that you did something wrong (usually that your answer was too long), you'll need to restart your application.").catch(() => {message.reply("Please open your DMs so I can ask you some questions!");});
        let dmch = mesg.channel;

        let conf = await ask(mesg, "The whole of the moderation team (but nobody else) at Crescent's Family will be able to see this application's responses. Joke responses will be rejected and may result in consequences. Responses with little or no effort or grammatical quality will be rejected. Are you clear about these things?", 60000, true); if (!conf) {return clearDM();}
        if (['n', 'no'].includes(conf.trim().toLowerCase())) {clearDM(); return dmch.send("Oh, alrighty. Thanks for trying to apply... I guess?");}
        if (!['yes', 'ye', 'y', 'sure'].includes(conf.trim().toLowerCase())) {clearDM(); return dmch.send("Please specify yes or no you weeb!");}

        let name = await ask(mesg, "**:crescent_moon:┋ Q1 •** What is your name (optional) and Discord username (with tag)?", 120000, true); if (!name) {return clearDM();}
        if (name.length > 50) {clearDM(); return dmch.send("Are you sure your name's that long? :sweat_smile: Make sure you're only stating your name and username.");}

        let agep = await ask(mesg, "**:crescent_moon:┋ Q2 •** How old are you and what are your preferred pronouns?", 90000, true); if (!agep) {return clearDM();}
        if (agep.length > 150) {clearDM(); return dmch.send(":sweat_smile: let's keep your answer a little shorter than that, please.");}

        let hobbies = await ask(mesg, "**:crescent_moon:┋ Q3 •**  Do you have any special hobbies? (Optional, if you choose not to, put '**N/A**') (Please be brief)", 180000, true); if (!hobbies) {return clearDM();}
        if (hobbies.length > 750) {clearDM(); return dmch.send("Heya! Please send just a quick list of your hobbies!");}

        let tz = await ask(mesg, "**:crescent_moon:┋ Q4 •** What is your time zone? (EX: CST, EST) ", 60000, true); if (!tz) {return clearDM();}
        if (tz.length > 150) {clearDM(); return dmch.send("That's way too long to be a timezone...");}

        let experience = await ask(mesg, "**:crescent_moon:┋ Q5 •** Do you have any Moderation experience? If so, what kind of community/communities did you moderate, what position(s) did you have? If you have loads of experience, please specify your most notable and lengthy positions.", 240000, true); if (!experience) {return clearDM();}
        if (experience.length > 1000) {clearDM(); return dmch.send("Heya! That looks like a lot of experiece, but we want to avoid bloat-y applications, so please try again and be more brief in your response.");}

        let contrib = await ask(mesg, "**:crescent_moon:┋ Q6 •** If you were to be accepted into our team, what special contributions can you bring to the server and team? How would the community benefit from your role?", 240000, true); if (!contrib) {return clearDM();}
        if (contrib.length > 1024) {clearDM(); return dmch.send("I love that you're enthusiastic, but I'm gonna forget all of that. Can you try getting to the point just a *liiitle* more quickly?");}
        
        let time = await ask(mesg, "**:crescent_moon:┋ Q7 •** What days are you active on Discord, and how much time do you typically spend in the server? (Use mostly numbers and quick answers, like \"I'm active whenever I'm not at school/work, and I usually spend 3 or 4 hours a day in the server.\" Yes, you can use that if it applies to you)", 120000, true); if (!time) {return clearDM();}
        if (time.length > 500) {clearDM(); return dmch.send("Oi! I said be brief!");}

        let warn = await ask(mesg, "**:crescent_moon:┋ Q8 •** What do you consider to be a **warnable offense**? *(aka giving someone a warning through a bot or verbal)*", 120000, true); if (!warn) {return clearDM();}
        if (warn.length > 750) {clearDM(); return dmch.send("Just like... a couple examples is fine...");}

        let mute = await ask(mesg, "**:crescent_moon:┋ Q9 •** What do you consider to be a **mute-able offense**? *(aka preventing someone from being able to speak for a given duration of time)*", 120000, true); if (!mute) {return clearDM();}
        if (mute.length > 750) {clearDM(); return dmch.send("Just like... a couple examples is fine...");}

        let ban = await ask(mesg, "**:crescent_moon:┋ Q10 •** What do you consider to be a **bannable offense**? *(aka permanently removing someone from the server)*", 120000, true); if (!ban) {return clearDM();}
        if (ban.length > 750) {clearDM(); return dmch.send("Just like... a couple examples is fine...");}

        let traits = await ask(mesg, "**:crescent_moon:┋ Q11 •** What are some of your **strengths** and **weaknesses**? You don't have to spoil your deepest darkest secret, and if you're not comfortable with sharing, then say **N/A**, but this makes selecting you more difficult as we won't know you as well.", 240000, true); if (!traits) {return clearDM();}
        if (traits.length > 1000) {clearDM(); return dmch.send("The Discord police won't let me let you have a response longer than that, sadly. Can you try shortening it a little? Thanks.");}

        let notes = await ask(mesg, "**:crescent_moon:┋ Q12 •** Anything else you'd like to briefly add? (**N/A** if not)", 240000, true); if (!notes) {return clearDM();}
        if (notes.length > 1000) {clearDM(); return dmch.send("C'mon now, I said *briefly*.");}

        let fconf = await ask(mesg, "Is this your card? Or... ehm... are you sure that the answers you have submitted are what you want to use, as they cannot be changed?", 120000, true); if (!fconf) {return clearDM();}
        if (['n', 'no'].includes(fconf.trim().toLowerCase())) {clearDM(); return dmch.send("Oh, alrighty. I won't send your application.");}
        if (!['yes', 'ye', 'y', 'sure'].includes(fconf.trim().toLowerCase())) {clearDM(); return dmch.send("Please specify yes or no you weeb!");}

        clearDM();

        let cfmsg = await dmch.send("One moment...");

        try {
            let mch = new Discord.WebhookClient({id: "869739554897285150", token: "o1igg02aB_rFNPbucnIe-ntN0gTsKYnC47NWYNQoFP536EliAQtqLuAFK6NQy1Wzr1_a"});
            mch.send({
                content: "<@&814668063366184960>",
                username: "Luno | Moderation Applications",
                avatarURL: client.user.avatarURL({size: 2048}),
                embeds: [
                    new Discord.MessageEmbed()
                        .setAuthor({name: message.author.tag, avatarURL: message.author.avatarURL()})
                        .setTitle("New Moderator Application")
                        .setDescription(`User ID: **${message.author.id}**\nThey've been in the server for **${moment.preciseDiff(moment(client.guilds.cache.get(client.misc.cf).members.cache.get(message.author.id).joinedAt), moment())}**\n\nThis is the personal section of the application.`)
                        .addField("Name", name, true)
                        .addField("Age/Pronouns", agep, true)
                        .addField("Hobbies", hobbies)
                        //.addField("Server Time", sage)
                        .addField("Timezone", tz)
                        .addField("Activity/Dedication", time)
                        .addField("Experience", experience)
                        .addField("Contribution", contrib)
                        .addField("Strengths/Weaknesses", traits)
                        .addField("Other Notes", notes)
                        .setColor('dc134c')
                        .setFooter({text: "Luno | Part 1 of 2"})
                        .setTimestamp(),
                    new Discord.MessageEmbed()
                        .setAuthor({name: message.author.tag, avatarURL: message.author.avatarURL()})
                        .setDescription(`This is the moderation section of the application.`)
                        .addField("Warnable Offense(s)", warn)
                        .addField("Mute-able Offense(s)", mute)
                        .addField("Bannable Offense(s)", ban)
                        .setColor('dc134c')
                        .setFooter({text: "Luno | Part 2 of 2"})
                        .setTimestamp()
                ]
            }).then(async whmt => {
                let whm = await client.guilds.cache.get(client.misc.cf).channels.cache.get(whmt.channel_id).messages.fetch(whmt.id);
                await whm.react('👍');
                await whm.react('👎');
                ma.apps[message.author.id] = "Submitted";
                ma.markModified(`apps.${message.author.id}`);
                await ma.save();
                return cfmsg.edit("Your application has been submitted! Thank you for taking the time and effort to apply for staff here at **Crescent's Family**. Please be patient as we review the applications, and don't harrass any member of staff for the results or progress, as it makes it harder for everyone and slows down our progress. Thank you qt ^^ <a:CF_NekoNod:820187587057549343>");
            }).catch((e) => {cfmsg.edit("For some reason, your application was not submitted. Please contact WubzyGD#8766 **as soon as possible** to resolve this issue."); console.log(e);})
        } catch (e) {console.log(e); return cfmsg.edit("For some reason, your application was not submitted. Please contact WubzyGD#8766 **as soon as possible** to resolve this issue.");}
    }
};