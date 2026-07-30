// Shared constants between the service and the views (UI).
// Nothing here depends on skyrimPlatform or the runtime — it's safe to import
// both in the service and in the render files.

export const EMOTES = [
  { g: "Social", n: "Wave",          a: "IdleWave" },
  { g: "Social", n: "Salute",        a: "IdleSalute" },
  { g: "Social", n: "Bow",           a: "IdleSilentBow" },
  { g: "Social", n: "Applaud",       a: "IdleApplaud2" },
  { g: "Social", n: "Laugh",         a: "IdleLaugh" },
  { g: "Social", n: "Come Here",     a: "IdleComeThisWay" },
  { g: "Poses",  n: "Arms Crossed",  a: "OffsetArmsCrossedStart" },
  { g: "Poses",  n: "Pray",          a: "IdlePray" },
  { g: "Poses",  n: "Warm Hands",    a: "IdleWarmHands" },
  { g: "Poses",  n: "Sit",           a: "IdleSitCrossLeggedEnter" },
  { g: "Poses",  n: "Surrender",     a: "IdleSurrender" },
  { g: "Other",  n: "Drink",         a: "IdleDrinkPotion" },
  { g: "Other",  n: "Eat",           a: "IdleEatingStandingStart" },
  { g: "Other",  n: "Read",          a: "IdleNoteRead" },
  { g: "Other",  n: "Play Lute",     a: "IdleLuteStart" },
];




// O ID local (0x000802) é fixo pelo .esp. O índice do plugin muda sempre que
// acrescentas/removes mods, por isso descobrimo-lo em runtime.
export const OUTFIT_LOCAL_ID = 0x000802;
export const FORM_TYPE_OUTFIT = 124;

// MinerStartOutfit on MinerOutfit.esp file.
// 0F is the plugin index of MinerOutfit.esp, 000802 is the formID of MinerStartOutfit,
// if we add another plugin before MinerOutfit.esp, the plugin index will change and this constant will need to be updated.
export const MINER_OUTFIT_ID = 0x05000802;

export const PICKAXE_ID = 0x000e3c16;


// Vannila animations for mining (ENAM field of the IDLE records in Skyrim.esm)
export const ANIM_MINE_START = "IdlePickaxeFloorEnter";
export const ANIM_MINE_STOP = "IdleForceDefaultState";


// Key events changed between the browser (UI) and the service.
export const events = {
  selectSlot0: "selectSlot0",
  selectSlot1: "selectSlot1",
  createNew: "createNew",
  deleteSlot0: "deleteSlot0",
  deleteSlot1: "deleteSlot1",
  closeMining: "closeMining",
  mineProgress: "mineProgress",
  closeEmotes: "closeEmotes",
};