import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { dampFactor, wrapAngle } from "../../systems/movement/movementMath";
import { playerState } from "../../systems/player/playerState";
import { finishPerformance, worshipPerformance } from "../../systems/worship/performance";
import { ClipPlayer } from "../../systems/worship/poseLibrary";
import { PLAYER_PALETTE } from "./CharacterModel";
import { applyPose, createWorshipRig } from "./worshipRig";

/**
 * Karakter pemain saat melakukan wudu atau salat. Menggantikan model jalan selama aktivitas,
 * berjalan mulus ke tempatnya, lalu memutar klip animasi dari panduan. Fase idle: tersembunyi.
 */
export function WorshipPerformer() {
  const rig = useMemo(() => {
    const r = createWorshipRig(PLAYER_PALETTE, 0.85);
    r.root.visible = false;
    return r;
  }, []);
  const player = useMemo(() => new ClipPlayer(), []);
  const local = useRef({ phase: "idle" as string, token: -1, x: 0, z: 0, heading: 0 });

  useFrame((_, delta) => {
    const wp = worshipPerformance;
    const s = local.current;
    if (wp.phase === "idle") {
      rig.root.visible = false;
      s.phase = "idle";
      return;
    }
    const stage = wp.stage;
    if (!stage) return;
    const dt = Math.min(delta, 0.05);

    if (s.phase === "idle") {
      // Mulai dari tempat pemain berdiri, lalu berjalan halus ke tempat aktivitas.
      s.x = playerState.x;
      s.z = playerState.z;
      s.heading = playerState.heading;
      s.token = -1;
      player.reset();
      rig.root.visible = true;
    }
    s.phase = wp.phase;

    const k = dampFactor(4, dt);
    s.x += (stage.x - s.x) * k;
    s.z += (stage.z - s.z) * k;
    s.heading = wrapAngle(s.heading + wrapAngle(stage.heading - s.heading) * k);

    if (wp.clipToken !== s.token) {
      s.token = wp.clipToken;
      player.play(wp.clip);
    }
    applyPose(rig, player.update(dt));
    rig.root.position.set(s.x, 0, s.z);
    rig.root.rotation.y = s.heading;

    const arrived = Math.hypot(stage.x - s.x, stage.z - s.z) < 0.05;
    if (wp.phase === "returning" && player.finished && arrived) {
      finishPerformance();
      rig.root.visible = false;
      s.phase = "idle";
    }
  });

  return <primitive object={rig.root} />;
}
