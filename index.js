const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, StreamType 
} = require('@discordjs/voice');
const path = require('path');

const app = express();
app.get("/", (req, res) => res.send("Cat Bot is Live!"));
app.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// --- YOUR SETTINGS ---
const TEXT_CHANNEL_ID = '1488542254598721713'; 
const VOICE_CHANNEL_ID = '1488542254971748414'; 
const INTERVAL = 5 * 60 * 1000; 

const player = createAudioPlayer();

function playMeow() {
    try {
        // MATCHING YOUR FILE: Meow.mp3 (Capital M)
        const filePath = path.join(__dirname, 'Meow.mp3');
        
        const resource = createAudioResource(filePath, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary
        });

        resource.volume.setVolume(1.5); // Boosted for extra clarity
        player.play(resource);
        console.log("Playing Meow.mp3 now!");
    } catch (err) {
        console.error("Audio Error:", err.message);
    }
}

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

    connection.on(VoiceConnectionStatus.Disconnected, () => {
        setTimeout(stayInVoice, 5000);
    });
}

client.once("ready", () => {
    console.log(`Bot Online: ${client.user.tag}`);
    stayInVoice();

    setInterval(async () => {
        const channel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
        if (channel) channel.send("Meow!");
        playMeow();
    }, INTERVAL);
});

client.on("messageCreate", (msg) => {
    // Exact command you wanted
    if (msg.content === "/27 stay") {
        stayInVoice();
        playMeow();
        msg.reply("I am here and staying 24/7! Meow.");
    }
});

client.login(process.env.TOKEN);
