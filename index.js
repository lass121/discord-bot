const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();

app.get("/", (req, res) => {
  res.send("Bot is running.");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  // --- AUTOMATED MESSAGE LOGIC ---
  const CHANNEL_ID = 'YOUR_CHANNEL_ID_HERE'; // Replace this with your Channel ID
  const FIVE_MINUTES = 5 * 60 * 1000; 

  setInterval(async () => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (channel) {
        channel.send("This is an automated message sent every five minutes.");
      }
    } catch (error) {
      console.error("Could not send automated message:", error);
    }
  }, FIVE_MINUTES);
  // -------------------------------
});

client.login(process.env.TOKEN);
