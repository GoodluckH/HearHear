import { VoiceConnection } from '@discordjs/voice';
import { Client, CommandInteraction, Snowflake } from 'discord.js';
export declare const interactionHandlers: Map<string, (interaction: CommandInteraction, recordable: Set<Snowflake>, client: Client, connection?: VoiceConnection) => Promise<void>>;
