# Recipes

Custom crafting recipes for the server, in `TheDivineComedy_Recipes.esp`.

This plugin is edited in **SSEEdit**, not in code. It holds Constructible
Objects (COBJ) that make items craftable at vanilla stations (forge, tanning
rack, etc.).

---

## Load order

Must be loaded in BOTH:
- **Client:** `plugins.txt` → `*TheDivineComedy_Recipes.esp`
- **Server:** `server-settings.json` → add its path to `loadOrder`

It's a normal `.esp`, so the server recognises its recipes.

---

## How to add a recipe (SSEEdit)

1. Right-click an existing recipe → **Copy as new record into...**
2. Choose `TheDivineComedy_Recipes.esp`
3. New **EditorID** (e.g. `RecipePenitusBoots`)
4. Change **CNAM** to the product's FormID
5. Adjust **Items** (ingredients)
6. Remove any **perk Conditions** (the server has no perks)
7. Check **BNAM** is the right station (`CraftingSmithingForge` = forge)
8. Save

**Key rule:** the product's FormID must live in a plugin the server knows —
vanilla (`Skyrim.esm`, index 00) or a normal `.esp`. Items from **light (FE)**
plugins (e.g. Sentinel) may not work server-side.

---

## Recipes so far

| Recipe | Product | Station |
|---|---|---|
| RecipePenitusCuirass | Penitus Oculatus Armor | Forge |
| RecipePenitusBoots | Penitus Boots | Forge |
| RecipePenitusHelmet | Penitus Helmet | Forge |
| RecipePenitusGauntlets | Penitus Gauntlets | Forge |

**TODO:** Penitus shield, cloak, sword.

---

## Note on ingredients

Ingredients are still placeholder (steel + leather, like vanilla). They need to
be reworked once the server economy is decided — the world only reliably
provides ore and flora, so leather-based recipes aren't obtainable yet.
See `docs/CRAFTING.md`.


last update: 07/30/2026