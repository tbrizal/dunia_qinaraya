import { useInteractionStore } from "../../stores/useInteractionStore";
import { villageInteractables } from "./interactables";

const MARKER = "#f6e7b4";

/** Penanda lembut pada target interaksi saat ini: bingkai untuk petak, cincin untuk NPC. */
export function TargetMarker() {
  const target = useInteractionStore((s) => s.target);
  const found = target ? villageInteractables.find((i) => i.kind === target.kind && i.id === target.id) : undefined;
  if (!found) return null;

  if (found.kind === "npc") {
    return (
      <mesh position={[found.x, 0.06, found.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.85, 28]} />
        <meshBasicMaterial color={MARKER} transparent opacity={0.85} depthWrite={false} polygonOffset polygonOffsetFactor={-5} />
      </mesh>
    );
  }

  const t = 0.1;
  const y = 0.2;
  const edges: [number, number, number, number][] = [
    [0, -found.d / 2, found.w + t, t],
    [0, found.d / 2, found.w + t, t],
    [-found.w / 2, 0, t, found.d + t],
    [found.w / 2, 0, t, found.d + t],
  ];
  return (
    <group position={[found.cx, y, found.cz]}>
      {edges.map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w, d]} />
          <meshBasicMaterial color={MARKER} transparent opacity={0.9} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
