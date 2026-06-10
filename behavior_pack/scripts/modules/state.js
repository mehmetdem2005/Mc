import { TAG_WORKER, WORKER_ID, VERSION } from "./config.js";
import { floor, key } from "./utils.js";

const states = new Map();

export function createDefaultState(worker, ownerName="") {
  return {
    version: VERSION,
    id: worker?.id ?? Math.random().toString(36).slice(2),
    owner: ownerName,
    base: worker ? floor(worker.location) : {x:0,y:0,z:0},
    status: "Emir bekliyor",
    task: undefined,
    taskQueue: [],
    inventory: {},
    memory: { blocks: {}, blacklist: {}, failedTargets: 0, lastPos: undefined, stuckTicks: 0 },
    skills: { mining: 0, woodcutting: 0, building: 0, crafting: 0, explore: 0 },
    auto: false,
    profile: "survival",
    breaking: undefined,
    cooldown: 0
  };
}
export function getState(worker) {
  if (!worker) return undefined;
  let st = states.get(worker.id);
  if (!st) { st = createDefaultState(worker); states.set(worker.id, st); }
  return st;
}
export function deleteState(worker){ if(worker) states.delete(worker.id); }
export function allStates(){ return states; }
export function setTask(st, type, data={}) { st.task = { type, data, step: 0, started: Date.now() }; st.breaking = undefined; st.status = `Görev: ${type}`; }
export function queueTask(st, type, data={}) { st.taskQueue.push({ type, data, step: 0 }); if(!st.task) nextTask(st); }
export function nextTask(st){ st.breaking=undefined; st.task = st.taskQueue.shift(); if (st.task) st.status = `Görev: ${st.task.type}`; else st.status = st.auto ? "Otomatik mod" : "Emir bekliyor"; }
export function stopAll(st){ st.task=undefined; st.taskQueue=[]; st.breaking=undefined; st.auto=false; st.status="Durduruldu"; }
export function addInv(st, item, amount=1) { if(!item || item==="minecraft:air") return; st.inventory[item] = (st.inventory[item] ?? 0) + amount; }
export function removeInv(st, item, amount=1) { const have=st.inventory[item] ?? 0; const take=Math.min(have, amount); if(take<=0) return 0; st.inventory[item]=have-take; if(st.inventory[item]<=0) delete st.inventory[item]; return take; }
export function countInv(st,item){ return st.inventory[item] ?? 0; }
export function invText(st, limit=20){ const e=Object.entries(st.inventory).filter(([,n])=>n>0).slice(0,limit); return e.length ? e.map(([k,v])=>`${k.replace("minecraft:","")} x${v}`).join("\n") : "boş"; }
export function rememberBlock(st,id,pos){ if(!id) return; if(!st.memory.blocks[id]) st.memory.blocks[id]=[]; const arr=st.memory.blocks[id]; const k=key(pos); if(!arr.some(p=>key(p)===k)) arr.push({x:Math.floor(pos.x),y:Math.floor(pos.y),z:Math.floor(pos.z)}); if(arr.length>40) arr.shift(); }
export function blacklist(st,pos,ticks=600){ st.memory.blacklist[key(pos)] = ticks; st.memory.failedTargets++; }
export function isBlacklisted(st,pos){ return (st.memory.blacklist[key(pos)] ?? 0) > 0; }
export function tickMemory(st){ for(const k of Object.keys(st.memory.blacklist)){ st.memory.blacklist[k]--; if(st.memory.blacklist[k]<=0) delete st.memory.blacklist[k]; } }
