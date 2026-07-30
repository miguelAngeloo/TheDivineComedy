import { mp } from "../mp";
import { deathPos } from "./onDeath";
import { nearestTemple } from "./temples";

export function onRespawn(...args: unknown[]): void {
  const actorId = Array.isArray(args) ? (args[0] as number) : 0;

  const from = deathPos.get(actorId) || [0, 0, 0];
  deathPos.delete(actorId);
  const temple = nearestTemple(from);

  
  setTimeout(() => {
    try {
      mp.set(actorId, "locationalData", {
        pos: temple.respawnPos,
        rot: [0, 0, 0],
        cellOrWorldDesc: temple.cell,
      });
      console.log("[onRespawn] Teleported to", temple.name);
    } catch (e) {
      console.log("[onRespawn] ERROR:", e);
    }
  }, 1200);
}