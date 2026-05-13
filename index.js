const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, StreamType, entersState 
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

const app = express();
app.get("/", (req, res) => res.send("Bot is Ready"));
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

async function playMeow() {
    // We check both "Meow.mp3" and "meow.mp3" just in case
    const file1 = path.join(__dirname, 'Meow.mp3');
    const file2 = path.join(__dirname, 'meow.mp3');
    const filePath = fs.existsSync(file1) ? file1 : file2;

    if (!fs.existsSync(filePath)) {
        return console.log("ERROR: File not found on GitHub. Check your spelling!");
    }

    try {
        const resource = createAudioResource(filePath, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary
        });
        
        // Volume at 200% for testing
        resource.volume.setVolume(2.0); 
        player.play(resource);
        console.log("Audio sent to player.");
    } catch (err) {
        console.error("Playback error:", err.message);
    }
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
        await entersState(connection, VoiceConnectionStatus.Ready, 10000);
        connection.subscribe(player);
        // Force the "Green Circle" to appear
        connection.setSpeaking(true); 
    } catch (e) {
        console.error("Connection error:", e);
    }
}

client.once("ready", () => {
    console.log("Cat Bot is Online!");
    connect();
});

client.on("messageCreate", async (msg) => {
    if (msg.content === "/27 stay") {
        await connect();
        playMeow();
        msg.reply("I'm here! Check the green circle.");
    }
    if (msg.content === "/meow now") {
        playMeow();
        msg.reply("Meow! (Manual Trigger)");
    }
});

client.login(process.env.TOKEN);
