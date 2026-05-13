const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, createAudioPlayer, createAudioResource, 
    VoiceConnectionStatus, AudioPlayerStatus, StreamType, entersState 
} = require('@discordjs/voice');
const path = require('path');

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
const TEXT_ID = '1488542254598721713';
const player = createAudioPlayer();

async function playMeow() {
    try {
        const resource = createAudioResource(path.join(__dirname, 'meow.mp3'), {
            inlineVolume: true,
            inputType: StreamType.Arbitrary
        });
        resource.volume.setVolume(1.0);
        player.play(resource);
        console.log("Audio playing...");
    } catch (e) { console.log("Audio Error:", e.message); }
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
        await entersState(connection, VoiceConnectionStatus.Ready, 20000);
        connection.subscribe(player);
        // This 'setSpeaking' is required for the green circle to appear
        connection.setSpeaking(true);
    } catch (e) { console.log("Connection failed"); }
}

client.once("ready", () => {
    connect();
    setInterval(() => {
        client.channels.fetch(TEXT_ID).then(c => c.send("Meow!"));
        playMeow();
    }, 300000);
});

client.on("messageCreate", async (msg) => {
    if (msg.content === "/27 stay") {
        await connect();
        playMeow();
        msg.reply("I am locked in. Meow!");
    }
});

client.login(process.env.TOKEN);
