import { ItemStack, system } from "@minecraft/server";
import { GUIDE_ID, GUIDE_NAME, TAG_GOT_GUIDE, VERSION } from "./config.js";
import { playerInv, say, createNamedBook, addToContainer, isGuideItem } from "./utils.js";

function hasGuide(player) {
  const inv = playerInv(player); if(!inv) return false;
  for(let i=0;i<inv.size;i++) if(isGuideItem(inv.getItem(i), GUIDE_ID, GUIDE_NAME)) return true;
  return false;
}
export function giveGuide(player, force=false) {
  const inv = playerInv(player); if(!inv) { say(player, "Envanter okunamadı; kitap verilemedi."); return false; }
  if(!force && hasGuide(player)) return true;
  let ok=false;
  try { ok = addToContainer(inv, GUIDE_ID, 1); } catch(e) { ok=false; }
  if(!ok) {
    try { const left = inv.addItem(createNamedBook()); ok = !left || left.amount === 0; } catch(e) { ok=false; }
  }
  if(ok) {
    try { player.addTag(TAG_GOT_GUIDE); } catch(e) {}
    say(player, `${GUIDE_NAME} verildi. Custom item çalışmazsa bu normal kitap yedeği de panel açar.`);
  } else say(player, "Kitap verilemedi. Envanter dolu olabilir; chat'e npc yazabilirsin.");
  return ok;
}
export function ensureGuideOnSpawn(player) {
  system.runTimeout(()=>{ try { if(!hasGuide(player)) giveGuide(player, true); } catch(e) {} }, 40);
}
export function isGuide(stack) { return isGuideItem(stack, GUIDE_ID, GUIDE_NAME); }
