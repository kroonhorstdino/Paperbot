const Discord = require("discord.js");
const client = new Discord.Client();

const commands = require("./src/commands.js");
const twitchAnnouncement = require("./src/discord/twitch_announcement.js");

const config = require('./config.json');
const secret = require('./secret.json');

/**
 * @type {NodeJS.Timeout}
 */
let coroutineID;

/** @type {string} */
global.__basedir = __dirname;

let interval = config.twitch.twitchStreamOnlineUpdateInterval;

client.on('ready', () => {
    console.log(`Connected under name ${client.user.tag}`);

    //commands.init();

    twitchAnnouncement.checkStreamOnline(client);
    if (process.argv.includes("--once")) {
        console.log("Testing once");
    } else {
        coroutineID = setInterval(twitchAnnouncement.checkStreamOnline, interval, client);
    }
    
    console.log("Now checking on PrincesPaperplane's status");
});

client.on('message', (msg) => {
    //commands.handleCommand(msg);
});

client.on('disconnect', (event) => {
    console.warn("DISCONNECTED FROM DISCORD SERVERS!");
    process.exit(400);
});


client.login(secret.discord.token);
console.log("Logged in");