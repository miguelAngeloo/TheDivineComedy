import { mp } from "../mp";
import { Pos } from "../types/mp";


// Where the player died (actorId -> position).
export const deathPos = new Map<number, Pos>();


// The SkyMP automatically respawns the player ~25s after death.
const RESPAWN_DELAY_MS = 26000;

export function onDeath(...args: unknown[]): void {
  const actorId = Array.isArray(args) ? (args[0] as number) : 0;
  if (!actorId) return;


  // Store where the player died, so onRespawn can choose the nearest temple.
  try {
    deathPos.set(actorId, mp.getActorPos(actorId));
  } catch (e) {
    console.log("[onDeath] Cannot get actor position:", e);
  }

  const userId = mp.getUserByActor(actorId);
  if (userId === undefined || userId < 0) return;

  mp.sendCustomPacket(userId, JSON.stringify({
    customPacketType: "showDeath",
    text: "You will respawn at the nearest temple.",
  }));


  // Hide the UI on death after the player respawns.
  setTimeout(() => {
    if (mp.isConnected(userId)) {
      mp.sendCustomPacket(userId, JSON.stringify({ customPacketType: "hideDeath" }));
    }
  }, RESPAWN_DELAY_MS);
}