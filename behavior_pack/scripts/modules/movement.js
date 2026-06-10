import { horizDist, clamp } from "./utils.js";
import { getState, blacklist } from "./state.js";
import { STEP_POWER } from "./config.js";

export function moveToward(worker, target, speed=STEP_POWER) {
  const loc = worker.location;
  const dx = target.x + 0.5 - loc.x;
  const dz = target.z + 0.5 - loc.z;
  const d = Math.sqrt(dx*dx + dz*dz);
  if (d < 0.9) return true;
  const nx = dx / d, nz = dz / d;
  let moved = false;
  try { worker.applyImpulse({ x: nx * speed, y: 0, z: nz * speed }); moved = true; } catch(e) {}
  if(!moved) {
    try { worker.applyKnockback(nx, nz, speed * 2.0, 0.02); moved = true; } catch(e) {}
  }
  try {
    const yaw = Math.atan2(-nx, nz) * 180 / Math.PI;
    worker.tryTeleport(worker.location, { dimension: worker.dimension, rotation: { x: 0, y: yaw } });
  } catch(e) {}
  return false;
}
export function watchStuck(worker, target) {
  const st = getState(worker);
  const now = worker.location;
  const last = st.memory.lastPos;
  if(last && horizDist(now,last) < 0.04 && target && horizDist(now,target) > 1.5) st.memory.stuckTicks++; else st.memory.stuckTicks = 0;
  st.memory.lastPos = {x:now.x,y:now.y,z:now.z};
  if(st.memory.stuckTicks > 50 && target) {
    blacklist(st, target, 500);
    st.memory.stuckTicks = 0;
    // Son çare küçük rota kırma; sürekli teleport değil, sadece takılınca.
    try { worker.tryTeleport({x: now.x + 0.8, y: now.y + 0.05, z: now.z + 0.8}, {dimension: worker.dimension}); } catch(e) {}
    return true;
  }
  return false;
}
