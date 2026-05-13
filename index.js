const express = require("express");
const { Client, GatewayIntentBits, Events } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, StreamType, entersState, AudioPlayerStatus 
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

const app = express();
app.get("/", (req, res) => res.send("Bot is Alive"));
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
const player = createAudioPlayer();

function playMeow() {
    const filePath = path.resolve(__dirname, 'Meow.mp3');
    
    if (!fs.existsSync(filePath)) {
        console.log("❌ FILE NOT FOUND: Check GitHub for Meow.mp3");
        return;
    }

    // This is the bypass: It tells Discord to treat the file as a raw stream
    const resource = createAudioResource(fs.createReadStream(filePath), {
        inlineVolume: true,
        inputType: StreamType.Arbitrary 
    });
    
    resource.volume.setVolume(2.0); 
    player.play(resource);
    console.log("🔊 Meow stream sent to voice channel.");
}

async function connect() {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const connection = joinVoiceChannel({
        channelId: VOICE_ID,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMuted: false
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        connection.subscribe(player);
        connection.setSpeaking(true); // Force the green ring
        playMeow();
    } catch (e) {
        console.error("Connection failed:", e);
    }
}

// Fixed the Deprecation Warning by using Events.ClientReady
client.once(Events.ClientReady, () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    connect();
    setInterval(playMeow, 300000);
});

client.on("messageCreate", (msg) => {
    if (msg.content === "/meow now") {
        playMeow();
        msg.reply("Forcing meow stream...");
    }
    if (msg.content === "/27 stay") {
        connect();
        msg.reply("Reconnecting to voice...");
    }
});

client.login(process.env.TOKEN);
