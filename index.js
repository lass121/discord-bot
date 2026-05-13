const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus,
    AudioPlayerStatus,
    NoSubscriberBehavior
} = require('@discordjs/voice');
const path = require('path');

// 1. Keep-Alive Server
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is active!"));
app.listen(PORT, "0.0.0.0");

// 2. Bot Setup
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
const INTERVAL = 5 * 60 * 1000; 

const player = createAudioPlayer({
    behaviors: { noSubscriber: NoSubscriberBehavior.Play }
});

function playMeow() {
    try {
        const filePath = path.join(__dirname, 'meow.mp3');
        const resource = createAudioResource(filePath, { inlineVolume: true });
        resource.volume.setVolume(1.0); 
        player.play(resource);
        console.log("Playing meow sound...");
    } catch (err) {
        console.error("Playback Error:", err.message);
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
    console.log(`Logged in as ${client.user.tag}`);
    stayInVoice();

    setInterval(async () => {
        const channel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
        if (channel) channel.send("Meow!");
        playMeow();
    }, INTERVAL);
});

client.on("messageCreate", (msg) => {
    if (msg.content === "!meow") {
        playMeow();
        msg.reply("Meow!");
    }
    if (msg.content === "!join") {
        stayInVoice();
        msg.reply("Rejoined voice!");
    }
});

client.login(process.env.TOKEN);
