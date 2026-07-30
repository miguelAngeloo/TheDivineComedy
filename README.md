# The Divine Comedy

Skyrim RP project built on top of SkyMP multiplayer mod, with custom
gamemode and client. The Theme was inspired by Dante's Inferno book.

---

## Setup basics

- **Skyrim SE:** 1.6.1170 (Anniversary Edition)
- **SKSE64:** 2.2.6 — always launch with `skse64_loader.exe`
- Client and server must load the **same plugin list**.

---

## Project structure

```
TheDivineComedy/
├── gamemode/        server code (builds into SkyMP via build.mjs)
├── client/src/      my client files
├── recipes/         TheDivineComedy_Recipes.esp
├── patches/         changes to SkyMP source (see below)
├── docs/            guides and info about the development
└── sync-client.mjs  copies client/ into skymp5-client before building
```

**Build:**
- Gamemode: `cd gamemode && yarn build`
- Client: `node sync-client.mjs`, then build `skymp5-client` as usual

---

## Environment changes (see `patches/`)

- **`Skyrim.ccc` emptied** — stops the game loading Creation Club content, which
  was misaligning client/server plugin indices. Reverts if Steam verifies game
  files.
- **`spawn.ts` modified** — added the `onPlayerSpawn` hook so the gamemode
  controls spawning. Lost on a SkyMP update/reclone.



last update: 07/30/2026