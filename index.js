const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { join, leave, createListeningStream } = require('./actions.js');

require('dotenv').config();
const token = process.env.BOT_TOKEN;

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(
			`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
		);
	}
}

client.once(Events.ClientReady, (c) => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

let subscribed_channel_id = null;
const speakers = new Set();

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
	// get the current speaking users
	// if the user is not in the channel, remove them from the speakers
	// list

	if (subscribed_channel_id === null) {
		return;
	}

	if (
		client.channels.cache.get(subscribed_channel_id).members.size === 1 &&
		client.channels.cache
			.get(subscribed_channel_id)
			.members.has(client.user.id)
	) {
		await leave(
			newState,
			speakers,
			client,
			getVoiceConnection(oldState.guild.id),
		);
		return;
	}

	if (newState.channelId !== subscribed_channel_id) {
		return;
	}
	const connection = getVoiceConnection(newState.guild.id);
	if (!connection) {
		await join(newState, speakers, client, connection);
	} else if (
		!speakers.has(newState.member.user.id) &&
		newState.member.user.id !== client.user.id &&
		connection.receiver.speaking.users.has(ewState.member.user.id)
	) {
		console.log('hello');
		speakers.add(newState.member.user.id);

		receiver.speaking.on('start', (userId) => {
			createListeningStream(
				speakers,
				connection.receiver,
				userId,
				client.users.cache.get(userId),
			);
		});

		// try {
		// 	console.log('Joining voice channel');
		// 	await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
		// 	const receiver = connection.receiver;
		// 	receiver.speaking.on('start', (userId) => {
		// 		// see if the user is already being recorded
		// 		if (speakers.has(userId)) {
		// 			return;
		// 		}
		// 		speakers.add(userId);
		// 		console.log('start', userId);
		// 		createListeningStream(
		// 			receiver,
		// 			userId,
		// 			client.users.cache.get(userId),
		// 		);
		// 	});
		// 	receiver.speaking.on('end', (userId) => {
		// 		console.log('stop', userId);
		// 		speakers.delete(userId);
		// 	});
		// } catch (error) {
		// 	console.warn(error);
		// }
	}
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) {
		return;
	}
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(
			`No command matching ${interaction.commandName} was found.`,
		);
		return;
	}

	try {
		subscribed_channel_id = await command.execute(interaction);
		console.log(subscribed_channel_id);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	}
});

client.on(Events.ERROR, console.warn);

client.login(token);
