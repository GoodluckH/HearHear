const { GuildMember, VoiceState } = require('discord.js');
const {
	entersState,
	joinVoiceChannel,
	VoiceConnection,
	VoiceConnectionStatus,
} = require('@discordjs/voice');

async function join(voiceState, recordable, client, connection) {
	if (!connection) {
		if (
			voiceState.member instanceof GuildMember &&
			voiceState.member.voice.channel
		) {
			const channel = voiceState.member.voice.channel;
			// get the guild object
			const guild = client.guilds.cache.get(channel.guildId);

			connection = joinVoiceChannel({
				channelId: channel.id,
				guildId: channel.guildId,
				selfDeaf: false,
				selfMute: true,
				adapterCreator: channel.guild.voiceAdapterCreator,
			});
		} else {
			// await interaction.followUp(
			// 	'Join a voice channel and then try that again!',
			// );
			return;
		}
	}

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
		const receiver = connection.receiver;

		receiver.speaking.on('start', (userId) => {
			if (recordable.has(userId)) {
				console.log('start', userId);
				// createListeningStream(
				// 	receiver,
				// 	userId,
				// 	client.users.cache.get(userId),
				// );
			}
		});
	} catch (error) {
		console.warn(error);
		// await interaction.followUp(
		// 	'Failed to join voice channel within 20 seconds, please try again later!',
		// );
	}

	// await interaction.followUp('Ready!');
}

async function leave(voiceState, recordable, _client, connection) {
	if (connection) {
		connection.destroy();
		recordable.clear();
		// await interaction.reply({
		// 	ephemeral: true,
		// 	content: 'Left the channel!',
		// });
	} else {
		// await interaction.reply({
		// 	ephemeral: true,
		// 	content: 'Not playing in this server!',
		// });
	}
}

module.exports = {
	join,
	leave,
};
