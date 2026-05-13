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

// Function to fire the meow
function playMeow() {
    const filePath = path.resolve(__dirname, 'Meow.mp3');
    
    if (!fs.existsSync(filePath)) {
        console.log("❌ File Meow.mp3 is missing from the folder!");
        return;
    }

    const resource = createAudioResource(filePath, {
        inlineVolume: true,
        inputType: StreamType.Arbitrary
    });
    
    resource.volume.setVolume(1.8); 
    player.play(resource);
    console.log("🔊 Playing Meow.mp3 now!");
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
        
        // AUTO-SPEAK: Trigger meow immediately upon entry
        playMeow();
        
        // This is the "force speak" command for Discord
        connection.setSpeaking(true); 

    } catch (e) {
        console.error("Connection failed:", e);
    }
}

client.once("ready", () => {
    console.log("Bot logged in!");
    connect();

    // Auto-Meow Loop (Every 5 minutes)
    setInterval(() => playMeow(), 300000);
});

client.on("messageCreate", async (msg) => {
    if (msg.content === "/27 stay") {
        await connect();
        playMeow();
        msg.reply("I'm in and meowing!");
    }
});

// Restart if the player stops unexpectedly
player.on(AudioPlayerStatus.Idle, () => {
    console.log("Audio finished.");
});

client.login(process.env.TOKEN);
