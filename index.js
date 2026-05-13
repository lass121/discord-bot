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
app.get("/", (req, res) => res.send("Bot is alive!"));
app.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ]
});

// --- SETTINGS ---
const TEXT_CHANNEL_ID = '1488542254598721713'; 
// !!! DOUBLE CHECK THIS ID: It must be the Voice Channel, not the Text Channel.
const VOICE_CHANNEL_ID = '1488542254598721713'; 
const INTERVAL = 5 * 60 * 1000; 

const player = createAudioPlayer();

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);
    
    // Attempt to join voice
    maintainVoice();

    setInterval(async () => {
        try {
            // 1. Text Meow
            const channel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
            if (channel) await channel.send("Meow!");

            // 2. Voice Meow
            const resource = createAudioResource(path.join(__dirname, 'meow.mp3'));
            player.play(resource);
        } catch (e) {
            console.log("Loop error, but staying online:", e.message);
        }
    }, INTERVAL);
});

function maintainVoice() {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    try {
        const connection = joinVoiceChannel({
            channelId: VOICE_CHANNEL_ID,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false
        });

        connection.subscribe(player);

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            setTimeout(maintainVoice, 5000);
        });
    } catch (err) {
        console.log("Voice failed to start, but bot is still online.");
    }
}

client.login(process.env.TOKEN);
