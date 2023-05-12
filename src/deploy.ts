import { type Guild } from "discord.js";
import { REST, Routes } from "discord.js";
import { config } from "dotenv";
config();

const clientId = process.env.CLIENT_ID;
const token = process.env.TOKEN;
const rest = new REST().setToken(token!);

export const deleteAllCommands = async () => {
  rest
    .put(Routes.applicationCommands(clientId!), { body: [] })
    .then(() => console.log("Successfully deleted all application commands."))
    .catch(console.error);
};

export const deploy = async (guild: Guild) => {
  await guild.commands.set([
    {
      name: "start",
      description:
        "The bot will the voice channel that you are in and starts recording",
    },
    {
      name: "end",
      description: "The bot will stop recording and leave the voice channel",
    },
  ]);
};
