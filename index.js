const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, StreamType, entersState 
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

const app = express();
app.get("/", (req, res) => res.send("Cat is Active"));
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

// Function to play the sound
function playMeow() {
    const filePath = path.join(__dirname, 'Meow.mp3');
    if (!fs.existsSync(filePath)) return console.log("File Meow.mp3 not found!");

    const resource = createAudioResource(filePath, {
        inlineVolume: true,
        inputType: StreamType.Arbitrary
    });
    
    resource.volume.setVolume(2.0); 
    player.play(resource);
    console.log("🔊 Meowing started automatically!");
}

async function connectAndSpeak() {
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
        await entersState(connection, VoiceConnectionStatus.Ready, 20000);
        connection.subscribe(player);
        
        // --- THIS IS THE KEY ---
        // As soon as it's ready, it meows immediately
        playMeow(); 
        
        // Forces the green ring to show up
        connection.setSpeaking(true); 

    } catch (e) {
        console.error("Connection failed:", e);
    }
}

client.once("ready", () => {
    console.log("Bot is Online!");
    // Auto-join and Auto-speak on startup
    connectAndSpeak();

    // Keeps it meowing every 5 minutes automatically
    setInterval(() => {
        playMeow();
    }, 300000);
});

client.on("messageCreate", async (msg) => {
    if (msg.content === "/27 stay") {
        await connectAndSpeak();
        msg.reply("I'm in and I should be meowing right now!");
    }
});

client.login(process.env.TOKEN);
