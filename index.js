const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, StreamType, entersState 
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

const app = express();
app.get("/", (req, res) => res.send("Cat is ready!"));
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
    const filePath = path.join(__dirname, 'Meow.mp3');
    
    if (!fs.existsSync(filePath)) {
        return console.log("FILE ERROR: Meow.mp3 is missing from GitHub!");
    }

    try {
        const resource = createAudioResource(filePath, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary
        });
        
        resource.volume.setVolume(1.8); 
        player.play(resource);
        console.log("Meow signal sent to voice.");
    } catch (err) {
        console.error("Audio Error:", err.message);
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
        await entersState(connection, VoiceConnectionStatus.Ready, 20000);
        connection.subscribe(player);
        // This makes the bot "active" so the green circle appears
        connection.setSpeaking(true); 
        console.log("Voice connection ready!");
    } catch (e) {
        console.error("Connection failed:", e);
    }
}

client.once("ready", () => {
    console.log("Bot is Online!");
    connectToVoice();

    setInterval(() => {
        client.channels.fetch(TEXT_ID).then(c => c.send("Meow!")).catch(() => null);
        playMeow();
    }, 300000);
});

client.on("messageCreate", async (msg) => {
    if (msg.content === "/27 stay") {
        await connectToVoice();
        playMeow();
        msg.reply("I'm in! If you can't hear me, check if I'm Server Muted.");
    }
});

client.login(process.env.TOKEN);
