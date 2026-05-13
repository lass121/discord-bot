const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, StreamType, entersState 
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
    // Force path resolution for Meow.mp3
    const filePath = path.join(process.cwd(), 'Meow.mp3');
    
    if (!fs.existsSync(filePath)) {
        console.log("!!! FILE MISSING: Meow.mp3 must be in the main folder !!!");
        return;
    }

    const resource = createAudioResource(filePath, {
        inlineVolume: true,
        inputType: StreamType.Arbitrary
    });
    
    resource.volume.setVolume(2.0); 
    player.play(resource);
    console.log("Audio stream pushed to Discord.");
}

async function forceConnect() {
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
        
        // This is the bypass: It tells Discord we are ALREADY speaking
        connection.setSpeaking(true);
        
        playMeow();
        console.log("Bypass Successful: Bot is now meowing.");
    } catch (e) {
        console.error("Connection failed.");
    }
}

client.once("ready", () => {
    console.log("Bot Bypassed and Ready.");
    forceConnect();
    // Auto-repeat every 5 minutes
    setInterval(playMeow, 300000);
});

client.on("messageCreate", (msg) => {
    if (msg.content === "/meow now") {
        playMeow();
        msg.reply("Forcing Meow...");
    }
});

client.login(process.env.TOKEN);
