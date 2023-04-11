"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactionHandlers = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const createListeningStream_1 = require("./createListeningStream");
async function join(interaction, recordable, client, connection) {
    await interaction.deferReply();
    if (!connection) {
        if (interaction.member instanceof discord_js_1.GuildMember && interaction.member.voice.channel) {
            const channel = interaction.member.voice.channel;
            connection = (0, voice_1.joinVoiceChannel)({
                channelId: channel.id,
                guildId: channel.guild.id,
                selfDeaf: false,
                selfMute: true,
                // @ts-expect-error Currently voice is built in mind with API v10 whereas discord.js v13 uses API v9.
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
        }
        else {
            await interaction.followUp('Join a voice channel and then try that again!');
            return;
        }
    }
    try {
        await (0, voice_1.entersState)(connection, voice_1.VoiceConnectionStatus.Ready, 20e3);
        const receiver = connection.receiver;
        receiver.speaking.on('start', (userId) => {
            if (recordable.has(userId)) {
                (0, createListeningStream_1.createListeningStream)(receiver, userId, client.users.cache.get(userId));
            }
        });
    }
    catch (error) {
        console.warn(error);
        await interaction.followUp('Failed to join voice channel within 20 seconds, please try again later!');
    }
    await interaction.followUp('Ready!');
}
async function record(interaction, recordable, client, connection) {
    if (connection) {
        const userId = interaction.options.get('speaker').value;
        recordable.add(userId);
        const receiver = connection.receiver;
        if (connection.receiver.speaking.users.has(userId)) {
            (0, createListeningStream_1.createListeningStream)(receiver, userId, client.users.cache.get(userId));
        }
        await interaction.reply({ ephemeral: true, content: 'Listening!' });
    }
    else {
        await interaction.reply({ ephemeral: true, content: 'Join a voice channel and then try that again!' });
    }
}
async function leave(interaction, recordable, _client, connection) {
    if (connection) {
        connection.destroy();
        recordable.clear();
        await interaction.reply({ ephemeral: true, content: 'Left the channel!' });
    }
    else {
        await interaction.reply({ ephemeral: true, content: 'Not playing in this server!' });
    }
}
exports.interactionHandlers = new Map();
exports.interactionHandlers.set('join', join);
exports.interactionHandlers.set('record', record);
exports.interactionHandlers.set('leave', leave);
//# sourceMappingURL=interactions.js.map