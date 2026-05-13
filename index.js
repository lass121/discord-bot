const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus 
} = require('@discordjs/voice');
const path = require('path');

const app = express();
app.get("/", (req, res) => res.send("Meow Bot is running on Railway 24/7!"));
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
const INTERVAL = 5 * 60 * 1000; // 5 Minutes

const player = createAudioPlayer();

// Logic to join and stay in voice
function stayInVoice() {
    const guild = client.guilds.cache.first();
    if (!guild) return console.log("Bot is not in a server yet.");

    const connection = joinVoiceChannel({
        channelId: VOICE_CHANNEL_ID,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false
    });

    connection.subscribe(player);

    // 24/7 Reconnect Logic
    connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.log("Disconnected! Reconnecting to stay 24/7...");
        setTimeout(stayInVoice, 5000);
    });
}

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    stayInVoice();

    // The 5-Minute Meow Loop
    setInterval(async () => {
        try {
            // 1. Text Meow
            const tChannel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
            if (tChannel) await tChannel.send("Meow!");

            // 2. Voice Meow
            const resource = createAudioResource(path.join(__dirname, 'meow.mp3'));
            player.play(resource);
        } catch (err) {
            console.log("Loop error:", err.message);
        }
    }, INTERVAL);
});

// Manual command to bring bot in if needed
client.on("messageCreate", (msg) => {
    if (msg.content === "!join") {
        stayInVoice();
        msg.reply("Meow! I'm here to stay 24/7.");
    }
});

client.login(process.env.TOKEN);
