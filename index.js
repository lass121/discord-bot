const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, StreamType, entersState 
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
const TEXT_ID = '1488542254598721713'; 
const player = createAudioPlayer();

async function playMeow() {
    const filePath = path.join(__dirname, 'Meow.mp3'); // Matches your capital 'M'
    
    if (!fs.existsSync(filePath)) {
        console.log("FILE MISSING: Ensure Meow.mp3 is uploaded to GitHub!");
        return;
    }

    try {
        const resource = createAudioResource(filePath, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary
        });
        
        // Setting volume to 200% to make sure you hear it
        resource.volume.setVolume(2.0); 
        player.play(resource);
        console.log("Meow audio sent to Discord.");
    } catch (err) {
        console.error("Audio Error:", err.message);
    }
}

async function connectAndStay() {
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
        // Force Discord to show the green "speaking" ring
        connection.setSpeaking(true); 
    } catch (e) {
        console.error("Voice connection failed:", e);
    }
}

client.once("ready", () => {
    console.log("Bot is Online and Ready!");
    connectAndStay();

    // Meow loop every 5 minutes
    setInterval(() => {
        client.channels.fetch(TEXT_ID).then(c => c.send("Meow!")).catch(() => null);
        playMeow();
    }, 300000);
});

client.on("messageCreate", async (msg) => {
    if (msg.content === "/27 stay") {
        await connectAndStay();
        playMeow();
        msg.reply("I'm here! If you don't hear me, check if I'm Server Muted.");
    }
});

client.login(process.env.TOKEN);
