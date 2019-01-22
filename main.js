const chalk = require("chalk");

const Discord = require("discord.js");
global._client = new Discord.Client();

/**
 * JSON FILES
 */
const config = require('./config.json');
const secret = require('./secret.json');

/**
 * BOT MODULES
 */
const commands = require("./src/discord/commands.js");

const TwitchAnnouncement = require("./src/discord/twitch_announcement.js");
const announcer = new TwitchAnnouncement();

/**
 * @type {NodeJS.Timeout}
 */
let coroutineID;

/** @type {string} */
global.__basedir = __dirname;

global._client.on('ready', () => {
    console.log(`Connected under name ${global._client.user.tag}`);

    //Check streamer statusses
    announcer.initCheckStreamStatus();
});

global._client.on('message', (msg) => {
    //commands.handleCommand(msg);
});

global._client.on('disconnect', (event) => {
    console.warn("DISCONNECTED FROM DISCORD SERVERS!");
    process.exit(400);
});

global._client.on('error', (error) => {
    console.error(error);
    console.log("Business as usual then...");
});

//When pm2 wants to shutdown the process
process.on('SIGINT', function () {
    db.stop(function (err) {
        process.exit(err ? 1 : 0);
    });
});

global._client.login(secret.discord.token);
console.log("Logged in");