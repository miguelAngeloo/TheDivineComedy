import { ClientListener, CombinedController, Sp } from "./clientListener";
import { ConnectionMessage } from "../events/connectionMessage";
import { CustomPacketMessage } from "../messages/customPacketMessage";
import { logTrace } from "../../logging";
import { MsgType } from "../../messages";
import { FunctionInfo } from "../../lib/functionInfo";
import { BrowserMessageEvent } from "skyrimPlatform";
import { applyEquipment } from "../../sync/equipment";

import {
  EMOTES,
  OUTFIT_LOCAL_ID,
  FORM_TYPE_OUTFIT,
  PICKAXE_ID,
  ANIM_MINE_START,
  ANIM_MINE_STOP,
  events,
} from "./characterSelection/constants";
import { renderEmotes } from "./characterSelection/ui/RenderEmotes";
import { renderCharacterSelection } from "./characterSelection/ui/RenderCharacterSelection";
import { renderMining } from "./characterSelection/ui/RenderMining";
import { renderDeath } from "./characterSelection/ui/RenderDeath";
import { renderLogo } from "./characterSelection/ui/RenderLogo";




export class CharacterSelectionService extends ClientListener {
  private logoVisible = true;

  constructor(private sp: Sp, private controller: CombinedController) {
    super();
    this.controller.emitter.on("customPacketMessage", (e) => this.onCustomPacketMessage(e));
    this.controller.on("browserMessage", (e) => this.onBrowserMessage(e));

    this.controller.on("buttonEvent", (e: any) => {
      if (e.code !== 48 || !e.isUp) return; // 48 = B Key (Emote wheel)
      this.openEmotes();
    });

    this.controller.on("buttonEvent", (e: any) => {
      if (e.code !== 60 || !e.isUp) return;   // 60 = F2 Key (Toggle Logo)
      this.logoVisible = !this.logoVisible;
      this.sp.browser.executeJavaScript(
      `(function(){ var l = document.getElementById('skymp-logo'); if (l) l.style.display = '${this.logoVisible ? "block" : "none"}'; })();`
      );
    });
  }

  // Emotes

  private openEmotes(): void {
    this.controller.once("update", () => {
      if (this.sp.Ui.isMenuOpen("RaceSex Menu")) return;
      this.sp.browser.executeJavaScript(
        new FunctionInfo(renderEmotes).getText({ events, emotes: EMOTES })
      );
      this.sp.browser.setVisible(true);
      this.sp.browser.setFocused(true);
      this.sp.browser.executeJavaScript(
        `window.dispatchEvent(new CustomEvent('skymp5-client:browserFocused', {}))`
      );
    });
  }

  private closeEmotes(): void {
    this.sp.browser.executeJavaScript(
      `document.getElementById('skymp-emotes')?.remove(); window.dispatchEvent(new CustomEvent('skymp5-client:browserUnfocused', {}))`
    );
    this.sp.browser.setFocused(false);
    this.sp.browser.setVisible(false);
  }

  private playEmote(anim: string): void {
    this.controller.once("update", () => {
      const player = this.sp.Game.getPlayer();
      if (player) this.sp.Debug.sendAnimationEvent(player, anim);
    });
  }

  // Packets

  private onCustomPacketMessage(event: ConnectionMessage<CustomPacketMessage>): void {
    let content: Record<string, unknown> = {};
    try {
      content = JSON.parse(event.message.contentJsonDump);
    } catch {
      return;
    }

    if (content["customPacketType"] === "showLogo") {
      const url = typeof content["url"] === "string" ? content["url"] : "";
      if (url) {
        this.sp.browser.executeJavaScript(
          new FunctionInfo(renderLogo).getText({ url })
        );
        this.sp.browser.setVisible(true);
      }
      return;
    }  



    if (content["customPacketType"] === "openMining") {
      const ore = typeof content["ore"] === "string" ? content["ore"] : "Ore";
      const stock = typeof content["stock"] === "number" ? content["stock"] : 0;

      this.controller.once("update", () => {
        const player = this.sp.Game.getPlayer();
        const pickaxe = this.sp.Game.getFormEx(PICKAXE_ID);



        if (!player || !pickaxe || !player.isEquipped(pickaxe)) {
          this.sp.Debug.notification("You need to equip a pickaxe to mine");
          return;
        }

        this.startMiningAnim();

        this.sp.browser.executeJavaScript(
          new FunctionInfo(renderMining).getText({ events, ore, stock })
        );
        this.sp.browser.setVisible(true);
        this.sp.browser.setFocused(true);
        this.sp.browser.executeJavaScript(
          `window.dispatchEvent(new CustomEvent('skymp5-client:browserFocused', {}))`
        );
      });
      return;
    }

    if (content["customPacketType"] === "showDeath") {
      const text = typeof content["text"] === "string" ? content["text"] : "You died.";
      this.sp.browser.executeJavaScript(
        new FunctionInfo(renderDeath).getText({ text })
      );
      this.sp.browser.setVisible(true);
      return;
    }

    if (content["customPacketType"] === "hideDeath") {
      this.sp.browser.executeJavaScript(
        `document.getElementById('skymp-death')?.remove();`
      );
      return;
    }

    if (content["customPacketType"] === "notification") {
      const text = typeof content["text"] === "string" ? content["text"] : "";
      if (text) {
        this.controller.once("update", () => {
          this.sp.Debug.notification(text);
        });
      }
      return;
    }

    if (content["customPacketType"] === "miningUpdate") {
      const stock = typeof content["stock"] === "number" ? content["stock"] : 0;
      const depleted = content["depleted"] === true || stock <= 0;
      if (depleted) {
        this.sp.browser.executeJavaScript(`window.__miningDepleted = true;`);
        this.stopMiningAnim();
      }
      return;
    }

    if (content["customPacketType"] === "equipStartingGear") {
      const baseIds = Array.isArray(content["baseIds"]) ? (content["baseIds"] as number[]) : [];
      const openMenuAfter = content["openMenuAfter"] === true;
      this.equipBeforeMenu(baseIds, openMenuAfter);
      return;
    }

    if (content["customPacketType"] !== "characterSelection") return;

    const canCreate = content["canCreate"] === true;
    const characters = Array.isArray(content["characters"]) ? content["characters"] : [];

    try {
      this.sp.browser.executeJavaScript(
        new FunctionInfo(renderCharacterSelection).getText({ events, canCreate, characters })
      );
    } catch (err) {
      logTrace(this, "render crashed: " + err);
    }
    this.sp.browser.setVisible(true);
    this.sp.browser.setFocused(true);
    this.sp.browser.executeJavaScript(
      `window.dispatchEvent(new CustomEvent('skymp5-client:browserFocused', {}))`
    );
  }

  // Mining Animation

  private startMiningAnim(): void {
    this.controller.once("update", () => {
      const player = this.sp.Game.getPlayer();
      if (player) this.sp.Debug.sendAnimationEvent(player, ANIM_MINE_START);
    });
  }

  private stopMiningAnim(): void {
    this.controller.once("update", () => {
      const player = this.sp.Game.getPlayer();
      if (player) this.sp.Debug.sendAnimationEvent(player, ANIM_MINE_STOP);
    });
  }


  private minerOutfitId: number | null = null;


// Search for the MinerStartOutfit in all plugin indices.
// The result is cached — the index does not change during the session.

  private getMinerOutfitId(): number | null {
    if (this.minerOutfitId !== null) return this.minerOutfitId;

    const found: number[] = [];
    for (let idx = 1; idx < 256; idx++) {
      const formId = idx * 0x1000000 + OUTFIT_LOCAL_ID;
      const form = this.sp.Game.getFormEx(formId);
      if (form && form.getType() === FORM_TYPE_OUTFIT) found.push(formId);
    }

    if (found.length === 0) {
      logTrace(this, "MinerStartOutfit Not Found - MinerOutfit.esp loaded?");
      return null;
    }
    if (found.length > 1) {
      logTrace(this, "Warning: some Outfits with local id 0x802 - choosing first");
    }

    this.minerOutfitId = found[0];
    logTrace(this, "MinerStartOutfit on 0x" + found[0].toString(16));
    return found[0];
  }









  // Starting Gear

  // Equip the outfit BEFORE the race menu opens, and only notify the server,
  // when it confirms that it is actually worn (avoids spawning naked).
  private equipBeforeMenu(baseIds: number[], openMenuAfter: boolean, attempt: number = 0): void {
    this.controller.once("update", () => {
      try {
        const player = this.sp.Game.getPlayer();
        if (!player) {
          if (attempt < 300) this.equipBeforeMenu(baseIds, openMenuAfter, attempt + 1);
          return;
        }


        // applyEquipment is heavy -> only every 30 ticks
        if (attempt % 30 === 0) {
          const eq = {
            inv: { entries: baseIds.map((b) => ({ baseId: b, count: 1, worn: true })) },
            numChanges: 0,
          };
          applyEquipment(player, eq);
          player.queueNiNodeUpdate();
        }


        // the verification is light -> runs every tick
        const todasEquipadas = baseIds.every((b) => {
          const form = this.sp.Game.getFormEx(b);
          return form ? player.isEquipped(form) : false;
        });

        if (!todasEquipadas && attempt < 300) {
          this.equipBeforeMenu(baseIds, openMenuAfter, attempt + 1);
          return;
        }

        logTrace(this, "equipBeforeMenu: Dressing applied (attempt=" + attempt + ")");

        if (openMenuAfter) {
          this.controller.emitter.emit("sendMessage", {
            message: {
              t: MsgType.CustomPacket,
              contentJsonDump: JSON.stringify({ customPacketType: "gearEquipped" }),
            },
            reliability: "reliable",
          });
        }

        this.equipStartingGear(baseIds, 0);
      } catch (e) {
        logTrace(this, "equipBeforeMenu ERROR: " + e);
      }
    });
  }


  // Keep the outfit worn during the race menu and reapply it when it closes.
  private equipStartingGear(baseIds: number[], attempt: number = 0): void {
    this.controller.once("update", () => {
      try {
        const player = this.sp.Game.getPlayer();
        if (!player) {
          if (attempt < 900) this.equipStartingGear(baseIds, attempt + 1);
          return;
        }


        // During the race menu: reapply the outfit + refresh visuals
        if (this.sp.Ui.isMenuOpen("RaceSex Menu")) {
          if (attempt % 20 === 0) {
            const outfitId = this.getMinerOutfitId();
            if (outfitId !== null) {
              const outfit = this.sp.Outfit.from(this.sp.Game.getFormEx(outfitId));
              if (outfit) {
                player.setOutfit(outfit, false);
                player.queueNiNodeUpdate();
              }
            }
          }
          if (attempt < 3000) this.equipStartingGear(baseIds, attempt + 1);
          return;
        }

        
        // Menu CLOSED: wait a bit and do the final equip
        const MIN_TICKS = 120;
        if (attempt < MIN_TICKS) {
          this.equipStartingGear(baseIds, attempt + 1);
          return;
        }

        const eq = {
          inv: { entries: baseIds.map((b) => ({ baseId: b, count: 1, worn: true })) },
          numChanges: 0,
        };
        applyEquipment(player, eq);
        logTrace(this, "equipStartingGear: Final Dressing applied (attempt=" + attempt + ")");
      } catch (e) {
        logTrace(this, "equipStartingGear ERROR: " + e);
      }
    });
  }

  // Browser

  private onBrowserMessage(e: BrowserMessageEvent): void {
    const eventKey = e.arguments[0];

    if (typeof eventKey === "string" && eventKey.indexOf("emote:") === 0) {
      const anim = eventKey.substring(6);
      this.closeEmotes();
      this.playEmote(anim);
      return;
    }

    if (eventKey === events.closeEmotes) {
      this.closeEmotes();
      return;
    }

    if (eventKey === events.mineProgress) {
      this.controller.emitter.emit("sendMessage", {
        message: {
          t: MsgType.CustomPacket,
          contentJsonDump: JSON.stringify({ customPacketType: "mineProgress" }),
        },
        reliability: "reliable",
      });
      return;
    }

    if (eventKey === events.closeMining) {
      this.stopMiningAnim();
      this.sp.browser.executeJavaScript(
        `document.getElementById('skymp-mining')?.remove(); window.dispatchEvent(new CustomEvent('skymp5-client:browserUnfocused', {}))`
      );
      this.sp.browser.setFocused(false);
      this.sp.browser.setVisible(false);
      return;
    }

    const isSelectOrCreate =
      eventKey === events.selectSlot0 ||
      eventKey === events.selectSlot1 ||
      eventKey === events.createNew;
    const isDelete =
      eventKey === events.deleteSlot0 ||
      eventKey === events.deleteSlot1;

    if (!isSelectOrCreate && !isDelete) return;

    if (isSelectOrCreate) {
      this.sp.browser.executeJavaScript(
        `document.getElementById('skymp-charselect')?.remove(); window.dispatchEvent(new CustomEvent('skymp5-client:browserUnfocused', {}))`
      );
      this.sp.browser.setFocused(false);
      this.sp.browser.setVisible(false);
    }

    this.controller.emitter.emit("sendMessage", {
      message: {
        t: MsgType.CustomPacket,
        contentJsonDump: JSON.stringify({
          customPacketType: "characterSelectionChoice",
          choice: eventKey,
        }),
      },
      reliability: "reliable",
    });
  }
}