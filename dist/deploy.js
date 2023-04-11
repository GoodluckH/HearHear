"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = void 0;
const v10_1 = require("discord-api-types/v10");
const deploy = async (guild) => {
    await guild.commands.set([
        {
            name: 'join',
            description: 'Joins the voice channel that you are in',
        },
        {
            name: 'record',
            description: 'Enables recording for a user',
            options: [
                {
                    name: 'speaker',
                    type: v10_1.ApplicationCommandOptionType.User,
                    description: 'The user to record',
                    required: true,
                },
            ],
        },
        {
            name: 'leave',
            description: 'Leave the voice channel',
        },
    ]);
};
exports.deploy = deploy;
//# sourceMappingURL=deploy.js.map