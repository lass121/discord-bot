const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus,
    AudioPlayerStatus,
    StreamType 
} = require('@discordjs/voice');
const ffmpeg = require('ffmpeg-static');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is Active"));
app.listen(PORT, "0.0.0.0");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TEXT_CHANNEL_ID = '1488542254598721713'; 
const VOICE_CHANNEL_ID = '1488542254971748414'; 

const player = createAudioPlayer();

// This version uses the absolute FFMPEG path provided by the 'ffmpeg-static' package
function playMeow(vol = 1.0) {
    try {
        const filePath = path.resolve(__dirname, 'meow.mp3');
        
        const resource = createAudioResource(filePath, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary,
        });

        resource.volume.setVolume(vol);
        player.play(resource);
        
        console.log("Audio resource created. FFMPEG Path:", ffmpeg);
    } catch (err) {
        console.error("CRITICAL AUDIO ERROR:", err.message);
    }
}

function connectToVoice() {
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
}

client.once("ready", () => {
    console.log(`Bot Online: ${client.user.tag}`);
    connectToVoice();

    // 5-Minute Loop
    setInterval(async () => {
        const channel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
        if (channel) channel.send("Meow!");
        playMeow();
    }, 5 * 60 * 1000);
});

client.on("messageCreate", async (msg) => {
    if (msg.content === "/27 stay") {
        connectToVoice();
        playMeow(1.0);
        msg.reply("I am here and I should be meowing now!");
    }
    
    if (msg.content === "/meow now") {
        playMeow(1.5); // Slightly boosted volume for testing
        msg.reply("Meow sent to voice!");
    }
});

// Error logging to find the silent killer
player.on('error', error => {
    console.error('Audio Player Error:', error.message, 'with resource', error.resource.metadata);
});

client.login(process.env.TOKEN);
