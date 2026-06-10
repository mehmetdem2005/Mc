import { system, ItemStack } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { VERSION, GUIDE_NAME, TREE_TYPES, ORES, COMMON_BLOCKS } from "./config.js";
import { say, playerInv, addToContainer, canonicalBlockId, parseTreeKey, takeOneHeld } from "./utils.js";
import { spawnWorker, nearestWorker, stateSummary, updateName } from "./entity.js";
import { getState, addInv, removeInv, invText, setTask, stopAll } from "./state.js";
import { giveGuide } from "./guide.js";

function show(player, form, cb) {
  system.run(() => form.show(player).then(r => cb(r)).catch(e => say(player, `Panel hatası: ${e}`)));
}
export function openGuide(player) {
  const w = nearestWorker(player, 96);
  const form = new ActionFormData()
    .title(`§lAutoNPC PlayerAI ${VERSION}`)
    .body(`Modüler sürüm. Kod artık tek main.js içinde değil; guide/entity/ui/ai/actions modüllerine ayrıldı.\n\nYakın işçi: ${w ? "var" : "yok"}`)
    .button(`➕ İşçi oluştur ${VERSION}`)
    .button(w ? "🤖 Yakındaki işçi paneli" : "🤖 Yakında işçi yok")
    .button("📘 Kullanım kılavuzu")
    .button("🧪 Test / Durum")
    .button("📖 Kitabı tekrar ver");
  show(player, form, r => {
    if(r.canceled) return;
    if(r.selection===0) return spawnWorker(player);
    if(r.selection===1) { const nw=nearestWorker(player,96); return nw?openWorkerPanel(player,nw):say(player,"Yakında işçi yok."); }
    if(r.selection===2) return manual(player);
    if(r.selection===3) return testPanel(player);
    if(r.selection===4) return giveGuide(player,true);
  });
}
function manual(player) {
  const body = `1) Kitaptan işçi oluştur.\n2) İşçiye normal basılı tut: Görev Paneli Aç.\n3) Panelde envanteri aç/görev ver.\n4) Kitap gelmezse chat'e npc kitap yaz.\n5) Chat yedeği: npc işçi, npc panel, npc odun, npc blok stone 16, npc demir, npc yürü, npc oto.\n\nNot: v2.0'da NPC inventory component kaldırıldı; bu yüzden vanilla Aç/envanter ekranı değil, bizim panel açılmalı.`;
  show(player, new MessageFormData().title(`Kılavuz ${VERSION}`).body(body).button1("Kapat").button2("Ana menü"), r => { if(!r.canceled && r.selection===1) openGuide(player); });
}
function testPanel(player) {
  const w = nearestWorker(player,96);
  const body = `Sürüm: ${VERSION}\nScript: panel açıldıysa çalışıyor\nYakın işçi: ${w?"var":"yok"}\nKitap adı: ${GUIDE_NAME}\n\nKitap yine gelmezse bu sürüm vanilla kitap yedeği verir. Eski paketleri kapat: v1.4/v1.5/v1.6/v1.7/v1.8/v1.9.`;
  show(player, new MessageFormData().title(`Test ${VERSION}`).body(body).button1("Kapat").button2("İşçi oluştur"), r=>{ if(!r.canceled && r.selection===1) spawnWorker(player); });
}
export function openWorkerPanel(player, worker) {
  const st = getState(worker); updateName(worker, st);
  const form = new ActionFormData().title(`§lGörev Paneli ${VERSION}`).body(stateSummary(worker))
    .button("📦 Eldeki 1 eşyayı NPC'ye ver")
    .button("🎒 NPC envanterini aç")
    .button("🌳 Ağaç / odun görevi")
    .button("🍎 Sadece elma / yaprak kır")
    .button("🧱 Herhangi blok topla")
    .button("⛏️ Maden isteği")
    .button("🏠 Ev yap")
    .button(st.auto ? "🟢 Otomatik modu kapat" : "⚪ Otomatik modu aç")
    .button("🚶 Yürüme testi")
    .button("📍 Base'i buraya al")
    .button("🛑 Durdur")
    .button("🔄 Yenile");
  show(player, form, r => {
    if(r.canceled) return;
    if(r.selection===0) { giveHeld(player, st); return openWorkerPanel(player,worker); }
    if(r.selection===1) return inventoryPanel(player,worker);
    if(r.selection===2) return treeMenu(player,worker);
    if(r.selection===3) { st.auto=false; setTask(st,"gather_wood",{tree:"oak",amount:16,apples:true}); say(player,"Elma görevi: meşe/koyu meşe yaprakları da kırılacak."); return openWorkerPanel(player,worker); }
    if(r.selection===4) return blockMenu(player,worker);
    if(r.selection===5) return oreMenu(player,worker);
    if(r.selection===6) { st.auto=false; setTask(st,"build_house",{}); say(player,"Ev görevi verildi."); return openWorkerPanel(player,worker); }
    if(r.selection===7) { st.auto=!st.auto; st.task=undefined; st.status=st.auto?"Otomatik oyuncu modu":"Emir bekliyor"; say(player,`Otomatik mod: ${st.auto?"açık":"kapalı"}`); return openWorkerPanel(player,worker); }
    if(r.selection===8) { st.auto=false; setTask(st,"walk_test",{target:{x:player.location.x+6,y:player.location.y,z:player.location.z+6}}); say(player,"Yürüme testi verildi."); return openWorkerPanel(player,worker); }
    if(r.selection===9) { st.base={x:Math.floor(player.location.x),y:Math.floor(player.location.y),z:Math.floor(player.location.z)}; say(player,"Base ayarlandı."); return openWorkerPanel(player,worker); }
    if(r.selection===10) { stopAll(st); updateName(worker,st); return say(player,"Durduruldu."); }
    if(r.selection===11) return openWorkerPanel(player,worker);
  });
}
function giveHeld(player, st) {
  const one = takeOneHeld(player);
  if(!one) return say(player,"Elinde verilecek eşya yok.");
  addInv(st, one.typeId, 1);
  say(player, `NPC aldı: ${one.typeId} x1`);
}
function inventoryPanel(player, worker) {
  const st=getState(worker); const entries=Object.entries(st.inventory).filter(([,v])=>v>0);
  const form = new ActionFormData().title("NPC envanteri").body(invText(st,40));
  for(const [id,n] of entries) form.button(`Al: ${id.replace("minecraft:","")} x${n}`);
  form.button("⬅ Geri");
  show(player, form, r => {
    if(r.canceled) return;
    if(r.selection>=entries.length) return openWorkerPanel(player,worker);
    const [id] = entries[r.selection];
    const taken=removeInv(st,id,1); if(taken) { const inv=playerInv(player); if(inv && addToContainer(inv,id,1)) say(player,`${id} x1 aldın.`); else { addInv(st,id,1); say(player,"Oyuncu envanteri dolu."); } }
    return inventoryPanel(player,worker);
  });
}
function treeMenu(player, worker) {
  const keys=Object.keys(TREE_TYPES);
  const form = new ActionFormData().title("Hangi ağaç?").body("Ağaç topla deyince artık önce tür sorulur, sonra elma/yaprak sorulur.");
  for(const k of keys) form.button(TREE_TYPES[k].label);
  form.button("⬅ Geri");
  show(player, form, r=>{ if(r.canceled) return; if(r.selection>=keys.length) return openWorkerPanel(player,worker); return askApple(player,worker,keys[r.selection]); });
}
function askApple(player, worker, tree) {
  const form = new MessageFormData().title("Elma / yaprak?").body("Yaprakları da kırsın mı? Elma istiyorsan evet de. Hayır dersen sadece odun kırar, yapraklara dokunmaz.").button1("Hayır, sadece odun").button2("Evet, elma/yaprak da");
  show(player, form, r=>{ if(r.canceled) return; const st=getState(worker); st.auto=false; setTask(st,"gather_wood",{tree,amount:64,apples:r.selection===1}); say(player,`${TREE_TYPES[tree].label}: ${r.selection===1?"odun + elma/yaprak":"sadece odun"}.`); return openWorkerPanel(player,worker); });
}
function blockMenu(player, worker) {
  const form=new ActionFormData().title("Her bloğu toplama").body("Hazır blok seç veya özel ID yaz.");
  for(const [,label] of COMMON_BLOCKS) form.button(label);
  form.button("✍ Özel blok ID yaz");
  form.button("⬅ Geri");
  show(player, form, r=>{
    if(r.canceled) return; if(r.selection===COMMON_BLOCKS.length+1) return openWorkerPanel(player,worker);
    if(r.selection===COMMON_BLOCKS.length) return customBlockModal(player,worker);
    const [id]=COMMON_BLOCKS[r.selection]; const st=getState(worker); st.auto=false; setTask(st,"collect_block",{blockId:id,amount:32}); say(player,`Blok görevi: ${id}`); return openWorkerPanel(player,worker);
  });
}
function customBlockModal(player, worker) {
  const form=new ModalFormData().title("Özel blok").textField("Blok ID", "minecraft:sand", "minecraft:sand").textField("Miktar", "32", "32");
  show(player, form, r=>{ if(r.canceled) return; const id=canonicalBlockId(r.formValues[0]); const amount=Number(r.formValues[1])||32; const st=getState(worker); st.auto=false; setTask(st,"collect_block",{blockId:id,amount}); say(player,`Blok görevi: ${id} x${amount}`); return openWorkerPanel(player,worker); });
}
function oreMenu(player, worker) {
  const keys=Object.keys(ORES); const form=new ActionFormData().title("Maden isteği").body("Birden fazla çeşit için menüye tekrar girip ekleyebilirsin.");
  for(const k of keys) form.button(ORES[k].label);
  form.button("Tüm madenlerden iste"); form.button("⬅ Geri");
  show(player, form, r=>{ if(r.canceled) return; const st=getState(worker); st.auto=false; if(r.selection>=keys.length+1) return openWorkerPanel(player,worker); if(r.selection===keys.length){ for(const k of keys) st.taskQueue.push({type:"mine_ore",data:{group:k,amount:8},step:0}); st.task=undefined; say(player,"Tüm madenler kuyruğa eklendi."); return openWorkerPanel(player,worker); } setTask(st,"mine_ore",{group:keys[r.selection],amount:16}); say(player,`${ORES[keys[r.selection]].label} görevi verildi.`); return openWorkerPanel(player,worker); });
}
