const Discord = require('discord.js');

const chalk = require('chalk');
const ora = require('ora');
const mongoose = require('mongoose');
const readline = require('readline');

const {SlashCommand} = require('./util/slash');
const {SlashManager} = require('./util/slashmanager');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {Tag} = require('./util/tag');
const {TagFilter} = require('./util/tagfilter');

const flags = Discord.Intents.FLAGS;
let fl = []; Object.keys(flags).forEach(flag => fl.push(flags[flag]));
let client = new Discord.Client({intents: fl, partials: ["CHANNEL", "REACTION", "MESSAGE"]});

client.misc = {
    savers: ['497598953206841375', '480535078150340609', '468903364533420074'],
    activeDMs: new Discord.Collection(),
    statusPings: new Discord.Collection(),
    startup: new Date(),
    startupNoConnect: null,
    cache: {
        ar: new Map(),
        arIgnore: new Map(),
        bl: {
            guild: [],
            user: []
        },
        lxp: {
            enabled: [],
            xp: {},
            hasLevelRoles: [],
            disabledChannels: new Map(),
            rates: new Map()
        },
        chestsTimeout: new Map(),
        chests: {
            enabled: [],
            timeout: new Map(),
            waiting: new Map()
        },
        monit: {},
        monitEnabled: [],
        inVC: [],
        VCG: {},
        activeVC: [],
        chars: new Discord.Collection(),
        anime: new Discord.Collection(),
        charsID: new Discord.Collection(),
        animeID: new Discord.Collection(),
        charsNum: 0,
        charsLove: new Discord.Collection(),
        monners: {},
        tickets: new Discord.Collection(),
        marriageRequests: new Discord.Collection(),
        returnToSleep: new Map()
    },
    loggers: {},
    rl: readline.createInterface({input: process.stdin, output: process.stdout}),
    cooldown: new Discord.Collection(),
    config: {
        nocli: false,
        dev: false,
        logs: 'normal',
        lightstartup: false,
        ignorecmds: []
    },
    cf: '782727129414500374'
};

//const config = require('./config.js');
const auth = require('./auth.json');

//client.config = config;

async function init() {
    const cliargs = new TagFilter([
        new Tag(['cli', 'c', 'nc', 'nocli'], 'nocli', 'toggle'),
        new Tag(['dev', 'd', 'development', 'test'], 'dev', 'toggle'),
        new Tag(['logs', 'l', 'loglevel', 'll'], 'logs', 'append'),
        new Tag(['lightstart', 'lightstartup', 'ls'], 'lightstartup', 'toggle'),
        new Tag(['i', 'ignore', 'icmd', 'ignorecmd'], 'ignorecmds', 'listAppend')
    ]).test(process.argv.slice(2).join(" "));

    if (Object.keys(cliargs).length) {
        console.log(`${chalk.gray('[ARGS]')} >> ${chalk.gray.bold("Arguments detected.\n")}`);
        Object.keys(cliargs).forEach(arg => {
            client.misc.config[arg] = cliargs[arg];
            console.log(`${chalk.gray('[ARGS]')} >> ${chalk.gray.bold(arg)}${chalk.gray(':')} ${chalk.blue(cliargs[arg])}`);
        });
        console.log('');
    }

    let cloginsp = ora(chalk.magentaBright('Connecting Discord client...')).start();
    let pclc = new Date().getTime();
    await client.login(auth.token);
    cloginsp.stop(); cloginsp.clear();
    console.log(`${chalk.green('[BOOT]')} >> ${chalk.greenBright(`Connected to Discord in `)}${chalk.white(`${new Date().getTime() - pclc}ms`)}`);

    client.misc.startupNoConnect = new Date();
    client.config = auth;

    client.slash = new SlashManager(client).setTestServer('691122844339404800').importCommands().init();
    client.slash.register();
    client = client.slash.client;

    let mloginsp = ora(chalk.magentaBright('Connecting to Mongo client...')).start();
    let pmcc = new Date().getTime();
    const config = client.config;
    try {
        await mongoose.connect(`mongodb+srv://${config.database.user}:${config.database.password}@${config.database.cluster}.uqyvv.mongodb.net/test`, {
            useFindAndModify: false, useNewUrlParser: true, dbName: 'Luno', useUnifiedTopology: true, useCreateIndex: true
        }).catch(e => {
            let date = new Date(); date = date.toString().slice(date.toString().search(":") - 2, date.toString().search(":") + 6);
            console.error(`\n${chalk.red('[ERROR]')} >> ${chalk.yellow(`At [${date}] | Occurred while trying to connect to Mongo Cluster`)}`, e);
            mloginsp.stop(); mloginsp.clear();
        });
        mloginsp.stop(); mloginsp.clear();
        console.log(`${chalk.green('[BOOT]')} >> ${chalk.greenBright(`Connected to Mongo Database in `)}${chalk.white(`${new Date().getTime() - pmcc}ms`)}`);
    } catch (e) {
        let date = new Date(); date = date.toString().slice(date.toString().search(":") - 2, date.toString().search(":") + 6);
        console.error(`\n${chalk.red('[ERROR]')} >> ${chalk.yellow(`At [${date}] | Occurred while trying to connect to Mongo Cluster`)}`, e);
        mloginsp.stop(); mloginsp.clear();
    }

    ['commands', 'aliases', 'executables'].forEach(x => client[x] = new Discord.Collection());
    client.responses = {triggers: [], commands: new Discord.Collection()};

    ['command', 'event', 'response'].forEach(x => require(`./handle/${x}`)(client));
    if (!client.misc.config.nocli) {require('./handle/console')(client);}

    client.developers = ["330547934951112705", "480535078150340609"];
    client.utils = {}; //small collection of basic string manipulation utilities so prettier strings are easier

    //pluralize most strings based on a number
    client.utils.s = num => num === 1 ? '' : 's';
    //pluralize but pass in the text to make plural
    client.utils.as = (num, text) => `${text}${client.utils.s(num)}`;
    // "a" or "an" based on the provided string, caps to begin with capital letter
    client.utils.an = (text, caps) => `${caps ? 'A' : 'a'}${['a', 'e', 'i', 'o', 'u'].includes(text.toLowerCase().trim().slice(0, 1)) ? 'n' : ''} ${text}`;
    //capitalize a string automatically, "a" if rest of string should be automatically lowercased
    client.utils.c = (text, a=true) => `${text.slice(0, 1).toUpperCase()}${a ? text.slice(1).toLowerCase() : text.slice(1)}`;
    //split text into words and autocap each one
    client.utils.ca = (text, a=true) => text.split(/\s+/gm).map(t => client.utils.c(t, a)).join(" ");
    //format a moment-presice-range object
    client.utils.sm = (mpr, ago=true) => `${mpr.years ? `${mpr.years} year${client.utils.s(mpr.years)} ` : ''}${mpr.months ? `${mpr.months} month${client.utils.s(mpr.months)} ` : ''}${mpr.days} day${client.utils.s(mpr.days)}${ago ? ' ago' : ''}`;
    //add a grammatically correct possessive indicator to the end of a word/string
    client.utils.p = (text) => text.endsWith('s') ? "'" : "'s";
    //possessivise but pass in the text to possessivize
    client.utils.ps = (text) => `${text}${client.utils.p(text)}`;
    //random element of array
    client.utils.gr = list => list[Math.floor(Math.random() * list.length)];
    client.utils.logch = async () => {return client.guilds.cache.get('762707532417335296').channels.cache.get('762732961753595915');};
    client.utils.split = function*(x, n) {for (let i = 0; i < x.length; i += n) {yield(x.slice(i, i + n));}}
    client.guildconfig = {};
    client.guildconfig.prefixes = new Map();

    client.guildconfig.logs = new Map();

    await require('./util/wait')(5000);
    if (!client.misc.readied) {client.misc.forcedReady = true; await require('./events/ready')(client);}
}
init().then(() => {});