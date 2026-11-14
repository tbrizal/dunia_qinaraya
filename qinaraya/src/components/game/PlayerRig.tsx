import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { gameConfig } from "../../config/gameConfig";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { applyCameraInput, computeCameraPosition, createCameraRig, followTarget } from "../../systems/camera/cameraRig";
import { consumeCameraInput, isSprintHeld, readMoveVector, resetInput } from "../../systems/input/inputState";
import type { Collider, WorldBounds } from "../../systems/movement/collision";
import { stepPlayer } from "../../systems/movement/stepPlayer";
import type { MoveInput } from "../../systems/movement/stepPlayer";
import { playerState, resetPlayerState } from "../../systems/player/playerState";
import { CharacterModel } from "./CharacterModel";

interface PlayerRigProps {
  colliders: readonly Collider[];
  bounds: WorldBounds;
}

const { player, camera: camCfg } = gameConfig;

/**
 * Satu-satunya tempat game loop pemain dan kamera berjalan. Urutan tetap:
 * input, kamera (yaw terbaru), gerakan relatif kamera, lalu kamera mengikuti.
 */
export function PlayerRig({ colliders, bounds }: PlayerRigProps) {
  const groupRef = useRef<Group>(null);
  const rig = useMemo(() => createCameraRig(camCfg.initialYaw, camCfg.initialPitch, camCfg.distance), []);
  const buffers = useMemo(
    () => ({
      move: { x: 0, y: 0 },
      drag: { dx: 0, dy: 0, zoom: 0 },
      input: { moveX: 0, moveY: 0, sprint: false } as MoveInput,
      camPos: { x: 0, y: 0, z: 0 },
    }),
    [],
  );

  useEffect(() => {
    resetPlayerState();
    resetInput();
    return resetInput;
  }, []);

  useFrame((state, delta) => {
    const { cameraSensitivity, settingsOpen } = useSettingsStore.getState();
    const { move, drag, input, camPos } = buffers;

    consumeCameraInput(drag);
    if (settingsOpen) {
      // Saat menu terbuka dunia tetap tampil, tetapi input diabaikan.
      move.x = 0;
      move.y = 0;
      drag.dx = drag.dy = drag.zoom = 0;
    } else {
      readMoveVector(move);
    }

    applyCameraInput(rig, drag.dx, drag.dy, drag.zoom, cameraSensitivity, camCfg);

    input.moveX = move.x;
    input.moveY = move.y;
    input.sprint = !settingsOpen && isSprintHeld();
    stepPlayer(playerState, input, rig.yaw, delta, player, colliders, bounds);

    followTarget(rig, playerState.x, camCfg.targetHeight, playerState.z, Math.min(delta, 0.1), camCfg.followSharpness);
    computeCameraPosition(rig, camCfg.minHeight, camPos);
    state.camera.position.set(camPos.x, camPos.y, camPos.z);
    state.camera.lookAt(rig.targetX, rig.targetY, rig.targetZ);

    const group = groupRef.current;
    if (group) {
      group.position.set(playerState.x, 0, playerState.z);
      group.rotation.y = playerState.heading;
    }
  });

  return (
    <group ref={groupRef}>
      <CharacterModel />
    </group>
  );
}
