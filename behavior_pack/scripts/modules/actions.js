import { LOG_BLOCKS, LEAF_BLOCKS, TREE_TYPES, APPLE_LEAVES, SAFE_BREAK_TICKS, STONE_BLOCKS, ORES } from "./config.js";
import { blockIdAt, scanNearestBlock, trySetBlockAir, spawnItem, dropFor, dist, canCollect, canonicalBlockId, say } from "./utils.js";
import { getState, addInv, countInv, removeInv, setTask, nextTask, isBlacklisted, rememberBlock } from "./state.js";
import { moveToward, watchStuck } from "./movement.js";
import { updateName } from "./entity.js";

function finish(worker, st, msg) { st.status = msg; st.breaking=undefined; nextTask(st); updateName(worker,st); }
function breakTimed(worker, st, pos, dropId, xpKey="mining") {
  if (!st.breaking || st.breaking.key !== `${pos.x},${pos.y},${pos.z}`) st.breaking = { key:`${pos.x},${pos.y},${pos.z}`, pos, ticks:0 };
  st.breaking.ticks++;
  st.status = `Kırıyor... ${st.breaking.ticks}/${SAFE_BREAK_TICKS}`;
  if (st.breaking.ticks < SAFE_BREAK_TICKS) return false;
  const id = blockIdAt(worker.dimension,pos);
  if (id && id !== "minecraft:air") {
    trySetBlockAir(worker.dimension,pos);
    if (dropId && dropId !== "minecraft:air") { spawnItem(worker.dimension,dropId,pos,1); addInv(st, dropId, 1); }
    if(st.skills[xpKey] !== undefined) st.skills[xpKey]++;
  }
  st.breaking = undefined;
  return true;
}
function requireWoodTools(worker, st, neededTool="wood") {
  const hasWoodPick = countInv(st,"minecraft:wooden_pickaxe")>0 || countInv(st,"minecraft:stone_pickaxe")>0 || countInv(st,"minecraft:iron_pickaxe")>0;
  const hasStonePick = countInv(st,"minecraft:stone_pickaxe")>0 || countInv(st,"minecraft:iron_pickaxe")>0;
  const hasIronPick = countInv(st,"minecraft:iron_pickaxe")>0;
  if(neededTool === "wood" && hasWoodPick) return true;
  if(neededTool === "stone" && hasStonePick) return true;
  if(neededTool === "iron" && hasIronPick) return true;
  if(countInv(st,"minecraft:stick") < 2 || countInv(st,"minecraft:oak_planks") < 3) {
    st.taskQueue.unshift(st.task);
    setTask(st,"gather_wood",{tree:"any",amount:8,apples:false,reason:"tool"});
    return false;
  }
  if(neededTool === "wood") { removeInv(st,"minecraft:stick",2); removeInv(st,"minecraft:oak_planks",3); addInv(st,"minecraft:wooden_pickaxe",1); st.skills.crafting++; return true; }
  if(countInv(st,"minecraft:cobblestone") < 3 && countInv(st,"minecraft:cobbled_deepslate") < 3) {
    if(!hasWoodPick) { removeInv(st,"minecraft:stick",2); removeInv(st,"minecraft:oak_planks",3); addInv(st,"minecraft:wooden_pickaxe",1); }
    st.taskQueue.unshift(st.task);
    setTask(st,"collect_block",{blockId:"minecraft:stone",amount:3});
    return false;
  }
  if(neededTool === "stone") { removeInv(st,"minecraft:stick",2); removeInv(st,"minecraft:cobblestone",3) || removeInv(st,"minecraft:cobbled_deepslate",3); addInv(st,"minecraft:stone_pickaxe",1); st.skills.crafting++; return true; }
  if(countInv(st,"minecraft:raw_iron") < 3 && countInv(st,"minecraft:iron_ingot") < 3) {
    st.taskQueue.unshift(st.task);
    setTask(st,"mine_ore",{group:"iron",amount:3});
    return false;
  }
  removeInv(st,"minecraft:stick",2); removeInv(st,"minecraft:iron_ingot",3) || removeInv(st,"minecraft:raw_iron",3); addInv(st,"minecraft:iron_pickaxe",1); st.skills.crafting++; return true;
}
export function runTask(worker) {
  const st = getState(worker);
  if(!st.task) { if(st.auto) chooseAutoTask(st); else return; }
  const t = st.task; if(!t) return;
  if(t.type === "gather_wood") return actionGatherWood(worker,st,t.data);
  if(t.type === "collect_block") return actionCollectBlock(worker,st,t.data);
  if(t.type === "collect_leaves") return actionCollectLeaves(worker,st,t.data);
  if(t.type === "mine_ore") return actionMineOre(worker,st,t.data);
  if(t.type === "walk_test") return actionWalk(worker,st,t.data);
  if(t.type === "build_house") return actionBuildHouse(worker,st,t.data);
  finish(worker, st, `Bilinmeyen görev geçti: ${t.type}`);
}
function chooseAutoTask(st) {
  if(countInv(st,"minecraft:oak_log") + countInv(st,"minecraft:oak_planks") < 8) return setTask(st,"gather_wood",{tree:"any",amount:16,apples:false});
  if(countInv(st,"minecraft:cobblestone") < 8) return setTask(st,"collect_block",{blockId:"minecraft:stone",amount:8});
  return setTask(st,"mine_ore",{group:"iron",amount:8});
}
export function actionGatherWood(worker, st, data) {
  const tree = TREE_TYPES[data.tree || "any"] || TREE_TYPES.any;
  const amount = data.amount ?? 32;
  const current = tree.logs.reduce((n,id)=>n+countInv(st,id),0);
  if(current >= amount) return finish(worker, st, `Odun tamamlandı x${current}`);
  let target = data.target;
  if(!target || !tree.logs.includes(blockIdAt(worker.dimension,target)) || isBlacklisted(st,target)) {
    target = scanNearestBlock(worker, (id,pos)=> tree.logs.includes(id) && !isBlacklisted(st,pos));
    data.target = target;
    if(!target) { st.status = `${tree.label} aranıyor`; return; }
    rememberBlock(st, blockIdAt(worker.dimension,target), target);
  }
  if(dist(worker.location,target)>2.2) { st.status = `${tree.label} ağacına yürüyor`; moveToward(worker,target,0.13); watchStuck(worker,target); return; }
  const id = blockIdAt(worker.dimension,target);
  if(tree.logs.includes(id)) {
    if(breakTimed(worker,st,target,dropFor(id),"woodcutting")) {
      // Aynı gövdeyi yukarı doğru sürdür.
      const up = {x:target.x,y:target.y+1,z:target.z};
      data.target = tree.logs.includes(blockIdAt(worker.dimension,up)) ? up : undefined;
      // Yaprak/elma istenirse gövde bittikten sonra yaprak görevi kuyruğa ekle.
      if(!data.target && data.apples) st.taskQueue.unshift({type:"collect_leaves",data:{center:target,leaves:tree.leaves,amount:24}});
    }
    return;
  }
  data.target = undefined;
}
export function actionCollectBlock(worker, st, data) {
  const blockId = canonicalBlockId(data.blockId || "minecraft:stone");
  const amount = data.amount ?? 32;
  const drop = dropFor(blockId);
  if(countInv(st,drop) >= amount) return finish(worker,st,`${blockId} toplama tamamlandı`);
  if(!canCollect(blockId)) return finish(worker,st,`Yasak/boş blok: ${blockId}`);
  let target = data.target;
  if(!target || blockIdAt(worker.dimension,target) !== blockId || isBlacklisted(st,target)) {
    target = scanNearestBlock(worker, (id,pos)=> id===blockId && !isBlacklisted(st,pos));
    data.target = target;
    if(!target) { st.status = `${blockId} aranıyor`; return; }
  }
  if(STONE_BLOCKS.includes(blockId) && !requireWoodTools(worker,st,"wood")) return;
  if(dist(worker.location,target)>2.3) { st.status = `${blockId} bloğuna yürüyor`; moveToward(worker,target,0.13); watchStuck(worker,target); return; }
  if(breakTimed(worker,st,target,drop,"mining")) data.target = undefined;
}
export function actionMineOre(worker, st, data) {
  const ore = ORES[data.group || "iron"] || ORES.iron;
  const amount = data.amount ?? 8;
  if(countInv(st,ore.drop) >= amount) return finish(worker,st,`${ore.label} tamamlandı`);
  if(!requireWoodTools(worker,st,ore.tool)) return;
  let target = data.target;
  if(!target || !ore.ores.includes(blockIdAt(worker.dimension,target)) || isBlacklisted(st,target)) {
    target = scanNearestBlock(worker, (id,pos)=> ore.ores.includes(id) && !isBlacklisted(st,pos), 24);
    data.target = target;
    if(!target) {
      // Gerçek tünel simülasyonu: yakın taşı kazarak arar.
      st.status = `${ore.label} için tünel kazıyor`;
      st.taskQueue.unshift(st.task);
      setTask(st,"collect_block",{blockId:"minecraft:stone",amount:countInv(st,"minecraft:cobblestone")+1});
      return;
    }
  }
  if(dist(worker.location,target)>2.3) { st.status = `${ore.label} cevherine yürüyor`; moveToward(worker,target,0.13); watchStuck(worker,target); return; }
  if(breakTimed(worker,st,target,ore.drop,"mining")) data.target = undefined;
}
export function actionWalk(worker, st, data) {
  const target = data.target || st.base;
  if(dist(worker.location,target)<1.5) return finish(worker,st,"Yürüme testi tamamlandı");
  st.status = "Yürüme testi: normal hareket deneniyor";
  moveToward(worker,target,0.16); watchStuck(worker,target);
}
export function actionBuildHouse(worker, st, data) {
  const needWood = 20, needStone = 16;
  if(countInv(st,"minecraft:oak_log") + countInv(st,"minecraft:oak_planks") < needWood) { st.taskQueue.unshift(st.task); return setTask(st,"gather_wood",{tree:"any",amount:needWood,apples:false}); }
  if(countInv(st,"minecraft:cobblestone") < needStone) { st.taskQueue.unshift(st.task); return setTask(st,"collect_block",{blockId:"minecraft:stone",amount:needStone}); }
  const base = st.base; const dim = worker.dimension;
  const blocks = [];
  for(let x=-2;x<=2;x++) for(let z=-2;z<=2;z++) blocks.push([x,0,z,"minecraft:oak_planks"]);
  for(let y=1;y<=3;y++) for(let x=-2;x<=2;x++) for(let z=-2;z<=2;z++) if(Math.abs(x)===2 || Math.abs(z)===2) blocks.push([x,y,z,y===3?"minecraft:oak_planks":"minecraft:cobblestone"]);
  for(let x=-2;x<=2;x++) for(let z=-2;z<=2;z++) blocks.push([x,4,z,"minecraft:oak_planks"]);
  const i = data.index ?? 0;
  if(i>=blocks.length) return finish(worker,st,"Ev tamamlandı");
  const [x,y,z,id]=blocks[i];
  try { dim.getBlock({x:base.x+x,y:base.y+y,z:base.z+z})?.setType(id); data.index=i+1; st.status=`Ev yapıyor ${i}/${blocks.length}`; st.skills.building++; } catch(e){ data.index=i+1; }
}

export function actionCollectLeaves(worker, st, data) {
  const leaves = data.leaves || LEAF_BLOCKS;
  const amount = data.amount ?? 16;
  const appleBefore = countInv(st,"minecraft:apple");
  if(countInv(st,"minecraft:apple") >= (data.appleAmount ?? 1) || (data.done ?? 0) >= amount) return finish(worker,st,"Yaprak/elma toplama tamamlandı");
  let target = data.target;
  if(!target || !leaves.includes(blockIdAt(worker.dimension,target)) || isBlacklisted(st,target)) {
    target = scanNearestBlock(worker, (id,pos)=> leaves.includes(id) && !isBlacklisted(st,pos), 8);
    data.target = target;
    if(!target) return finish(worker,st,"Yakında yaprak kalmadı");
  }
  if(dist(worker.location,target)>2.7) { st.status="Yapraklara yürüyor"; moveToward(worker,target,0.13); watchStuck(worker,target); return; }
  const id = blockIdAt(worker.dimension,target);
  const drop = APPLE_LEAVES.has(id) && Math.random() < 0.12 ? "minecraft:apple" : "minecraft:air";
  if(breakTimed(worker,st,target,drop,"woodcutting")) { data.done=(data.done??0)+1; data.target=undefined; }
}
