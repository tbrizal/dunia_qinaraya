import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import type { Accessory, CharacterPalette } from "../../data/npcs";
import { playerState } from "../../systems/player/playerState";

export const PLAYER_PALETTE: CharacterPalette = {
  tunic: "#d9784a",
  pants: "#5b4a3a",
  hair: "#3a2a20",
  skin: "#f0c8a0",
  bag: "#c9a05a",
};

const playerSpeed = () => Math.hypot(playerState.vx, playerState.vz);
const idleSpeed = () => 0;

interface CharacterModelProps {
  palette?: CharacterPalette;
  accessory?: Accessory;
  /** Sumber kecepatan untuk animasi jalan. NPC diam memakai idle. */
  getSpeed?: () => number;
}

/**
 * Karakter placeholder bergaya stylized (kepala besar, proporsi ramah anak).
 * Model menghadap +Z. Animasi jalan dihitung dari kecepatan nyata, bukan input.
 */
export function CharacterModel({ palette = PLAYER_PALETTE, accessory = "none", getSpeed = playerSpeed }: CharacterModelProps) {
  const bodyRef = useRef<Group>(null);
  const torsoRef = useRef<Mesh>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const phase = useRef(0);
  const idleTime = useRef(Math.random() * 6);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const speed = getSpeed();
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
        {[
          { ref: legL, x: -0.13 },
          { ref: legR, x: 0.13 },
        ].map((leg) => (
          <group key={leg.x} ref={leg.ref} position={[leg.x, 0.5, 0]}>
            <mesh position={[0, -0.24, 0]}>
              <capsuleGeometry args={[0.1, 0.28, 4, 8]} />
              <meshStandardMaterial color={palette.pants} flatShading />
            </mesh>
          </group>
        ))}

        <mesh ref={torsoRef} position={[0, 0.82, 0]}>
          <capsuleGeometry args={[0.23, 0.22, 4, 10]} />
          <meshStandardMaterial color={palette.tunic} flatShading />
        </mesh>

        {[
          { ref: armL, x: -0.31 },
          { ref: armR, x: 0.31 },
        ].map((arm) => (
          <group key={arm.x} ref={arm.ref} position={[arm.x, 1.05, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.07, 0.24, 4, 8]} />
              <meshStandardMaterial color={palette.tunic} flatShading />
            </mesh>
            <mesh position={[0, -0.42, 0]}>
              <sphereGeometry args={[0.085, 10, 8]} />
              <meshStandardMaterial color={palette.skin} flatShading />
            </mesh>
          </group>
        ))}

        {/* Tas punggung: penanda visual arah belakang karakter. */}
        <mesh position={[0, 0.85, -0.3]}>
          <boxGeometry args={[0.34, 0.4, 0.16]} />
          <meshStandardMaterial color={palette.bag} flatShading />
        </mesh>

        <mesh position={[0, 1.43, 0]}>
          <sphereGeometry args={[0.3, 16, 12]} />
          <meshStandardMaterial color={palette.skin} flatShading />
        </mesh>
        <mesh position={[0, 1.46, -0.01]} rotation={[-0.35, 0, 0]}>
          <sphereGeometry args={[0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial color={palette.hair} flatShading />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.1, 1.44, 0.27]}>
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshStandardMaterial color="#2a2220" />
          </mesh>
        ))}

        {accessory === "peci" && (
          <mesh position={[0, 1.7, 0]}>
            <cylinderGeometry args={[0.24, 0.27, 0.2, 14]} />
            <meshStandardMaterial color="#2b2b30" flatShading />
          </mesh>
        )}

        {accessory === "straw-hat" && (
          <group position={[0, 1.66, 0]}>
            <mesh>
              <cylinderGeometry args={[0.46, 0.46, 0.04, 16]} />
              <meshStandardMaterial color="#d8b96a" flatShading />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.22, 0.26, 0.2, 12]} />
              <meshStandardMaterial color="#c9a455" flatShading />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

export { idleSpeed };
