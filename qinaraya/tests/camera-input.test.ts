import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { applyCameraInput, computeCameraPosition, createCameraRig, followTarget } from "../src/systems/camera/cameraRig.ts";
import type { CameraTuning } from "../src/systems/camera/cameraRig.ts";
import {
  cameraInput,
  consumeCameraInput,
  isSprintHeld,
  joystickInput,
  keyboardInput,
  readMoveVector,
  resetInput,
  touchButtons,
} from "../src/systems/input/inputState.ts";

const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const tuning: CameraTuning = { minDistance: 3.5, maxDistance: 12, minPitch: 0.1, maxPitch: 1.3, rotateSpeed: 0.01, minHeight: 0.6 };

test("drag ke kanan memutar yaw ke arah kanan (yaw berkurang)", () => {
  const rig = createCameraRig(0, 0.4, 7);
  applyCameraInput(rig, 100, 0, 0, 1, tuning);
  near(rig.yaw, -1);
});

test("sensitivitas menskalakan rotasi", () => {
  const a = createCameraRig(0, 0.4, 7);
  const b = createCameraRig(0, 0.4, 7);
  applyCameraInput(a, 50, 0, 0, 1, tuning);
  applyCameraInput(b, 50, 0, 0, 2, tuning);
  near(b.yaw, a.yaw * 2);
});

test("pitch dan jarak dibatasi", () => {
  const rig = createCameraRig(0, 0.4, 7);
  applyCameraInput(rig, 0, 100000, 1000, 1, tuning);
  near(rig.pitch, 1.3);
  near(rig.distance, 12);
  applyCameraInput(rig, 0, -100000, -1000, 1, tuning);
  near(rig.pitch, 0.1);
  near(rig.distance, 3.5);
});

test("kamera berada di belakang target pada yaw 0 dan tidak di bawah tanah", () => {
  const rig = createCameraRig(0, 0.5, 8);
  followTarget(rig, 3, 1.3, 4, 0.016, 10);
  const pos = computeCameraPosition(rig, 0.6, { x: 0, y: 0, z: 0 });
  near(pos.x, 3);
  assert.ok(pos.z > 4, "kamera di +Z dari target");
  assert.ok(pos.y > 1.3);

  const low = createCameraRig(0, 0.1, 3.5);
  followTarget(low, 0, 0, 0, 0.016, 10);
  assert.ok(computeCameraPosition(low, 0.6, { x: 0, y: 0, z: 0 }).y >= 0.6);
});

test("target kamera mengikuti pemain secara bertahap", () => {
  const rig = createCameraRig(0, 0.4, 7);
  followTarget(rig, 0, 0, 0, 0.016, 10);
  followTarget(rig, 10, 0, 0, 0.016, 10);
  assert.ok(rig.targetX > 0 && rig.targetX < 10);
});

beforeEach(() => resetInput());

test("keyboard diagonal dinormalisasi", () => {
  keyboardInput.forward = true;
  keyboardInput.right = true;
  const v = readMoveVector({ x: 0, y: 0 });
  near(Math.hypot(v.x, v.y), 1);
});

test("keyboard berlawanan saling meniadakan", () => {
  keyboardInput.left = true;
  keyboardInput.right = true;
  const v = readMoveVector({ x: 9, y: 9 });
  near(v.x, 0);
  near(v.y, 0);
});

test("joystick didahulukan dan nilainya analog", () => {
  keyboardInput.back = true;
  joystickInput.x = 0.3;
  joystickInput.y = 0.4;
  const v = readMoveVector({ x: 0, y: 0 });
  near(v.x, 0.3);
  near(v.y, 0.4);
});

test("sprint dari keyboard atau tombol sentuh", () => {
  assert.equal(isSprintHeld(), false);
  touchButtons.sprint = true;
  assert.equal(isSprintHeld(), true);
  touchButtons.sprint = false;
  keyboardInput.sprint = true;
  assert.equal(isSprintHeld(), true);
});

test("consumeCameraInput mengambil lalu mengosongkan akumulasi", () => {
  cameraInput.dx = 5;
  cameraInput.dy = -2;
  cameraInput.zoom = 1;
  const out = { dx: 0, dy: 0, zoom: 0 };
  consumeCameraInput(out);
  assert.deepEqual(out, { dx: 5, dy: -2, zoom: 1 });
  assert.deepEqual({ ...cameraInput }, { dx: 0, dy: 0, zoom: 0 });
});

test("resetInput membersihkan semua tombol", () => {
  keyboardInput.forward = true;
  joystickInput.x = 1;
  touchButtons.sprint = true;
  resetInput();
  assert.equal(keyboardInput.forward, false);
  assert.equal(joystickInput.x, 0);
  assert.equal(touchButtons.sprint, false);
});
