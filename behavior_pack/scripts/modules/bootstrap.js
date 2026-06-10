import { world, system } from "@minecraft/server";
import { VERSION } from "./config.js";
import { registerEvents } from "./events.js";
import { startTick } from "./tick.js";

export function initAutoNPC() {
  registerEvents();
  startTick();
  system.runTimeout(() => {
    try { for(const p of world.getAllPlayers()) p.sendMessage(`§b[AutoNPC]§r PlayerAI ${VERSION} modüler script yüklendi. Kitap gelmezse: npc kitap`); } catch(e) {}
  }, 20);
}
