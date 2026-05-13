const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus, 
    NoSubscriberBehavior 
} = require('@discordjs/voice');
const path = require('path');

const app = express();
app.get("/", (req, res) => res.send("Bot is running."));
app.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates, // REQUIRED for voice
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ]
});

// --- CONFIGURATION ---
const CHANNEL_ID = '1488542254598721713'; // Your text channel
const VOICE_ID = 'YOUR_VOICE_CHANNEL_ID'; // Replace with your Voice Channel ID
const MEOW_INTERVAL = 5 * 60 * 1000; 

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // 1. CHAT MEOW LOGIC
    const textChannel = await client.channels.fetch(CHANNEL_ID);
    if (textChannel?.isTextBased()) {
        textChannel.send("Meow! (I'm online and ready)");
        setInterval(() => textChannel.send("Meow!"), MEOW_INTERVAL);
    }

    // 2. VOICE MEOW & 24/7 LOGIC
    connectToVoice();
});

async function connectToVoice() {
    const guild = client.guilds.cache.first(); // Gets the first server the bot is in
    if (!guild) return;

    const connection = joinVoiceChannel({
        channelId: VOICE_ID,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false, // Set to false so it looks "active"
    });

    const player = createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Play }
    });

    // Function to play the meow sound
    const playMeow = () => {
        const resource = createAudioResource(path.join(__dirname, 'meow.mp3'));
        player.play(resource);
    };

    connection.subscribe(player);

    // Play meow in voice every 5 minutes
    setInterval(playMeow, MEOW_INTERVAL);

    // 24/7 Keep-Alive: Reconnect if disconnected
    connection.on('stateChange', (oldState, newState) => {
        if (newState.status === 'disconnected') {
            console.log("Disconnected from voice. Reconnecting...");
            setTimeout(connectToVoice, 5000);
        }
    });
}

client.login(process.env.TOKEN);
