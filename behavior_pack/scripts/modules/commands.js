import { VERSION, ORES } from "./config.js";
import { say, canonicalBlockId, parseTreeKey } from "./utils.js";
import { giveGuide } from "./guide.js";
import { spawnWorker, nearestWorker, stateSummary } from "./entity.js";
import { getState, setTask, stopAll } from "./state.js";
import { openGuide, openWorkerPanel } from "./ui.js";

export function handleChat(player, message) {
  const msg = String(message || "").trim().toLowerCase();
  if(!(msg === "npc" || msg.startsWith("npc "))) return false;
  const parts = msg.split(/\s+/g); const cmd = parts[1] || "yardım";
  if(["yardım","help","?"].includes(cmd)) { say(player, `${VERSION}: npc kitap | npc işçi | npc panel | npc odun [ağaç] [miktar] [elma] | npc blok <id> <miktar> | npc demir | npc elmas | npc yürü | npc oto | npc durum | npc dur`); return true; }
  if(["kitap","book"].includes(cmd)) { giveGuide(player,true); return true; }
  if(["işçi","isci","worker","spawn"].includes(cmd)) { spawnWorker(player); return true; }
  if(["menu","menü","panel"].includes(cmd)) { const w=nearestWorker(player,96); w?openWorkerPanel(player,w):openGuide(player); return true; }
  const w=nearestWorker(player,96); if(!w) { say(player,"Yakında v2.0 işçi yok. 'npc işçi' yaz."); return true; }
  const st=getState(w);
  if(["durum","status","test"].includes(cmd)) { say(player, stateSummary(w).replace(/\n/g," | ")); return true; }
  if(["dur","stop"].includes(cmd)) { stopAll(st); say(player,"Durduruldu."); return true; }
  if(["oto","auto"].includes(cmd)) { st.auto=!st.auto; st.task=undefined; st.status=st.auto?"Otomatik mod":"Emir bekliyor"; say(player,`Otomatik: ${st.auto?"açık":"kapalı"}`); return true; }
  if(["yürü","yuru","walk"].includes(cmd)) { setTask(st,"walk_test",{target:{x:player.location.x+6,y:player.location.y,z:player.location.z+6}}); say(player,"Yürüme testi verildi."); return true; }
  if(["odun","wood","ağaç","agac"].includes(cmd)) { const tree=parseTreeKey(parts[2]||"any"); const amount=Number(parts[3])||64; const apples=parts.includes("elma")||parts.includes("apple"); setTask(st,"gather_wood",{tree,amount,apples}); say(player,`Odun görevi: ${tree} x${amount}, elma=${apples?"evet":"hayır"}`); return true; }
  if(["elma","apple"].includes(cmd)) { setTask(st,"gather_wood",{tree:"oak",amount:16,apples:true}); say(player,"Elma/yaprak görevi verildi."); return true; }
  if(["blok","block","topla"].includes(cmd)) { const id=canonicalBlockId(parts[2]||"stone"); const amount=Number(parts[3])||32; setTask(st,"collect_block",{blockId:id,amount}); say(player,`Blok görevi: ${id} x${amount}`); return true; }
  if(ORES[cmd]) { setTask(st,"mine_ore",{group:cmd,amount:Number(parts[2])||16}); say(player,`${ORES[cmd].label} görevi verildi.`); return true; }
  if(["demir","iron"].includes(cmd)) { setTask(st,"mine_ore",{group:"iron",amount:Number(parts[2])||16}); say(player,"Demir görevi verildi."); return true; }
  if(["elmas","diamond"].includes(cmd)) { setTask(st,"mine_ore",{group:"diamond",amount:Number(parts[2])||8}); say(player,"Elmas görevi verildi."); return true; }
  if(["ev","house"].includes(cmd)) { setTask(st,"build_house",{}); say(player,"Ev görevi verildi."); return true; }
  say(player,"Komut anlaşılmadı. npc yardım yaz."); return true;
}
