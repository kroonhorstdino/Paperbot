const Discord = require("discord.js");
const client = new Discord.Client();

const commands = require("./commands.js");
const twitch = require("./twitch_utility/twitch.js");

const config = require('../config.json');
const secret = require('../secret.json');


let interval = config.twitch.twitchStreamOnlineUpdateInterval;

client.on('ready', () => {
    console.log(`Connected under name ${client.user.tag}`);
    twitch.client = client;

    twitch.checkPrincessOnline();
    let coroutineID = setInterval(twitch.checkPrincessOnline, interval);
    console.log("Started automated Twitch API calls");
});

client.on('message', (msg) => {
    commands.handleCommand(msg);
});

client.on('disconnect', () => {
    
});

client.login(secret.token);