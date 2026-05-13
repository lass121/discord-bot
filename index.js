const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    VoiceConnectionStatus,
    StreamType 
} = require('@discordjs/voice');
const path = require('path');

const app = express();
app.get("/", (req, res) => res.send("Bot is 24/7 Active"));
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
const VOICE_CHANNEL_ID = '1488542254971748414'; 
const INTERVAL = 5 * 60 * 1000; 

const player = createAudioPlayer();
let currentVolume = 1.0; // Default 100%

function playMeow(vol = currentVolume) {
    try {
        const resource = createAudioResource(path.join(__dirname, 'meow.mp3'), {
            inlineVolume: true,
            inputType: StreamType.Arbitrary
        });
        resource.volume.setVolume(vol);
        player.play(resource);
    } catch (err) {
        console.error("Playback error:", err.message);
    }
}

function connectAndStay() {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const connection = joinVoiceChannel({
        channelId: VOICE_CHANNEL_ID,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMuted: false
    });

    connection.subscribe(player);

    connection.on(VoiceConnectionStatus.Disconnected, () => {
        setTimeout(connectAndStay, 5000);
    });
}

client.once("ready", () => {
    console.log(`Bot is ready: ${client.user.tag}`);
    connectAndStay();

    setInterval(async () => {
        const channel = await client.channels.fetch(TEXT_CHANNEL_ID).catch(() => null);
        if (channel) channel.send("Meow!");
        playMeow();
    }, INTERVAL);
});

client.on("messageCreate", async (msg) => {
    // 1. Your Main Command
    if (msg.content === "/27 stay") {
        connectAndStay();
        playMeow();
        return msg.reply("Confirmed. I am locked in this voice channel 24/7. Meow!");
    }

    // 2. Manual Meow Command
    if (msg.content === "/meow now") {
        playMeow();
        return msg.reply("Meow! (Manual Trigger)");
    }

    // 3. Volume Boost Command (Sets volume to 200%)
    if (msg.content === "/meow loud") {
        currentVolume = 2.0;
        playMeow(2.0);
        return msg.reply("Volume boosted to 200%. Meow!");
    }

    // 4. Volume Reset Command
    if (msg.content === "/meow soft") {
        currentVolume = 1.0;
        playMeow(1.0);
        return msg.reply("Volume reset to 100%. Meow.");
    }
});

client.login(process.env.TOKEN);
