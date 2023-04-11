"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const v10_1 = require("discord-api-types/v10");
const discord_js_1 = require("discord.js");
const deploy_1 = require("./deploy");
const interactions_1 = require("./interactions");
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { token } = require('../config.json');
const client = new discord_js_1.Client({
    intents: [v10_1.GatewayIntentBits.GuildVoiceStates, v10_1.GatewayIntentBits.GuildMessages, v10_1.GatewayIntentBits.Guilds],
});
const { Events } = discord_js_1.Constants;
client.on(Events.CLIENT_READY, () => console.log('Ready!'));
client.on(Events.MESSAGE_CREATE, async (message) => {
    if (!message.guild)
        return;
    if (!client.application?.owner)
        await client.application?.fetch();
    if (message.content.toLowerCase() === '!deploy' && message.author.id === client.application?.owner?.id) {
        await (0, deploy_1.deploy)(message.guild);
        await message.reply('Deployed!');
    }
});
/**
 * The IDs of the users that can be recorded by the bot.
 */
const recordable = new Set();
client.on(Events.INTERACTION_CREATE, async (interaction) => {
    if (!interaction.isCommand() || !interaction.guildId)
        return;
    const handler = interactions_1.interactionHandlers.get(interaction.commandName);
    try {
        if (handler) {
            await handler(interaction, recordable, client, (0, voice_1.getVoiceConnection)(interaction.guildId));
        }
        else {
            await interaction.reply('Unknown command');
        }
    }
    catch (error) {
        console.warn(error);
    }
});
client.on(Events.ERROR, console.warn);
void client.login(token);
//# sourceMappingURL=bot.js.map