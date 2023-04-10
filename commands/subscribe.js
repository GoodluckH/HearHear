const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('subscribe')
		.setDescription('Subscribe to a channel by channel ID.')
		.addStringOption((option) =>
			option
				.setName('channel_id')
				.setDescription('The channel to subscribe to')
				.setRequired(true),
		),
	async execute(interaction) {
		await interaction.reply(
			'The channel has been subscribed to is ' +
				interaction.options.getString('channel_id'),
		);
		return interaction.options.getString('channel_id');
	},
};
