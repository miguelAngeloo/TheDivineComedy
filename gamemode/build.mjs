import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node16",
  outfile: "C:/Users/HP/Desktop/SkyrimMP/skymp/build/dist/server/gamemode.js",
});
