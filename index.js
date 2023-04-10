const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { join, leave } = require('./actions.js');

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

const recordable = new Set();
let subscribed_channel_id = null;

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
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
			recordable,
			client,
			getVoiceConnection(oldState.guild.id),
		);
		return;
	}

	if (
		oldState.channelId === newState.channelId ||
		newState.channelId !== subscribed_channel_id
	) {
		return;
	}

	await join(
		newState,
		recordable,
		client,
		getVoiceConnection(newState.guild.id),
	);
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
