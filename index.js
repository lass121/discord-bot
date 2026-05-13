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

// 1. Setup Express (Required for Railway Health Checks)
const app = express();
app.get("/", (req, res) => res.send("Meow Bot is running 24/7!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

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
const INTERVAL = 5 * 60 * 1000; // 5 minutes

const player = createAudioPlayer();

// 3. Reliable Voice Connection Function
function stayInVoice() {
    try {
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

        // Auto-Reconnect if kicked or disconnected
        connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log("Disconnected from voice. Rejoining in 5s...");
            setTimeout(stayInVoice, 5000);
        });
        
        console.log("Joined Voice Channel successfully.");
    } catch (err) {
        console.error("Voice Connection Error:", err.message);
    }
}

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    
    // Initial Join
    stayInVoice();

    // 4. The 5-Minute Meow Loop
    setInterval(async () => {
        try {
            // Text Meow
            const channel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
            if (channel && channel.isTextBased()) {
                await channel.send("Meow!");
            }

            // Voice Meow (Plays the meow.mp3 file)
            const resource = createAudioResource(path.join(__dirname, 'meow.mp3'));
            player.play(resource);
            console.log("Meowed in chat and voice.");
        } catch (error) {
            console.error("Interval Error (Bot staying online):", error.message);
        }
    }, INTERVAL);
});

// Manual Command: !join
client.on("messageCreate", (message) => {
    if (message.content === "!join") {
        stayInVoice();
        message.reply("Meow! I'm back in the voice channel.");
    }
});

// 5. Global Error Handler (Crucial for 24/7 stability)
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(process.env.TOKEN);
