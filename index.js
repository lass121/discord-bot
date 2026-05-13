const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    StreamType
} = require('@discordjs/voice');
const path = require('path');

const app = express();
app.get("/", (req, res) => res.send("Meow Bot is 24/7 and Loud!"));
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

const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
    },
});

function playMeow() {
    try {
        const filePath = path.join(__dirname, 'meow.mp3');
        
        // Create the resource with high-quality settings
        const resource = createAudioResource(filePath, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary
        });

        // Set volume to 100% (1.0)
        // If the file is still too quiet, you can try 1.5 or 2.0, 
        // but 1.0 is the "perfect" soft/clear setting.
        resource.volume.setVolume(1.0); 

        player.play(resource);
        console.log("Meow audio pushed to player.");
    } catch (err) {
        console.error("Audio Error:", err.message);
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

    connection.on(VoiceConnectionStatus.Disconnected, () => {
        setTimeout(connectToVoice, 5000);
    });
}

client.once("ready", () => {
    console.log(`Bot Online: ${client.user.tag}`);
    connectToVoice();

    setInterval(async () => {
        // 1. Text Meow
        const channel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
        if (channel) channel.send("Meow!");

        // 2. Voice Meow
        playMeow();
    }, INTERVAL);
});

client.on("messageCreate", (msg) => {
    // Your command
    if (msg.content === "/27 stay") {
        connectToVoice();
        msg.reply("Locked in 24/7. Hearing check initiated! Meow.");
        playMeow(); // Play immediately to test
    }
});

client.login(process.env.TOKEN);
