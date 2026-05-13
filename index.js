const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus, 
    StreamType 
} = require('@discordjs/voice');
const path = require('path');

const app = express();
app.get("/", (req, res) => res.send("Bot Online"));
app.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const VOICE_ID = '1488542254971748414'; 
const TEXT_ID = '1488542254598721713';
const player = createAudioPlayer();

function playMeow() {
    try {
        const filePath = path.resolve(__dirname, 'meow.mp3');
        const resource = createAudioResource(filePath, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary
        });
        
        // Boosting volume to 2.0 (200%) to ensure it's heard
        resource.volume.setVolume(2.0); 
        player.play(resource);
        console.log("Meow triggered.");
    } catch (e) {
        console.error("Audio error:", e.message);
    }
}

function connect() {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const connection = joinVoiceChannel({
        channelId: VOICE_ID,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMuted: false
    });

    connection.subscribe(player);
}

client.once("ready", () => {
    console.log("Bot is ready!");
    connect();

    // 5-minute loop
    setInterval(async () => {
        const channel = await client.channels.fetch(TEXT_ID).catch(() => null);
        if (channel) channel.send("Meow!");
        playMeow();
    }, 300000);
});

client.on("messageCreate", (msg) => {
    if (msg.content === "/27 stay") {
        connect();
        playMeow();
        msg.reply("I'm staying 24/7! Meow.");
    }
    if (msg.content === "/meow now") {
        playMeow();
    }
});

client.login(process.env.TOKEN);
