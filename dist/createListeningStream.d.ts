import { VoiceReceiver } from '@discordjs/voice';
import type { User } from 'discord.js';
export declare function createListeningStream(receiver: VoiceReceiver, userId: string, user?: User): void;
