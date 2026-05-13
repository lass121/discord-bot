const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, StreamType, entersState, AudioPlayerStatus 
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

const app = express();
app.get("/", (req, res) => res.send("Cat Online"));
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
    
    if (!fs.existsSync(filePath)) {
        console.log("❌ Meow.mp3 file not found!");
        return;
    }

    const resource = createAudioResource(filePath, {
        inlineVolume: true,
        inputType: StreamType.Arbitrary
    });
    
    // Max volume for testing
    resource.volume.setVolume(2.0); 
    player.play(resource);
    console.log("🔊 Playing meow...");
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
        // Wait for connection to be solid
        await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
        connection.subscribe(player);
        
        // --- AUTO SPEAK ---
        playMeow();
        connection.setSpeaking(true); 

    } catch (e) {
        console.error("Connection failed:", e);
    }
}

client.once("ready", () => {
    console.log("Bot logged in!");
    connect();
    // Auto-meow loop
    setInterval(() => playMeow(), 300000);
});

client.on("messageCreate", async (msg) => {
    if (msg.content === "/27 stay") {
        await connect();
        playMeow();
        msg.reply("I'm in and meowing!");
    }
});

client.login(process.env.TOKEN);
