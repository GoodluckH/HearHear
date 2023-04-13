import * as fs from "node:fs";
// import ffmpeg from "fluent-ffmpeg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { config } from "dotenv";
config();

const S3_BUCKET_REGION = process.env.S3_BUCKET_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const RECORDING_FILES_PATH = "./recordings";

const client = new S3Client({
  region: S3_BUCKET_REGION!,
});

async function uploadToS3(data: Buffer, fileName: string) {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: data,
    ContentType: "audio/ogg",
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

async function uploadRecordingsToS3() {
  for (const file of fs.readdirSync(RECORDING_FILES_PATH)) {
    if (!file.endsWith(".ogg")) {
      continue;
    }
    fs.readFile(`${RECORDING_FILES_PATH}/${file}`, async (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      await uploadToS3(data, file);
    });
  }
}

uploadRecordingsToS3();

// after uploaded everything, it should delete the files from local
// folder
//
// I should pipeline the S3 operation with the stream creation
//
// Also should create folders in S3 bucket for each server
//
// and for each meeting should also create a folder
// "server-name-timestamp"
