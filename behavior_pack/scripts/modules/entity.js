import { world } from "@minecraft/server";
import { WORKER_ID, TAG_WORKER, VERSION } from "./config.js";
import { say, floor, dist } from "./utils.js";
import { getState, addInv, invText } from "./state.js";

export function isWorker(e){ return !!e && e.typeId === WORKER_ID; }
export function allWorkers() {
  const out=[];
  for (const d of ["overworld","nether","the_end"]) {
    try { for (const e of world.getDimension(d).getEntities({ type: WORKER_ID })) out.push(e); } catch(e) {}
  }
  return out;
}
export function nearestWorker(player, max=96) {
  let best, bd=max;
  for (const w of allWorkers()) {
    try { if (w.dimension.id !== player.dimension.id) continue; const d=dist(w.location, player.location); if(d<bd){ best=w; bd=d; } } catch(e) {}
  }
  return best;
}
export function nearestPlayerTo(worker,max=8){
  let best, bd=max;
  for (const p of world.getAllPlayers()) {
    try { if(p.dimension.id!==worker.dimension.id) continue; const d=dist(p.location, worker.location); if(d<bd){best=p;bd=d;} } catch(e) {}
  }
  return best;
}
export function updateName(worker, st) {
  try { worker.nameTag = `§bAutoNPC ${VERSION}§r\n§7${st.status}`; } catch(e) {}
}
export function spawnWorker(player) {
  try {
    const loc = { x: player.location.x + 1.5, y: player.location.y, z: player.location.z + 1.5 };
    const w = player.dimension.spawnEntity(WORKER_ID, loc);
    try { w.addTag(TAG_WORKER); } catch(e) {}
    const st = getState(w); st.owner = player.name; st.base = floor(player.location); st.status = "Doğdu, panel bekliyor";
    addInv(st, "minecraft:stick", 2);
    updateName(w, st);
    say(player, `AutoNPC PlayerAI ${VERSION} işçi oluşturuldu. Üzerine basılı tutunca Görev Paneli açılmalı. Envanter artık panel içindedir.`);
    return w;
  } catch(e) { say(player, `İşçi oluşturma hatası: ${e}`); return undefined; }
}
export function stateSummary(worker){ const st=getState(worker); return `Durum: ${st.status}\nMod: ${st.auto?"Otomatik":"Emir"}\nBase: ${st.base.x} ${st.base.y} ${st.base.z}\nGörev: ${st.task?.type ?? "yok"}\nKuyruk: ${st.taskQueue.length}\n\nEnvanter:\n${invText(st)}`; }
