# Gamemode

GameMode for The Divine Comedy build on top of SkyMP.

## How to Build
1. `yarn install`  (or `npm install`)
2. `yarn build`    -> generates `gamemode.js`
3. Copy `gamemode.js` to `build/dist/server/gamemode.js` in your SkyMP or add a Path Location (Example: "C:/YourUser/Desktop/SkyrimMP/skymp/build/dist/server/gamemode.js") to your build.mjs file.
4. Start the server, also load after some changes.

## Estructure
- `src/index.ts`           -> Entry Point of the GameMode, combine the handlers and register with `mp._setSelf(...)`.
- `src/mp.ts`              -> Typed Acess to the global `mp`.
- `src/types/mp.ts`        -> API Types `mp` (autocomplete). Extendable.
- `src/events/`            -> One file for each type of event Event.
- `src/systems/`           -> Logic for managing Backend services.
