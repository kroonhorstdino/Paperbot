const Discord = require("discord.js");
const client = new Discord.Client();

const commands = require("./commands.js");
const twitchAnnouncement = require("./discord_utility/twitch_announcement.js");

const config = require('../config.json');
const secret = require('../secret.json');


let interval = config.twitch.twitchStreamOnlineUpdateInterval;

client.on('ready', () => {
    console.log(`Connected under name ${client.user.tag}`);

    twitchAnnouncement.checkStreamOnline(client);
    let coroutineID = setInterval(twitchAnnouncement.checkStreamOnline, interval);
    console.log("Started automated Twitch API calls");
});

client.on('message', (msg) => {
    commands.handleCommand(msg);
});

client.on('disconnect', (event) => {
    
});

client.login(secret.token);
console.log("Logged in");