const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();

// Web server for hosting/pinging
app.get("/", (req, res) => {
  res.send("Bot is running.");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

// Initialize Discord Client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  // --- AUTOMATED MESSAGE SETTINGS ---
  const CHANNEL_ID = '1488542254598721713'; 
  const FIVE_MINUTES = 5 * 60 * 1000; 

  console.log(`Timer started: Sending message to ${CHANNEL_ID} every 5 minutes.`);

  setInterval(async () => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      
      if (channel && channel.isTextBased()) {
        await channel.send("This is an automated message sent every five minutes.");
      }
    } catch (error) {
      console.error("Error sending automated message:", error.message);
    }
  }, FIVE_MINUTES);
  // ----------------------------------
});

// Log in using the TOKEN environment variable
client.login(process.env.TOKEN);
