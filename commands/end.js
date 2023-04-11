const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('end')
		.setDescription('end recording a channel'),
	async execute(interaction) {
		await interaction.reply('Ended recording channel');
	},
};
