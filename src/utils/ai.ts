import { config } from "dotenv";
import fs from "node:fs";
import { File, Blob } from "@web-std/file";

config();

async function transcribeAudio(filePath: string) {
  const form = new FormData();
  form.append(
    "file",
    new File([new Blob([fs.readFileSync(filePath)])], filePath, {
      type: "audio/mp3",
    })
  );
  form.append("model", "whisper-1");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
      ContentType: "multipart/form-data",
    },
    method: "POST",
    body: form,
  });
  return res;
}

export { transcribeAudio };
