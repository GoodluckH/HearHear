import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream";
import { EndBehaviorType, VoiceReceiver } from "@discordjs/voice";
import type { User } from "discord.js";
import * as prism from "prism-media";

function getDisplayName(userId: string, user?: User) {
  return user ? `${user.username}_${user.discriminator}` : userId;
}

export function createListeningStream(
  receiver: VoiceReceiver,
  userId: string,
  user?: User
) {
  if (receiver.subscriptions.has(userId) || !user) {
    console.log("🤷 Already recording", userId);
    return;
  }

  const opusStream = receiver.subscribe(userId, {
    end: {
      behavior: EndBehaviorType.AfterSilence,
      duration: 300,
    },
  });

  const oggStream = new prism.opus.OggLogicalBitstream({
    opusHead: new prism.opus.OpusHead({
      channelCount: 2,
      sampleRate: 48000,
    }),
    pageSizeControl: {
      maxPackets: 10,
    },
  });

  const filename = `./recordings/${Date.now()}-${getDisplayName(
    userId,
    user
  )}.ogg`;

  const out = createWriteStream(filename);

  console.log(`👂 Started recording ${filename}`);

  const timeout = setTimeout(() => {
    console.log(`🕒 Timeout reached for ${filename}`);
    opusStream.emit("end");
    receiver.subscriptions.delete(userId);
    createListeningStream(receiver, userId, user);
  }, 30_000);

  pipeline(opusStream, oggStream, out, (err) => {
    clearTimeout(timeout);

    if (err) {
      out.close();
      console.warn(`❌ Error recording file ${filename} - ${err.message}`);
    } else {
      console.log(`✅ Recorded ${filename}`);
    }
  });
}
