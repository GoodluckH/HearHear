import {
  // entersState,
  joinVoiceChannel,
  VoiceConnection,
  // VoiceConnectionStatus,
} from "@discordjs/voice";
import { Client, CommandInteraction, GuildMember } from "discord.js";
import { createListeningStream } from "./createListeningStream";

async function start(
  interaction: CommandInteraction,
  client: Client,
  connection?: VoiceConnection
) {
  await interaction.deferReply();
  if (!connection) {
    if (
      interaction.member instanceof GuildMember &&
      interaction.member.voice.channel
    ) {
      const channel = interaction.member.voice.channel;
      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        selfDeaf: false,
        selfMute: true,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
    } else {
      await interaction.followUp(
        "Join a voice channel and then try that again!"
      );
      return;
    }
  }

  try {
    // await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
    const receiver = connection.receiver;

    receiver.speaking.on("start", (userId) => {
      console.log("start", userId);
      createListeningStream(receiver, userId, client.users.cache.get(userId));
    });
  } catch (error) {
    console.warn(error);
    await interaction.followUp(
      "Failed to join voice channel within 20 seconds, please try again later!"
    );
  }

  await interaction.followUp("Ready!");
}

async function leave(
  interaction: CommandInteraction,
  _client: Client,
  connection?: VoiceConnection
) {
  if (connection) {
    connection.receiver.subscriptions.forEach((subscription) => {
      subscription.emit("end");
    });
    connection.destroy();

    await interaction.reply({
      ephemeral: true,
      content: "Uploading the audio files to S3 buckets",
    });

    await interaction.reply({ ephemeral: true, content: "Left the channel!" });
  } else {
    await interaction.reply({
      ephemeral: true,
      content: "Not playing in this server!",
    });
  }
}

export const interactionHandlers = new Map<
  string,
  (
    interaction: CommandInteraction,
    client: Client,
    connection?: VoiceConnection
  ) => Promise<void>
>();
interactionHandlers.set("start", start);
interactionHandlers.set("leave", leave);
