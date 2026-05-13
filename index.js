const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus 
} = require('@discordjs/voice');
const path = require('path');

const app = express();
app.get("/", (req, res) => res.send("Bot is active on Railway!"));
app.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TEXT_CHANNEL_ID = '1488542254598721713'; 
const VOICE_CHANNEL_ID = 'PASTE_YOUR_VOICE_ID_HERE'; // <--- RIGHT CLICK VOICE CHANNEL & COPY ID
const INTERVAL = 5 * 60 * 1000; 

const player = createAudioPlayer();

function connectVoice() {
    const guild = client.guilds.cache.first();
    if (!guild || !VOICE_CHANNEL_ID || VOICE_CHANNEL_ID.includes('PASTE')) return;

    const connection = joinVoiceChannel({
        channelId: VOICE_CHANNEL_ID,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false
    });

    connection.subscribe(player);

    connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.log("Disconnected. Reconnecting...");
        setTimeout(connectVoice, 5000);
    });
}

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    connectVoice();

    setInterval(async () => {
        try {
            // Text Meow
            const channel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
            if (channel) await channel.send("Meow!");

            // Voice Meow
            const resource = createAudioResource(path.join(__dirname, 'meow.mp3'));
            player.play(resource);
        } catch (e) {
            console.log("Interval error:", e.message);
        }
    }, INTERVAL);
});

client.on("messageCreate", (msg) => {
    if (msg.content === "!join") {
        connectVoice();
        msg.reply("Meow! I'm staying in the voice channel now.");
    }
});

client.login(process.env.TOKEN);
