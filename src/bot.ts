import { getVoiceConnection } from "@discordjs/voice";
import { GatewayIntentBits } from "discord-api-types/v10";
import { Interaction, Constants, Client } from "discord.js";
import { deploy } from "./deploy";
import { interactionHandlers } from "./interactions";

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { token } = require("../config.json") as { token: string };

const client = new Client({
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
  ],
});

const { Events } = Constants;

client.on(Events.CLIENT_READY, () => console.log("Ready!"));

client.on(Events.MESSAGE_CREATE, async (message) => {
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

client.on(Events.INTERACTION_CREATE, async (interaction: Interaction) => {
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

client.on(Events.ERROR, console.warn);

void client.login(token);
