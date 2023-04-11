const { GuildMember, VoiceState } = require('discord.js');
const {
	entersState,
	joinVoiceChannel,
	VoiceConnection,
	VoiceConnectionStatus,
} = require('@discordjs/voice');
const { createWriteStream } = require('node:fs');
const { pipeline } = require('node:stream');
const { EndBehaviorType, VoiceReceiver } = require('@discordjs/voice');
const prism = require('prism-media');

async function join(voiceState, speakers, client, connection) {
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
			return;
		}
	}

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
}

async function leave(voiceState, speakers, _client, connection) {
	if (connection) {
		connection.destroy();
		speakers.clear();
	}
}

function getDisplayName(userId, user) {
	return user ? `${user.username}_${user.discriminator}` : userId;
}

function createListeningStream(speakers, receiver, userId, user) {
	const opusStream = receiver.subscribe(userId, {
		end: {
			behavior: EndBehaviorType.AfterSilence,
			duration: 1000,
		},
	});

	const decoder = new prism.opus.Decoder({
		frameSize: 960,
		channels: 2,
		rate: 48000,
	});

	const filename = `./recordings/${Date.now()}-${getDisplayName(
		userId,
		user,
	)}.pcm`;

	const out = createWriteStream(filename);
	// save the stream to a file so we can play it back later

	console.log(`👂 Started recording ${filename}`);

	pipeline(opusStream, decoder, out, (err) => {
		if (err) {
			console.warn(
				`❌ Error recording file ${filename} - ${err.message}`,
			);
		} else {
			console.log(`✅ Recorded ${filename}`);
		}
	});
	speakers.delete(userId);
}

module.exports = {
	join,
	leave,
	createListeningStream,
};
