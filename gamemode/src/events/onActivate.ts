import { mp } from "../mp";


const BLOCKED_TYPES = ["ALCH", "MISC", "WEAP", "ARMO", "BOOK", "SLGM", "AMMO", "SCRL", "INGR"];


// for type: maximum ore per vein + time (ms) until it replenishes to maximum
const ORE_CONFIG: { [match: string]: { max: number; respawnMs: number } } = {
  Iron:       { max: 10, respawnMs: 60000 },
  Corundum:   { max: 10, respawnMs: 60000 },
  Silver:     { max: 5,  respawnMs: 120000 },
  Gold:       { max: 5,  respawnMs: 120000 },
  Orichalcum: { max: 1,  respawnMs: 240000 },
  Moonstone:  { max: 1,  respawnMs: 240000 },
  Quicksilver:{ max: 1,  respawnMs: 480000 },
  Malachite:  { max: 1,  respawnMs: 480000 },
  Ebony:      { max: 1,  respawnMs: 600000 },
};


// state per vein (target): current stock + instant of last refill
const veinState = new Map<number, { stock: number; lastRefill: number }>();


// what vein each player is currently mining
const miningSession = new Map<number, { target: number; caster: number; match: string }>();



// resolves the current stock of a vein, replenishing to maximum if the respawn time has passed.
function getVeinStock(target: number, max: number, respawnMs: number): { stock: number; lastRefill: number } {
  const now = Date.now();
  let state = veinState.get(target);


  // first time this vein is activated -> spawn full
  if (!state) {
    state = { stock: max, lastRefill: now };
    veinState.set(target, state);
    return state;
  }


  // has the respawn time passed? -> replenish to MAXIMUM (does not accumulate)
  if (now - state.lastRefill >= respawnMs) {
    state.stock = max;
    state.lastRefill = now;
  }

  return state;
}


export function mineOneClick(userId: number): void {
  const session = miningSession.get(userId);
  if (!session) return;

  const vein = ORE_BY_VEIN_SORTED.find((v) => v.match === session.match);
  if (!vein) return;

  const cfg = ORE_CONFIG[session.match] || { max: 1, respawnMs: 60000 };
  const state = getVeinStock(session.target, cfg.max, cfg.respawnMs);

  if (state.stock <= 0) {
    mp.sendCustomPacket(userId, JSON.stringify({ customPacketType: "miningUpdate", stock: 0, depleted: true }));
    return;
  }

  state.stock -= 1;
  addItem(session.caster, vein.oreBaseId, vein.count);

  mp.sendCustomPacket(userId, JSON.stringify({
    customPacketType: "miningUpdate",
    stock: state.stock,
    depleted: state.stock <= 0,
  }));
}



// resolves a world reference to the base form type ("ALCH", "CONT", "ACTI"...)
function getActivatedType(refrId: number): { type: string; editorId: string } | null {
  try {
    const refr = mp.lookupEspmRecordById(refrId) as any;
    if (!refr.record) return null;

    if (refr.record.type !== "REFR" && refr.record.type !== "ACHR") {
      return { type: refr.record.type, editorId: refr.record.editorId };
    }

    const nameField = refr.record.fields.find((f: any) => f.type === "NAME");
    if (!nameField) return { type: refr.record.type, editorId: refr.record.editorId };

    const d = nameField.data;
    const localBaseId = ((d[0]) | (d[1] << 8) | (d[2] << 16) | (d[3] << 24)) >>> 0;
    const globalBaseId = refr.toGlobalRecordId(localBaseId);

    const base = mp.lookupEspmRecordById(globalBaseId) as any;
    if (!base.record) return { type: refr.record.type, editorId: refr.record.editorId };
    return { type: base.record.type, editorId: base.record.editorId };
  } catch (e) {
    console.error("[onActivate] erro a resolver tipo:", e);
    return null;
  }
}



// adds an item to the inventory without removing the rest of the items
function addItem(actorId: number, baseId: number, count: number): void {
  const inv = (mp.get(actorId, "inventory") as any) || { entries: [] };
  if (!inv.entries) inv.entries = [];
  const e = inv.entries.find((x: any) => x.baseId === baseId);
  if (e) e.count += count;
  else inv.entries.push({ baseId, count });
  mp.set(actorId, "inventory", inv);
}


const ORE_BY_VEIN: { match: string; oreBaseId: number; count: number }[] = [
  { match: "Ebony",       oreBaseId: 0x0005ACDC, count: 1 },
  { match: "Malachite",   oreBaseId: 0x0005ACE1, count: 1 },
  { match: "Quicksilver", oreBaseId: 0x0005ACE2, count: 1 },
  { match: "Orichalcum",  oreBaseId: 0x0005ACDD, count: 1 },
  { match: "Moonstone",   oreBaseId: 0x0005ACE0, count: 1 },
  { match: "Gold",        oreBaseId: 0x0005ACDE, count: 1 },
  { match: "Silver",      oreBaseId: 0x0005ACDF, count: 1 },
  { match: "Corundum",    oreBaseId: 0x0005ACDB, count: 1 },
  { match: "Iron",        oreBaseId: 0x00071CF3, count: 1 },
];


// names longer first -> "Quicksilver" before "Silver", "Moonstone" before "Gold", etc.
const ORE_BY_VEIN_SORTED = [...ORE_BY_VEIN].sort((a, b) => b.match.length - a.match.length);




export function onActivate(target: number, caster: number): boolean {
  const info = getActivatedType(target);

  // mining vein: opens the mining UI
  if (info && info.type === "ACTI" && info.editorId && info.editorId.indexOf("MineOre") === 0) {
    const vein = ORE_BY_VEIN_SORTED.find((v) => info.editorId.indexOf(v.match) !== -1);
    if (vein && vein.oreBaseId !== 0) {
      const cfg = ORE_CONFIG[vein.match] || { max: 1, respawnMs: 60000 };
      const state = getVeinStock(target, cfg.max, cfg.respawnMs);

      const userId = mp.getUserByActor(caster);
      if (userId !== undefined && userId >= 0) {
        miningSession.set(userId, { target, caster, match: vein.match });
        mp.sendCustomPacket(userId, JSON.stringify({
          customPacketType: "openMining",
          ore: vein.match,
          stock: state.stock,
        }));
      }
    }
    return true;
  }


  // chests : allow opening, but empty the content
  if (info && info.type === "CONT") {
    mp.set(target, "inventory", { entries: [] });
    return true;
  }


  // block picking up loose items (ALCH, MISC, WEAP, ARMO, BOOK, SLGM, AMMO, SCRL, INGR)
  if (info && BLOCKED_TYPES.indexOf(info.type) !== -1) return false;


  // the rest (doors, flowers, furniture...) normal
  return true;
}