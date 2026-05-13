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
app.get("/", (req, res) => res.send("Bot is online 24/7"));
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
const VOICE_CHANNEL_ID = 'PASTE_ACTUAL_VOICE_ID_HERE'; // <--- YOU MUST CHANGE THIS
const INTERVAL = 5 * 60 * 1000; 

const player = createAudioPlayer();

// Function to keep the bot in voice
function stayInVoice() {
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

    // If kicked, reconnect after 5 seconds
    connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.log("Attempting to reconnect to stay 24/7...");
        setTimeout(stayInVoice, 5000);
    });
}

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    stayInVoice(); // Join automatically on startup

    // 5-Minute Meow Loop (Chat and Voice)
    setInterval(async () => {
        try {
            const channel = await client.channels.fetch(TEXT_CHANNEL_ID);
            if (channel) await channel.send("Meow!");

            const resource = createAudioResource(path.join(__dirname, 'meow.mp3'));
            player.play(resource);
        } catch (e) {
            console.log("Error in meow loop:", e.message);
        }
    }, INTERVAL);
});

// Command to manually force join: !join
client.on("messageCreate", (message) => {
    if (message.content === "!join") {
        stayInVoice();
        message.reply("I'm here to stay! Meow.");
    }
});

client.login(process.env.TOKEN);
