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

// 1. Web Server to prevent Railway from idling
const app = express();
app.get("/", (req, res) => res.send("Bot is stable and online!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Web server active on port ${PORT}`));

// 2. Bot Setup with necessary Permissions
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

// 3. Reliable Voice Connection Logic
function stayInVoice() {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) return console.log("Waiting for guild cache...");

        const connection = joinVoiceChannel({
            channelId: VOICE_CHANNEL_ID,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false
        });

        connection.subscribe(player);

        // Auto-Reconnect if disconnected or kicked
        connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log("Detected disconnection. Reconnecting in 5s...");
            setTimeout(stayInVoice, 5000);
        });

        console.log("Voice connection established.");
    } catch (error) {
        console.error("Voice Error (Bot staying online):", error.message);
    }
}

client.once("ready", () => {
    console.log(`Successfully logged in as ${client.user.tag}`);
    stayInVoice();

    // 4. The 5-Minute Loop (Protected from crashes)
    setInterval(async () => {
        try {
            // Text Meow
            const tChannel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
            if (tChannel) await tChannel.send("Meow!");

            // Voice Meow
            const filePath = path.join(__dirname, 'meow.mp3');
            const resource = createAudioResource(filePath);
            player.play(resource);
            console.log("Meow interval triggered successfully.");
        } catch (err) {
            console.error("Interval loop recovered from error:", err.message);
        }
    }, INTERVAL);
});

// Manual Fix Command: !join
client.on("messageCreate", (msg) => {
    if (msg.content === "!join") {
        stayInVoice();
        msg.reply("Meow! Re-joined and locked in.");
    }
});

// 5. Global Error Handling (Prevents the bot from crashing on any random error)
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(process.env.TOKEN);
