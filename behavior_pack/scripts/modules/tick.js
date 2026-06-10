import { system } from "@minecraft/server";
import { TICK_INTERVAL } from "./config.js";
import { allWorkers, updateName } from "./entity.js";
import { getState, tickMemory } from "./state.js";
import { runTask } from "./actions.js";

let counter = 0;
export function startTick() {
  system.runInterval(() => {
    counter++;
    for(const w of allWorkers()) {
      try {
        const st = getState(w);
        tickMemory(st);
        runTask(w);
        if(counter % 10 === 0) updateName(w, st);
      } catch(e) {
        try { const st=getState(w); st.status = `Tick hata: ${String(e).slice(0,60)}`; updateName(w,st); } catch(e2) {}
      }
    }
  }, TICK_INTERVAL);
}
