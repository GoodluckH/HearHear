"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListeningStream = void 0;
const tslib_1 = require("tslib");
const node_fs_1 = require("node:fs");
const node_stream_1 = require("node:stream");
const voice_1 = require("@discordjs/voice");
const prism = tslib_1.__importStar(require("prism-media"));
function getDisplayName(userId, user) {
    return user ? `${user.username}_${user.discriminator}` : userId;
}
function createListeningStream(receiver, userId, user) {
    const opusStream = receiver.subscribe(userId, {
        end: {
            behavior: voice_1.EndBehaviorType.AfterSilence,
            duration: 1000,
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
    const filename = `./recordings/${Date.now()}-${getDisplayName(userId, user)}.ogg`;
    const out = (0, node_fs_1.createWriteStream)(filename);
    console.log(`👂 Started recording ${filename}`);
    (0, node_stream_1.pipeline)(opusStream, oggStream, out, (err) => {
        if (err) {
            console.warn(`❌ Error recording file ${filename} - ${err.message}`);
        }
        else {
            console.log(`✅ Recorded ${filename}`);
        }
    });
}
exports.createListeningStream = createListeningStream;
//# sourceMappingURL=createListeningStream.js.map