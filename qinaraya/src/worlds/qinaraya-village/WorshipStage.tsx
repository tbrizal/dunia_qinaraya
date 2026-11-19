import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { worshipPerformance } from "../../systems/worship/performance";
import { WORSHIP_STAGES } from "./worshipStages";

/** Tikar salat sederhana di depan masjid. Hanya tampil saat aktivitas salat berlangsung. */
export function WorshipStage() {
  const mat = useRef<Group>(null);
  const stage = WORSHIP_STAGES.salat;

  useFrame(() => {
    if (!mat.current) return;
    const wp = worshipPerformance;
    mat.current.visible = wp.phase !== "idle" && wp.stage?.id === "salat";
  });

  return (
    <group ref={mat} position={[stage.x, 0.035, stage.z - 0.3]} visible={false}>
      <mesh>
        <boxGeometry args={[0.95, 0.02, 1.7]} />
        <meshStandardMaterial color="#3f7f78" flatShading />
      </mesh>
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.75, 0.012, 1.5]} />
        <meshStandardMaterial color="#e6d8b4" flatShading />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.6, 0.012, 1.35]} />
        <meshStandardMaterial color="#3f7f78" flatShading />
      </mesh>
    </group>
  );
}
