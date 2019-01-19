const Discord = require('discord.js');
const twitch_api = require("./twitch_api.js");
const config = require("../../config.json");

let client;
let isPrincessOnline = true;

module.exports = {
    checkPrincessOnline: testTwitchOnline,
    client: client,
}

function testTwitchOnline() {
    twitch_api.fetchStreamData({
            login: 'princesspaperplane'
        },
        handleTestResponse
    )
}

function handleTestResponse(response) {

    let date = new Date(Date.now());
    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hourCycle: 'h24',
    };

    console.log("Status checked at: " + date.toLocaleDateString('de-DE', options));

    //When data is empty, there is no stream online
    if (response.data.length == 0) {
        //princess not online
        if (isPrincessOnline) {
            console.log("PrincessPaperplane ist offline gegangen!");
            console.log(response);
            isPrincessOnline = false;
        }        
    } else {
        //When princess is online for the first time since last API call
        if (!isPrincessOnline) {
            console.log("PrincessPaperplane ist online gegangen!");
            console.log(response);
            isPrincessOnline = true;
        }
    }
}
