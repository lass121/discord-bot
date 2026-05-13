const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus 
} = require('@discordjs/voice');
const path = require('path');

// 1. Health Check Server for Railway
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is active."));
app.listen(PORT, "0.0.0.0", () => console.log(`Railway Health Check on port ${PORT}`));

// 2. Bot Setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// --- IDs ---
const TEXT_CHANNEL_ID = '1488542254598721713'; 
const VOICE_CHANNEL_ID = '1488542254971748414'; 
const INTERVAL = 5 * 60 * 1000; 

const player = createAudioPlayer();

function stayInVoice() {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    try {
        const connection = joinVoiceChannel({
            channelId: VOICE_CHANNEL_ID,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false
        });

        connection.subscribe(player);

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log("Reconnecting to Voice...");
            setTimeout(stayInVoice, 5000);
        });
    } catch (err) {
        console.log("Voice Join Error (Ignored to stay online):", err.message);
    }
}

client.once("ready", () => {
    console.log(`Bot logged in: ${client.user.tag}`);
    stayInVoice();

    setInterval(async () => {
        try {
            const channel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
            if (channel) await channel.send("Meow!");

            const resource = createAudioResource(path.join(__dirname, 'meow.mp3'));
            player.play(resource);
        } catch (e) {
            console.log("Meow Loop Error:", e.message);
        }
    }, INTERVAL);
});

client.on("messageCreate", (msg) => {
    if (msg.content === "!join") {
        stayInVoice();
        msg.reply("Meow! Joined.");
    }
});

// 3. Prevent crashing from minor Discord/Node errors
process.on('uncaughtException', (err) => console.log("Caught Exception:", err));
process.on('unhandledRejection', (reason) => console.log("Caught Rejection:", reason));

client.login(process.env.TOKEN);
