const Discord = require("discord.js");
global._client = new Discord.Client();

const commands = require("./src/discord/commands.js");
const twitchAnnouncement = require("./src/discord/twitch_announcement.js");

const config = require('./config.json');
const secret = require('./secret.json');

/**
 * @type {NodeJS.Timeout}
 */
let coroutineID;

/** @type {string} */
global.__basedir = __dirname;

global._client.on('ready', () => {

    twitchAnnouncement.startCheckStreamStatus();
    console.log(`Connected under name ${global._client.user.tag}`);
});

global._client.on('message', (msg) => {
    //commands.handleCommand(msg);
}).catch(error => {
    console.error(error);
});

global._client.on('disconnect', (event) => {
    console.warn("DISCONNECTED FROM DISCORD SERVERS!");
    process.exit(400);
});

global._client.on('error', (error) => {
    console.error(error);
    console.log("Business as usual then...");
});


global._client.login(secret.discord.token);
console.log("Logged in");