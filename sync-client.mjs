// Copy the files from the client/src folder to the SkyMP client src folder.

import { cp } from "node:fs/promises";
import { join } from "node:path";

const SKYMP_CLIENT =
  process.env.SKYMP_CLIENT ||
  "C:/Users/HP/Desktop/SkyrimMP/skymp/skymp5-client";

const SOURCE = "./client/src";
const DEST = join(SKYMP_CLIENT, "src");

async function main() {
  console.log("Copying from client/src...");
  await cp(SOURCE, DEST, { recursive: true });
  console.log("Done. You can now build the client.");
}

main().catch((err) => {
  console.error("Error copying files:", err);
  process.exit(1);
});