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

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const CHANNEL_ID = '1488542254598721713'; 
  const FIVE_MINUTES = 5 * 60 * 1000; 

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel && channel.isTextBased()) {
      // Sends the first meow immediately on startup
      await channel.send("Meow!"); 

      // Then starts the 5-minute loop
      setInterval(async () => {
        await channel.send("Meow!");
      }, FIVE_MINUTES);
      
      console.log("Meow timer started!");
    }
  } catch (error) {
    console.error("Error starting the meow loop:", error.message);
  }
});

client.login(process.env.TOKEN);
