import { getVoiceConnection } from "@discordjs/voice";
import { GatewayIntentBits } from "discord-api-types/v10";
import { Interaction, Events, Client } from "discord.js";
import { deploy } from "./deploy";
import { interactionHandlers } from "./interactions";
// dotenv
import { config } from "dotenv";
config();

const token = process.env.TOKEN;
console.log(token);

const client = new Client({
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
  ],
});

client.on(Events.ClientReady, () => console.log("Ready!"));

client.on(Events.MessageCreate, async (message) => {
  //   if (!message.guild) return;

  const guild = client.guilds.cache.get(message.guildId!);
  if (!guild) return;
  if (!client.application?.owner) await client.application?.fetch();

  if (
    message.content.toLowerCase() === "!deploy" &&
    message.author.id === client.application?.owner?.id
  ) {
    console.log("Deploying");
    await deploy(guild);
    await message.reply("Deployed!");
  }
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isCommand() || !interaction.guildId) return;

  const handler = interactionHandlers.get(interaction.commandName);

  try {
    if (handler) {
      await handler(
        interaction,
        client,
        getVoiceConnection(interaction.guildId)
      );
    } else {
      await interaction.reply("Unknown command");
    }
  } catch (error) {
    console.warn(error);
  }
});

client.on(Events.Error, console.warn);

void client.login(token);
