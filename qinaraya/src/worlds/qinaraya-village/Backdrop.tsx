import { villageLayout } from "./villageLayout";

/** Bukit di kejauhan sebagai latar. Tersamarkan kabut agar terasa jauh. */
export function Backdrop() {
  return (
    <>
      {villageLayout.hills.map((h, i) => (
        <mesh key={i} position={[h.x, 0, h.z]} scale={[h.width, h.height, h.width]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color={h.color} flatShading />
        </mesh>
      ))}
    </>
  );
}
