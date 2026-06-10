import { world, system } from "@minecraft/server";
import { GUIDE_ID, WORKER_ID, VERSION } from "./config.js";
import { ensureGuideOnSpawn, giveGuide, isGuide } from "./guide.js";
import { spawnWorker, nearestWorker, nearestPlayerTo } from "./entity.js";
import { openGuide, openWorkerPanel } from "./ui.js";
import { handleChat } from "./commands.js";
import { say } from "./utils.js";

export function registerEvents() {
  world.afterEvents.playerSpawn.subscribe(ev => { if(ev.player) ensureGuideOnSpawn(ev.player); });
  try { world.beforeEvents.itemUse.subscribe(ev => { if(isGuide(ev.itemStack)) { const p=ev.source; if(p) system.run(()=>openGuide(p)); } }); } catch(e) {}
  try { world.afterEvents.itemUse.subscribe(ev => { if(isGuide(ev.itemStack) && ev.source) openGuide(ev.source); }); } catch(e) {}
  try { world.beforeEvents.playerInteractWithEntity.subscribe(ev => { if(ev.target?.typeId === WORKER_ID && ev.player) system.run(()=>openWorkerPanel(ev.player, ev.target)); }); } catch(e) {}
  try { world.afterEvents.playerInteractWithEntity.subscribe(ev => { if(ev.target?.typeId === WORKER_ID && ev.player) openWorkerPanel(ev.player, ev.target); }); } catch(e) {}
  try { world.afterEvents.dataDrivenEntityTrigger.subscribe(ev => { if(ev.entity?.typeId === WORKER_ID) { const p = nearestPlayerTo(ev.entity, 8); if(p) openWorkerPanel(p, ev.entity); } }); } catch(e) {}
  try { world.afterEvents.scriptEventReceive.subscribe(ev => { const p = ev.sourceEntity?.typeId === "minecraft:player" ? ev.sourceEntity : world.getAllPlayers()[0]; if(!p) return; if(ev.id === "autonpcv20:give_book") giveGuide(p,true); if(ev.id === "autonpcv20:spawn_worker") spawnWorker(p); }); } catch(e) {}
  try { world.beforeEvents.chatSend.subscribe(ev => { if(handleChat(ev.sender, ev.message)) ev.cancel = true; }); } catch(e) {}
}
