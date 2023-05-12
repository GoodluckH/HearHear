import ffmpeg from "fluent-ffmpeg";

function convertOggToMp3(oggFilename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputFile = oggFilename.replace(".ogg", ".mp3");
    ffmpeg({
      source: oggFilename,
    })
      .on("error", (err: any) => {
        reject(err);
      })
      .on("end", () => {
        resolve(outputFile);
      })
      .save(outputFile);
  });
}

export { convertOggToMp3 };
