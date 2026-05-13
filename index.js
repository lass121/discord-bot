const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, StreamType, entersState, AudioPlayerStatus 
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

const app = express();
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
    const filePath = path.join(process.cwd(), 'Meow.mp3');
    
    if (!fs.existsSync(filePath)) {
        console.log("❌ FILE NOT FOUND on server!");
        return;
    }

    // BYPASS: We force FFmpeg to re-read the file properly
    const resource = createAudioResource(filePath, {
        inputType: StreamType.Arbitrary, // This lets FFmpeg handle weird MP3s
        inlineVolume: true
    });
    
    resource.volume.setVolume(2.0); 
    player.play(resource);
    console.log("🔊 Playback command sent.");
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
        await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
        connection.subscribe(player);
        connection.setSpeaking(true);
        playMeow();
    } catch (e) {
        console.error("Connection failed.");
    }
}

client.once("ready", () => {
    console.log("Bot Ready.");
    connect();
});

client.on("messageCreate", (msg) => {
    if (msg.content === "/meow now") {
        playMeow();
        msg.reply("Meowing...");
    }
});

// If the player errors, we log it exactly
player.on('error', error => {
  console.error(`Error: ${error.message}`);
});

client.login(process.env.TOKEN);
