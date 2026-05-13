const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus 
} = require('@discordjs/voice');
const path = require('path');

// 1. Web Server (Railway looks for this to keep the bot alive)
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is stable."));
app.listen(PORT, "0.0.0.0", () => console.log(`Health check listening on port ${PORT}`));

// 2. Bot Setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// --- CONFIGURATION ---
const TEXT_CHANNEL_ID = '1488542254598721713'; 
const VOICE_CHANNEL_ID = '1488542254971748414'; 
const INTERVAL = 5 * 60 * 1000; 

const player = createAudioPlayer();

function stayInVoice() {
    try {
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
            console.log("Voice disconnected, retrying...");
            setTimeout(stayInVoice, 5000);
        });
    } catch (err) {
        console.error("Voice connection failed:", err.message);
    }
}

client.once("ready", () => {
    console.log(`>>> Bot is ONLINE as ${client.user.tag}`);
    stayInVoice();

    // 5-Minute Loop
    setInterval(async () => {
        try {
            // Text Meow
            const channel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
            if (channel) await channel.send("Meow!");

            // Voice Meow
            const resource = createAudioResource(path.join(__dirname, 'meow.mp3'));
            player.play(resource);
            console.log("Periodic meow triggered.");
        } catch (e) {
            console.log("Loop error caught:", e.message);
        }
    }, INTERVAL);
});

// Manual command to fix things
client.on("messageCreate", (msg) => {
    if (msg.content === "!join") {
        stayInVoice();
        msg.reply("Meow! Joining voice now.");
    }
});

// Safety net for Railway
process.on('unhandledRejection', error => {
    console.error('Non-crashing error:', error);
});

client.login(process.env.TOKEN);
