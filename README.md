# 👂 Recorder Bot

This example shows how you can use the voice receive functionality in @discordjs/voice to record users in voice channels
and save the audio to local Ogg files.

## Usage

```sh-session
# Clone the examples repository, copy the `recorder` files in a folder and then run:
$ npm install
$ npm run build

# Set a bot token (see config.example.json)
$ cp config.example.json config.json
$ nano config.json

# Start the bot!
$ npm start
```

## Notes

The stream subscription will automatically end when user is not speaking
for more than 300 ms. This is to prevent the bot from recording empty
audio files.

To prevent the buffer from growing too large, a timer is used to end and
re-record the stream every 30 seconds.
