# Mods

**Skyrim SE:** 1.6.1170 · **SKSE64:** 2.2.6 · launch with `skse64_loader.exe`

Client and server must load the same plugins. Each player replicates this list
on public deploy.

---

## Load order (indices from SSEEdit)

```
[00] Skyrim.esm
[01] Update.esm
[02] Dawnguard.esm
[03] HearthFires.esm
[04] Dragonborn.esm
[FE 000] Sentinel - Master Plugin.esp     (light)
[FE 001] SkyUI_SE.esp                      (light)
[05] MinerOutfit.esp
[06] JK's Whiterun's Outskirts.esp
[07] MoreCraftableEquipment.esp
[08] Cloaks&Capes.esp
[09] DIS_Heavy_Legion.esp
[0A] CommonClothes.esp
[FE 002] Sentinel.esp                       (light)
[FE 003] Sentinel - More Craftable Equipment.esp (light)
[FE 004] Sentinel - City Guards.esp         (light)
[0B] JK's Riverwood.esp
[0C] JKs Whiterun.esp
[0D] TheDivineComedy_Recipes.esp            (my recipes)
```

**Server `loadOrder`** = normal plugins only (no `FE` ones).
Light plugins (ESP-FE) are NOT recognised server-side, so Sentinel recipes are
not reliable on the server. My recipes point to vanilla FormIDs (index 00) or
New Legion (09), which the server knows.

---

## Content plugins (.esp)

| Mod | Nexus | Gives |
|---|---|---|
| More Craftable Equipment | 44666 | Weaving Loom + clothing recipes |
| JK's Whiterun's Outskirts | 78351 | Whiterun outskirts |
| Cloaks & Capes | 2019 | Craftable capes (tanning rack) |
| New Legion | 30468 | Imperial armor replacer |
| Common Clothes | 5063 | Craftable clothing |
| JK's Riverwood | 2013 | Riverwood village |
| JK's Whiterun | — | Whiterun city |

## Light plugins (ESP-FE)

| Mod | Nexus | Note |
|---|---|---|
| SkyUI | 12604 | UI. Not in server loadOrder. |
| Sentinel | 100985 | ~300 items. Light — recipes unreliable server-side. |

## SKSE plugins (no .esp)

| Mod | Nexus | Gives |
|---|---|---|
| SKSE64 | 30379 | Base for everything |
| Address Library (AE) | 32444 | Dependency for SKSE plugins |
| SSE Engine Fixes | 17230 | Engine fixes (Skyrim Souls dependency) |
| Skyrim Souls RE | 27859 | Menus don't pause the game |
| Actor Limit Fix | 32349 | Actor limit 128 → 256 |
| Crafting Categories | 81409 | Categories in the crafting menu |
| SkyPatcher | 106659 | Patch data without .esp |
| powerofthree's Tweaks | 51073 | Load EditorIDs, etc. |
| Native EditorID Fix | 85260 | Sentinel dependency |

---

## Adding a new mod

1. Install into `Data` (`.esp` + `.bsa`, or SKSE files)
2. If it has `.esp` → add to `plugins.txt` with `*` (game closed)
3. **SSEEdit** → check if it's normal (`[0E]`) or light (`[FE xxx]`)
4. Only if **normal** → add to server `loadOrder`, same order
5. Test: server log has no `FromFormId failed`; miner outfit shows in char menu

`MINER_OUTFIT_ID` is auto-detected at runtime — no manual update needed.

---

## Notes

- **SkyPatcher** modifies existing recipes (keyword, ingredients) but can't
  create new ones from scratch, and being client-side it's not guaranteed the
  server sees the change. Recipes are made in `.esp` instead.
- **`Skyrim.ccc` emptied** — stops Creation Club loading (index misalignment).
  Reverts if Steam verifies files.
- **`spawn.ts` modified** — `onPlayerSpawn` hook. Lost on SkyMP update.



last update: 07/30/2026