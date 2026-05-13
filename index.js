const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus,
    StreamType 
} = require('@discordjs/voice');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

// 1. Health Check Server for Railway
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Cat Bot is Online and Loud!"));
app.listen(PORT, "0.0.0.0", () => console.log(`Server on port ${PORT}`));

// 2. Bot Setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// --- SETTINGS ---
const TEXT_CHANNEL_ID = '1488542254598721713'; 
const VOICE_CHANNEL_ID = '1488542254971748414'; 
const INTERVAL = 5 * 60 * 1000; 

const player = createAudioPlayer();
let currentVolume = 1.0; 

// The function that makes the cat "talk" (play meow.mp3)
function playMeow(vol = currentVolume) {
    try {
        const filePath = path.join(__dirname, 'meow.mp3');
        const resource = createAudioResource(filePath, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary,
        });

        resource.volume.setVolume(vol);
        player.play(resource);
        console.log(`Meow played at ${vol * 100}% volume.`);
    } catch (err) {
        console.error("Audio Engine Error:", err.message);
    }
}

// Function to keep the bot in the channel 24/7
function connectAndStay() {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const connection = joinVoiceChannel({
        channelId: VOICE_CHANNEL_ID,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMuted: false
    });

    connection.subscribe(player);

    connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.log("Disconnected. Reconnecting to stay 24/7...");
        setTimeout(connectAndStay, 5000);
    });
}

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    connectAndStay();

    // 5-Minute Loop for Chat and Voice
    setInterval(async () => {
        try {
            const channel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
            if (channel) await channel.send("Meow!");
            playMeow();
        } catch (e) {
            console.log("Loop error:", e.message);
        }
    }, INTERVAL);
});

client.on("messageCreate", async (msg) => {
    // Command 1: Force Stay
    if (msg.content === "/27 stay") {
        connectAndStay();
        playMeow();
        return msg.reply("I am now locked in this voice channel 24/7. Meow!");
    }

    // Command 2: Manual Meow
    if (msg.content === "/meow now") {
        playMeow();
        return msg.reply("Meow! 🐾");
    }

    // Command 3: Volume Boost
    if (msg.content === "/meow loud") {
        currentVolume = 2.0;
        playMeow(2.0);
        return msg.reply("Volume boosted to 200%. Meow! 🔊");
    }

    // Command 4: Reset Volume
    if (msg.content === "/meow soft") {
        currentVolume = 1.0;
        playMeow(1.0);
        return msg.reply("Volume reset to 100%. Meow. 🔉");
    }
});

// Global stability handlers
process.on('unhandledRejection', error => console.error('Error:', error));
client.login(process.env.TOKEN);
