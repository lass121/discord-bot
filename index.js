const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, StreamType, entersState, AudioPlayerStatus 
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

const app = express();
app.get("/", (req, res) => res.send("Bot is Active"));
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

// Log player status to see where it stops
player.on('stateChange', (oldState, newState) => {
    console.log(`Audio Player: ${oldState.status} -> ${newState.status}`);
});

async function playMeow() {
    // Check for the file with a capital M as seen in your upload
    const filePath = path.join(__dirname, 'Meow.mp3');
    
    if (!fs.existsSync(filePath)) {
        console.log("❌ ERROR: Meow.mp3 NOT FOUND. Ensure file is in the main folder.");
        return;
    }

    try {
        const resource = createAudioResource(filePath, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary
        });
        
        resource.volume.setVolume(2.0); // 200% volume
        player.play(resource);
        console.log("✅ Meow resource sent to player.");
    } catch (err) {
        console.error("❌ Audio Error:", err.message);
    }
}

async function connectToVoice() {
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
        await entersState(connection, VoiceConnectionStatus.Ready, 15000);
        connection.subscribe(player);
        // Force the "Green Circle" indicator
        connection.setSpeaking(true); 
        console.log("🔊 Connection Ready and Speaking enabled.");
    } catch (e) {
        console.error("❌ Connection failed:", e);
    }
}

client.once("ready", () => {
    console.log(`Bot logged in as ${client.user.tag}`);
    connectToVoice();
});

client.on("messageCreate", async (msg) => {
    if (msg.content === "/27 stay") {
        await connectToVoice();
        playMeow();
        msg.reply("I'm here! Check if you see a green circle around me.");
    }
    if (msg.content === "/meow now") {
        playMeow();
        msg.reply("Meow! (Manual Trigger)");
    }
});

client.login(process.env.TOKEN);
