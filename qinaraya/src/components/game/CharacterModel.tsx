import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { playerState } from "../../systems/player/playerState";

const TUNIC = "#d9784a";
const PANTS = "#5b4a3a";
const SKIN = "#f0c8a0";
const HAIR = "#3a2a20";
const BAG = "#c9a05a";

/**
 * Karakter placeholder bergaya stylized (kepala besar, proporsi ramah anak).
 * Model menghadap +Z. Animasi jalan dihitung dari kecepatan nyata, bukan input.
 */
export function CharacterModel() {
  const bodyRef = useRef<Group>(null);
  const torsoRef = useRef<Mesh>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const phase = useRef(0);
  const idleTime = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const speed = Math.hypot(playerState.vx, playerState.vz);
    phase.current += dt * speed * 2.4;
    idleTime.current += dt;

    const moving = Math.min(1, speed / 3.4);
    const amplitude = Math.min(0.9, speed * 0.18);
    const swing = Math.sin(phase.current) * amplitude;

    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.9;
    if (armR.current) armR.current.rotation.x = swing * 0.9;
    if (bodyRef.current) bodyRef.current.position.y = Math.abs(Math.cos(phase.current)) * 0.05 * moving;
    if (torsoRef.current) torsoRef.current.scale.y = 1 + Math.sin(idleTime.current * 2) * 0.018 * (1 - moving);
  });

  return (
    <group>
      {/* Bayangan bulat sederhana, jauh lebih murah daripada shadow map. */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
      </mesh>

      <group ref={bodyRef} scale={0.85}>
        <group ref={legL} position={[-0.13, 0.5, 0]}>
          <mesh position={[0, -0.24, 0]}>
            <capsuleGeometry args={[0.1, 0.28, 4, 8]} />
            <meshStandardMaterial color={PANTS} flatShading />
          </mesh>
        </group>
        <group ref={legR} position={[0.13, 0.5, 0]}>
          <mesh position={[0, -0.24, 0]}>
            <capsuleGeometry args={[0.1, 0.28, 4, 8]} />
            <meshStandardMaterial color={PANTS} flatShading />
          </mesh>
        </group>

        <mesh ref={torsoRef} position={[0, 0.82, 0]}>
          <capsuleGeometry args={[0.23, 0.22, 4, 10]} />
          <meshStandardMaterial color={TUNIC} flatShading />
        </mesh>

        <group ref={armL} position={[-0.31, 1.05, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.07, 0.24, 4, 8]} />
            <meshStandardMaterial color={TUNIC} flatShading />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <sphereGeometry args={[0.085, 10, 8]} />
            <meshStandardMaterial color={SKIN} flatShading />
          </mesh>
        </group>
        <group ref={armR} position={[0.31, 1.05, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.07, 0.24, 4, 8]} />
            <meshStandardMaterial color={TUNIC} flatShading />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <sphereGeometry args={[0.085, 10, 8]} />
            <meshStandardMaterial color={SKIN} flatShading />
          </mesh>
        </group>

        {/* Tas punggung: penanda visual arah belakang karakter. */}
        <mesh position={[0, 0.85, -0.3]}>
          <boxGeometry args={[0.34, 0.4, 0.16]} />
          <meshStandardMaterial color={BAG} flatShading />
        </mesh>

        <mesh position={[0, 1.43, 0]}>
          <sphereGeometry args={[0.3, 16, 12]} />
          <meshStandardMaterial color={SKIN} flatShading />
        </mesh>
        <mesh position={[0, 1.46, -0.01]} rotation={[-0.35, 0, 0]}>
          <sphereGeometry args={[0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial color={HAIR} flatShading />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.1, 1.44, 0.27]}>
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshStandardMaterial color="#2a2220" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
