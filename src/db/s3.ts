import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { config } from "dotenv";
config();

const S3_BUCKET_REGION = process.env.S3_BUCKET_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

const client = new S3Client({
  region: S3_BUCKET_REGION!,
});

/**
 * Upload a recording to S3. The path follows the format:
 * S3_BUCKET_NAME/{guildId}/{channelId}/{currentDate}/{fileName}
 * @param data the binary data of the recording
 * @param fileName the name of the file
 * @param guildId the id of the discord server
 * @param channelId the id of the discord channel where the recording was made
 * @param timestamp the timestamp of the recording. this should reflect
 * teh earliest time that the recording was made.
 * @param contentType the content type of the file. eg. audio/ogg
 * @returns
 */
async function uploadMeetingFileToS3(
  data: Buffer,
  fileName: string,
  guildId: string,
  channelId: string,
  timestamp: string,
  contentType: string = "audio/ogg"
) {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: `${guildId}/${channelId}/${timestamp}/${fileName}`,
    Body: data,
    ContentType: contentType,
  };

  try {
    const results = await client.send(new PutObjectCommand(params));
    console.log(
      "Successfully created " +
        params.Key +
        " and uploaded it to " +
        params.Bucket +
        "/" +
        params.Key
    );
    return results; // For unit tests.
  } catch (err) {
    console.log("Error", err);
    return err; // For unit tests.
  }
}

export { uploadMeetingFileToS3 };
