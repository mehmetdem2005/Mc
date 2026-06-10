import { world, system, ItemStack } from "@minecraft/server";
import { FORBIDDEN_COLLECT, LOG_BLOCKS, LEAF_BLOCKS, ORES, STONE_BLOCKS } from "./config.js";

export function say(player, msg) { try { player.sendMessage(`§b[AutoNPC]§r ${msg}`); } catch(e) {} }
export function broadcast(msg) { try { world.sendMessage(`§b[AutoNPC]§r ${msg}`); } catch(e) {} }
export function floor(v) { return { x: Math.floor(v.x), y: Math.floor(v.y), z: Math.floor(v.z) }; }
export function key(pos) { return `${Math.floor(pos.x)},${Math.floor(pos.y)},${Math.floor(pos.z)}`; }
export function dist(a,b) { const dx=a.x-b.x, dy=(a.y??0)-(b.y??0), dz=a.z-b.z; return Math.sqrt(dx*dx+dy*dy+dz*dz); }
export function horizDist(a,b) { const dx=a.x-b.x, dz=a.z-b.z; return Math.sqrt(dx*dx+dz*dz); }
export function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
export function blockAt(dim,pos){ try { return dim.getBlock({x:Math.floor(pos.x), y:Math.floor(pos.y), z:Math.floor(pos.z)}); } catch(e) { return undefined; } }
export function blockIdAt(dim,pos){ return blockAt(dim,pos)?.typeId ?? "minecraft:air"; }
export function isAir(id){ return id === "minecraft:air" || id === "minecraft:cave_air" || id === "minecraft:void_air"; }
export function canonicalBlockId(raw) { let id=String(raw||"").trim().toLowerCase().replace(/ /g,"_"); if(!id) return ""; if(!id.includes(":")) id=`minecraft:${id}`; return id; }
export function parseTreeKey(raw) {
  const x = String(raw || "any").toLowerCase().replace(/ı/g,"i").replace(/ş/g,"s").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ö/g,"o").replace(/ç/g,"c").replace(/ /g,"_");
  if (["mese","oak","meşe"].includes(x)) return "oak";
  if (["hus","hushu","birch"].includes(x)) return "birch";
  if (["ladin","spruce"].includes(x)) return "spruce";
  if (["orman","jungle"].includes(x)) return "jungle";
  if (["akasya","acacia"].includes(x)) return "acacia";
  if (["koyu_mese","koyumese","dark_oak","darkoak"].includes(x)) return "dark_oak";
  if (["mangrov","mangrove"].includes(x)) return "mangrove";
  if (["kiraz","cherry"].includes(x)) return "cherry";
  return x || "any";
}
export function dropFor(id) {
  if (id === "minecraft:stone") return "minecraft:cobblestone";
  if (id === "minecraft:deepslate") return "minecraft:cobbled_deepslate";
  if (LOG_BLOCKS.includes(id)) return id;
  if (LEAF_BLOCKS.includes(id)) return id;
  for (const k of Object.keys(ORES)) if (ORES[k].ores.includes(id)) return ORES[k].drop;
  if (id === "minecraft:grass_block") return "minecraft:dirt";
  if (id === "minecraft:clay") return "minecraft:clay_ball";
  return id;
}
export function canCollect(id){ return !!id && !FORBIDDEN_COLLECT.has(id); }
export function playerInv(player){ try { return player.getComponent("minecraft:inventory")?.container; } catch(e) { return undefined; } }
export function addToContainer(container, typeId, amount=1) {
  try { const left = container.addItem(new ItemStack(typeId, amount)); return !left || left.amount === 0; } catch(e) { return false; }
}
export function takeOneHeld(player) {
  try {
    const inv = playerInv(player); if(!inv) return undefined;
    const slot = player.selectedSlotIndex ?? 0;
    const stack = inv.getItem(slot); if(!stack) return undefined;
    const out = { typeId: stack.typeId, amount: stack.amount, nameTag: stack.nameTag };
    if (stack.amount <= 1) inv.setItem(slot, undefined); else { stack.amount -= 1; inv.setItem(slot, stack); }
    return out;
  } catch(e) { return undefined; }
}
export function createNamedBook() {
  const s = new ItemStack("minecraft:book", 1);
  try { s.nameTag = "AutoNPC Yönetim Kitabı v2.0"; } catch(e) {}
  try { s.setLore(["AutoNPC v2.0", "Kitabı kullan veya chat'e npc yaz."]); } catch(e) {}
  return s;
}
export function isGuideItem(stack, guideId, guideName) {
  if (!stack) return false;
  if (stack.typeId === guideId) return true;
  if (stack.typeId === "minecraft:book" && String(stack.nameTag || "").includes("AutoNPC")) return true;
  if (stack.typeId === "minecraft:written_book" && String(stack.nameTag || "").includes("AutoNPC")) return true;
  return false;
}
export function scanNearestBlock(entity, predicate, radius=18) {
  const dim = entity.dimension; const base = floor(entity.location);
  let best, bd=999999;
  for (let y = -3; y <= 5; y++) for (let r=0; r<=radius; r++) {
    for (let dx=-r; dx<=r; dx++) for (let dz=-r; dz<=r; dz++) {
      if (Math.abs(dx)!==r && Math.abs(dz)!==r) continue;
      const pos = {x:base.x+dx, y:base.y+y, z:base.z+dz};
      const b = blockAt(dim,pos); if(!b) continue;
      if (!predicate(b.typeId, pos, b)) continue;
      const d = dist(base,pos); if (d < bd) { best = pos; bd = d; }
    }
    if (best) return best;
  }
  return best;
}
export function trySetBlockAir(dim,pos) { try { blockAt(dim,pos)?.setType("minecraft:air"); return true; } catch(e) { try { dim.runCommandAsync(`setblock ${Math.floor(pos.x)} ${Math.floor(pos.y)} ${Math.floor(pos.z)} air destroy`); return true; } catch(e2){ return false; } } }
export function spawnItem(dim,typeId,pos,amount=1) { try { dim.spawnItem(new ItemStack(typeId, amount), {x:pos.x+0.5,y:pos.y+0.5,z:pos.z+0.5}); return true; } catch(e) { return false; } }
export function defer(fn, ticks=1){ system.runTimeout(fn, ticks); }
