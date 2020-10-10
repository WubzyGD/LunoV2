const Discord = require('discord.js');
const mongooes = require('mongoose');
const UserData = require('../models/user');

module.exports = {
    name: "clearstatus",
    aliases: ['statusclear', 'cs'],
    help: "Clears your status, if you have one set. Does not take any arguments.",
    async execute(message, msg, args, cmd, prefix, mention, client) {
        let tu = await UserData.findOne({uid: message.author.id});
        if (!tu && !tu.statusmsg.length) {
            return message.reply("you have no status for me to clear");
        }
        if (tu.statusclearmode === "auto") {return;}
        tu.statusmsg = '';
        tu.statustype = '';
        tu.save();
        return message.reply("welcome back! I cleared your status.");
    }
};