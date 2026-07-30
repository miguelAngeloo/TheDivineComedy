# Crafting & Recipes

## How crafting works in SkyMP

SkyMP has its own **CraftService** that intercepts vanilla crafting: it reads
the recipe from the `.esp` files in the load order, checks ingredients, and
swaps items server-side. So vanilla crafting **just works** — no custom UI
needed.

Server log when crafting:
```
User X tries to craft ... Using craft recipe with EDID ... from espm file with index N
User crafted -<ingredients> +<product>
```

## Reading a recipe (COBJ) in SSEEdit

Each recipe is a **Constructible Object (COBJ)**:

| Field | Meaning |
|---|---|
| **EDID** | Name. `Recipe...` = crafting; `Temper...` = upgrade |
| **Items** | Ingredients |
| **CNAM** | Product (what gets created) |
| **BNAM** | Station: `CraftingSmithingForge` = forge; `...ArmorTable` = temper |
| **Conditions** | Requirements (e.g. `HasPerk(SteelSmithing)`) |

## Creating a new recipe (the method that works)

You can't "unlock" a recipe that doesn't exist — you **create** it in your own
`.esp` (`TheDivineComedy_Recipes.esp`).

In SSEEdit:
1. Right-click an existing recipe → **Copy as new record into...**
2. Choose `TheDivineComedy_Recipes.esp`
3. Give a new **EditorID** (e.g. `RecipePenitusCuirass`)
4. Change **CNAM** to the product's FormID
5. Adjust **Items** (ingredients)
6. **Remove perk Conditions** — the server has no perks, or the recipe never shows
7. Make sure **BNAM** is the right station (forge to craft)
8. Save; add to `plugins.txt` + server `loadOrder`

**Careful with light plugins:** the product must live in a plugin the server
knows. Vanilla FormIDs (index 00) or normal `.esp` work. Items from **light
(FE)** plugins like Sentinel may not be recognised server-side.

## Current state

Recipes in `TheDivineComedy_Recipes.esp`:
- Full Penitus Oculatus armor (cuirass, boots, helmet, gauntlets)
- TODO: shield, cloak, sword

## Open problem — the economy

Mod recipes assume a normal Skyrim (loot, animals, merchants). The server is
empty: only **ore** and **flora** are reliably obtainable. Ingredients like
Linen Wrap (urns), leather/pelts (animals), are out of reach.

**Pending decision:** where do resources come from? Solve **by category**
("all textiles come from flora"), not item by item.

## Professions with XP (future idea)

Goal: tailor gains XP → better clothing; blacksmith → better armor. Needs to
react to each craft and **block** crafts below the required level. The
`onCraft` hook exists in `GamemodeSelf` — **needs testing** to see if it fires
and can block. That test decides if this is viable.



last update: 07/30/2026