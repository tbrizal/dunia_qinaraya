import { Vector3 } from "three";
import { applyPose, createWorshipRig } from "../src/components/game/worshipRig.ts";
import type { MarkerName } from "../src/components/game/worshipRig.ts";
import { SOLVED_POSES } from "../src/systems/worship/poseLibrary.generated.ts";
import { NEUTRAL } from "../src/systems/worship/poses.ts";
import { mirrorRightToLeft } from "../src/systems/worship/poses.ts";

/** Alat pengembangan: mencetak posisi titik tubuh tiap pose terselesaikan. Jalankan: npm run poses:inspect [id] */
const rig = createWorshipRig({ tunic: "#000", pants: "#000", hair: "#000", skin: "#000", bag: "#000" }, 1);
const v = new Vector3();
const names: MarkerName[] = ["pelvis", "headTop", "forehead", "nose", "chest", "handR", "handL", "kneeR", "kneeL", "ankleR", "ankleL", "toeR", "toeL", "heelR", "heelL"];
const only = process.argv[2];
for (const [id, pose] of Object.entries(SOLVED_POSES)) {
  if (only && id !== only) continue;
  applyPose(rig, { ...NEUTRAL, ...pose });
  rig.root.updateMatrixWorld(true);
  const parts = names.map((n) => {
    rig.markers[n].getWorldPosition(v);
    return `${n}(${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)})`;
  });
  console.log(`== ${id}\n  ${parts.slice(0, 5).join(" ")}\n  ${parts.slice(5, 10).join(" ")}\n  ${parts.slice(10).join(" ")}\n  ${JSON.stringify(pose)}`);
}
void mirrorRightToLeft;
