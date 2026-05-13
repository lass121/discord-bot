const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus, 
    AudioPlayerStatus 
} = require('@discordjs/voice');
const path = require('path');

const app = express();
app.get("/", (req, res) => res.send("Meow bot is online."));
app.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ]
});

// --- SETTINGS ---
const TEXT_CHANNEL_ID = '1488542254598721713'; 
const VOICE_CHANNEL_ID = 'PASTE_YOUR_VOICE_ID_HERE'; // <--- Don't forget this!
const INTERVAL = 5 * 60 * 1000; 

let connection;
const player = createAudioPlayer();

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);
    
    const textChannel = await client.channels.fetch(TEXT_CHANNEL_ID);
    
    // Connect to voice immediately
    maintainVoiceConnection();

    // The 5-minute loop
    setInterval(async () => {
        // 1. Chat Meow
        if (textChannel) textChannel.send("Meow!");

        // 2. Voice Meow
        playMeowFile();
    }, INTERVAL);
});

function maintainVoiceConnection() {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    connection = joinVoiceChannel({
        channelId: VOICE_CHANNEL_ID,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false // Keeps the bot looking "active"
    });

    // 24/7 Logic: If kicked or disconnected, try to reconnect
    connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.log("Disconnected from voice! Reconnecting in 5 seconds...");
        setTimeout(maintainVoiceConnection, 5000);
    });

    connection.subscribe(player);
}

function playMeowFile() {
    try {
        const resource = createAudioResource(path.join(__dirname, 'meow.mp3'));
        player.play(resource);
        console.log("Played meow.mp3 in voice channel.");
    } catch (error) {
        console.error("Error playing file:", error.message);
    }
}

client.login(process.env.TOKEN);
