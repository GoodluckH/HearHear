const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('record')
		.setDescription('start recording a channel'),
	async execute(interaction) {
		await interaction.reply('Started recording channel');
	},
};
