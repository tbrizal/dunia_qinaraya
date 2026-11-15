import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { NPCS } from "../../data/npcs";
import type { NpcDef } from "../../data/npcs";
import { approachAngle } from "../../systems/movement/movementMath";
import { playerState } from "../../systems/player/playerState";
import { CharacterModel, idleSpeed } from "../../components/game/CharacterModel";

const LOOK_DISTANCE = 5;

/** NPC berdiri di tempatnya dan menoleh pelan ke pemain yang mendekat. */
function NpcActor({ npc }: { npc: NpcDef }) {
  const ref = useRef<Group>(null);
  const heading = useRef(npc.heading);

  useFrame((_, delta) => {
    const dx = playerState.x - npc.x;
    const dz = playerState.z - npc.z;
    const target = Math.hypot(dx, dz) < LOOK_DISTANCE ? Math.atan2(dx, dz) : npc.heading;
    heading.current = approachAngle(heading.current, target, Math.min(delta, 0.05) * 4);
    if (ref.current) ref.current.rotation.y = heading.current;
  });

  return (
    <group position={[npc.x, 0, npc.z]}>
      <group ref={ref}>
        <CharacterModel palette={npc.palette} accessory={npc.accessory} getSpeed={idleSpeed} />
      </group>
    </group>
  );
}

export function Npcs() {
  return (
    <>
      {NPCS.map((npc) => (
        <NpcActor key={npc.id} npc={npc} />
      ))}
    </>
  );
}
