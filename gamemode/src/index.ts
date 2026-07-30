/**
 * Main Entry Point for the Gamemode. This file initializes the gamemode, sets up event handlers,
 * and defines the main logic for player interactions and character management.
 */


import { mp } from "./mp";
import { GamemodeSelf } from "./types/mp";
import { onActivate } from "./events/onActivate";
import { onDropItem } from "./events/onDropItem";
import { onDeath } from "./events/onDeath";
import { onRespawn } from "./events/onRespawn";
import { canCreateCharacter, createCharacter, deleteCharacter, listCharacters, selectCharacter } from "./systems/characters";
import { giveStartingItems } from "./systems/startingItems";
import { mineOneClick } from "./events/onActivate";

console.log("Gamemode has started!");

const userProfiles = new Map<number, number>(); // userId -> profileId
const pendingRaceMenu = new Map<number, number>(); // userId -> actorId

/**
 * Grouping all event handlers in a single object that implements the GamemodeSelf interface.
 * This object is registered with the mp system to receive event callbacks.
 * Each method corresponds to a specific event that can occur in the game, such as activating an object, dropping an item, or dying.
 * The mp system will call the appropriate method on this object when the corresponding event occurs in the game.
 */

const self: GamemodeSelf = {
  onActivate,
  onDropItem,
  onDeath,
  onRespawn,
};

/**
 * Register the self object with the mp system to start receiving event callbacks. 
 * This is essential for the gamemode to function,
 * as it allows the gamemode to react to in-game events and implement custom logic based on those events.
 */

mp._setSelf(self);



function sendCharacterSelection(userId: number, profileId: number): void {
  const chars = listCharacters(profileId);
  mp.sendCustomPacket(userId, JSON.stringify({
    customPacketType: "characterSelection",
    characters: chars.map((id) => ({ id, name: mp.getActorName(id) })),
    canCreate: canCreateCharacter(profileId),
  }));
}





mp.on("customPacket", (userId, content) => {
  let data: any;
  try { data = JSON.parse(content); } catch { return; }



  if (data.customPacketType === "mineProgress") {
    mineOneClick(userId);
    return;
  }



  if (data.customPacketType === "characterSelectionChoice") {
    const profileId = userProfiles.get(userId);
    console.log("[choice] received:", data.choice, "| profileId:", profileId);

    if (profileId === undefined) { 
      console.log("[choice] profileId UNDEFINED -> quit")
      return;
    }
    const chars = listCharacters(profileId);
    console.log("[choice] chars:", JSON.stringify(chars));


    // Delete a character slot.
    if (data.choice === "deleteSlot0" || data.choice === "deleteSlot1") {
      const slot = data.choice === "deleteSlot0" ? 0 : 1;
      const actorId = chars[slot];
      console.log("[choice] DELETING slot", slot, "actorId:", actorId);

      if (actorId !== undefined) deleteCharacter(actorId);
      
      sendCharacterSelection(userId, profileId);
      return;
    }


    // Select / Create a character slot.
    if (data.choice === "selectSlot0" && chars[0]) {
      console.log("[choice] SELECT 0 ->", chars[0]);
      selectCharacter(userId, chars[0], profileId);

    } else if (data.choice === "selectSlot1" && chars[1]) {
      console.log("[choice] SELECT 1 ->", chars[1]);
      selectCharacter(userId, chars[1], profileId);

    } else if (data.choice === "createNew" && canCreateCharacter(profileId)) {
      const newChar = createCharacter(profileId, [136341.64, 24887.36, -12792.88], 267.48, 0x3c);
      console.log("[choice] CREATE -> newChar:", newChar);
      selectCharacter(userId, newChar, profileId);

      try { 
        giveStartingItems(newChar);
      } 
      catch (e) { 
        console.error("[startingItems] failed:", e); 
      }
  

    // Open the race menu after equipping starting gear.
    pendingRaceMenu.set(userId, newChar);
    mp.sendCustomPacket(userId, JSON.stringify({
      customPacketType: "equipStartingGear",
      baseIds: [0x00080697, 0x00080699],
      openMenuAfter: true,
    }));
  } else {
      console.log("[choice] None corresponds (choice/chars don't match)");
    }

    mp.sendCustomPacket(userId, JSON.stringify({ customPacketType: "closeCharacterSelection" }));
  }



  if (data.customPacketType === "gearEquipped") {
    const actorId = pendingRaceMenu.get(userId);

    if (actorId !== undefined) {
      pendingRaceMenu.delete(userId);
      mp.setRaceMenuOpen(actorId, true);
      console.log("[raceMenu] open after equipping gear, actor", actorId);
    }
    return;
  }
});





/**
 * Player spawn event handler. This is called when a player spawns in the game.
 * @param userId the userId of the player who spawned.
 * @param profileId the profileId of the player who spawned. 
 */

mp.onPlayerSpawn = (userId, profileId) => {
  console.log("[onPlayerSpawn] userId:", userId, "profileId:", profileId);

  userProfiles.set(userId, profileId);
  sendCharacterSelection(userId, profileId);

  mp.sendCustomPacket(userId, JSON.stringify({
    customPacketType: "showLogo",
    url: "http://localhost:3000/ingamelogo.png",
  }));
};

/**
 * Shows the player connection event. This logs the userId of the player who connected.
 */

mp.on("connect", (userId) => {
  console.log("[connect] Player connected with userId =", userId);
});