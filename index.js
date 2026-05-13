const express = require("express");
const { Client, GatewayIntentBits, Events } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, StreamType, entersState, AudioPlayerStatus 
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

// --- WEB SERVER (For Railway Health Checks) ---
const app = express();
app.get("/", (req, res) => res.send("Bot Status: Healthy"));
app.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// --- CONFIGURATION ---
const VOICE_ID = '1488542254971748414'; 
const player = createAudioPlayer();

// Audio Player Error Handling (Zero-Log Error Policy)
player.on('error', error => {
    console.error(`Player Error: ${error.message}`);
});

function playMeow() {
    const filePath = path.resolve(__dirname, 'Meow.mp3');
    
    if (!fs.existsSync(filePath)) {
        console.log("Warning: Meow.mp3 file not found.");
        return;
    }

    // Using Arbitrary Stream for bypass and CBR compatibility
    const resource = createAudioResource(fs.createReadStream(filePath), {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
    });
    
    resource.volume.setVolume(1.5); 
    player.play(resource);
}

async function connectToVoice() {
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
        
        // Signal Discord that we are active (The Green Ring Fix)
        connection.setSpeaking(true);
        
        playMeow();
        console.log("Successfully connected and meowing.");
    } catch (err) {
        console.log("Connection check: Retrying...");
    }
}

// --- BOT EVENTS ---
client.once(Events.ClientReady, (c) => {
    console.log(`Bot is logged in as ${c.user.tag}`);
    connectToVoice();
    
    // Auto-Meow Interval (5 Minutes)
    setInterval(() => playMeow(), 300000);
});

client.on(Events.MessageCreate, async (msg) => {
    if (msg.content === "/27 stay") {
        await connectToVoice();
        msg.reply("Meow! I have joined and I'm ready.");
    }
    if (msg.content === "/meow now") {
        playMeow();
        msg.reply("Meowing now!");
    }
});

// Auto-Rejoin if kicked or disconnected
client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    if (oldState.member.id === client.user.id && !newState.channelId) {
        console.log("Disconnected. Reconnecting...");
        setTimeout(() => connectToVoice(), 5000);
    }
});

client.login(process.env.TOKEN);
