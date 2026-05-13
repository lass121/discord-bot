const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, StreamType, entersState, AudioPlayerStatus 
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

const app = express();
app.get("/", (req, res) => res.send("Bot Online"));
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
const player = createAudioPlayer();

function playMeow() {
    const filePath = path.resolve(__dirname, 'Meow.mp3');
    if (!fs.existsSync(filePath)) return console.log("File Meow.mp3 is missing!");

    const resource = createAudioResource(filePath, {
        inlineVolume: true,
        inputType: StreamType.Arbitrary
    });
    
    // FORCED LOUD VOLUME
    resource.volume.setVolume(2.5); 
    player.play(resource);
    console.log("🔊 Meow triggered!");
}

async function connect() {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const connection = joinVoiceChannel({
        channelId: VOICE_ID,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMuted: false
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        connection.subscribe(player);
        
        // This is the "Wake Up" signal
        connection.setSpeaking(true);
        playMeow(); 
        
    } catch (e) {
        console.error("Connection error:", e);
    }
}

client.once("ready", () => {
    console.log("Cat Bot is Live!");
    connect();
    
    // Auto-Meow every 5 mins
    setInterval(() => playMeow(), 300000);
});

client.on("messageCreate", async (msg) => {
    if (msg.content === "/27 stay") {
        await connect();
        msg.reply("Connected! Meowing now...");
    }
    if (msg.content === "/meow now") {
        playMeow();
        msg.reply("Meow!");
    }
});

client.login(process.env.TOKEN);
