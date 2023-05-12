import * as fs from "node:fs";

function deleteFileSync(path: string) {
  fs.unlinkSync(path);
}

export { deleteFileSync };
