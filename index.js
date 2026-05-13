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
app.get("/", (req, res) => res.send("Bot is running 24/7!"));
app.listen(process.env.PORT || 3000);

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

// Function to play the sound
function playMeow() {
    try {
        const resource = createAudioResource(path.join(__dirname, 'meow.mp3'), { inlineVolume: true });
        resource.volume.setVolume(1.0);
        player.play(resource);
        console.log("Playing meow sound.");
    } catch (err) {
        console.error("Playback error:", err.message);
    }
}

// Function to join and stay 24/7
function connectAndStay() {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const connection = joinVoiceChannel({
        channelId: VOICE_CHANNEL_ID,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false
    });

    connection.subscribe(player);

    connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.log("Reconnecting to stay 24/7...");
        setTimeout(connectAndStay, 5000);
    });
}

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    connectAndStay(); // Join immediately on start

    // 5-Minute Loop
    setInterval(async () => {
        // Chat Meow
        const channel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
        if (channel) channel.send("Meow!");

        // Voice Meow
        playMeow();
    }, INTERVAL);
});

client.on("messageCreate", (msg) => {
    // Your requested command to force stay
    if (msg.content === "/27 stay" || msg.content === "!stay") {
        connectAndStay();
        msg.reply("I am now locked into the voice channel 24/7. Meow!");
    }
});

client.login(process.env.TOKEN);
