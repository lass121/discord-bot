const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, StreamType, AudioPlayerStatus 
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

const app = express();
app.get("/", (req, res) => res.send("Bot is Ready"));
app.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const VOICE_ID = '1488542254971748414'; 
const TEXT_ID = '1488542254598721713'; 
const player = createAudioPlayer();

function playMeow() {
    const filePath = path.join(__dirname, 'Meow.mp3');
    
    // Check if file exists so we don't crash
    if (!fs.existsSync(filePath)) {
        return console.log("ERROR: Meow.mp3 not found in root folder!");
    }

    try {
        const resource = createAudioResource(filePath, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary
        });
        resource.volume.setVolume(1.5);
        player.play(resource);
        console.log("Meow audio started playing.");
    } catch (err) {
        console.error("Playback error:", err.message);
    }
}

function connect() {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const connection = joinVoiceChannel({
        channelId: VOICE_ID,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMuted: false
    });

    connection.subscribe(player);
}

client.once("ready", () => {
    console.log("Cat Bot is Online!");
    connect();

    setInterval(() => {
        client.channels.fetch(TEXT_ID).then(c => c.send("Meow!")).catch(() => null);
        playMeow();
    }, 300000);
});

client.on("messageCreate", (msg) => {
    if (msg.content === "/27 stay") {
        connect();
        playMeow();
        msg.reply("I'm in! If you don't hear me, check if I'm Server Muted.");
    }
});

// Logs if the player hits an error
player.on('error', error => console.error(`Audio Player Error: ${error.message}`));

client.login(process.env.TOKEN);
