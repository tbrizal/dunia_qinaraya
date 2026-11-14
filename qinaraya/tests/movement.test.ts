import assert from "node:assert/strict";
import { test } from "node:test";
import { boxFromCenter, resolveCollisions } from "../src/systems/movement/collision.ts";
import type { Collider, WorldBounds } from "../src/systems/movement/collision.ts";
import { approachAngle, cameraRelativeDirection, wrapAngle } from "../src/systems/movement/movementMath.ts";
import { createPlayerState, stepPlayer } from "../src/systems/movement/stepPlayer.ts";
import type { PlayerTuning } from "../src/systems/movement/stepPlayer.ts";

const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const tuning: PlayerTuning = { radius: 0.4, walkSpeed: 3.4, runSpeed: 6, acceleration: 14, turnSpeed: 14 };
const bounds: WorldBounds = { minX: -24, maxX: 24, minZ: -24, maxZ: 24 };

test("maju relatif kamera: yaw 0 menuju -Z", () => {
  const d = cameraRelativeDirection(0, 1, 0, { x: 0, z: 0 });
  near(d.x, 0);
  near(d.z, -1);
});

test("kanan relatif kamera: yaw 0 menuju +X", () => {
  const d = cameraRelativeDirection(1, 0, 0, { x: 0, z: 0 });
  near(d.x, 1);
  near(d.z, 0);
});

test("maju relatif kamera mengikuti yaw: yaw 90 derajat menuju -X", () => {
  const d = cameraRelativeDirection(0, 1, Math.PI / 2, { x: 0, z: 0 });
  near(d.x, -1);
  near(d.z, 0);
});

test("wrapAngle dan approachAngle memilih jalur terpendek", () => {
  // PI dan -PI adalah arah yang sama; cukup periksa besarnya.
  near(Math.abs(wrapAngle(3 * Math.PI)), Math.PI, 1e-9);
  near(wrapAngle(-3 * Math.PI / 2), Math.PI / 2, 1e-9);
  // Dari 170 derajat ke -170 derajat: jalur terpendek melewati 180, bukan 0.
  const from = (170 * Math.PI) / 180;
  const to = (-170 * Math.PI) / 180;
  const stepped = approachAngle(from, to, 0.05);
  assert.ok(stepped > from, "harus berputar naik melewati batas 180 derajat");
});

test("collider kotak mendorong pemain keluar", () => {
  const box = boxFromCenter(0, 0, 4, 4);
  const pos = { x: 2.1, z: 0 };
  assert.equal(resolveCollisions(pos, 0.4, [box], bounds), true);
  near(pos.x, 2.4);
});

test("pusat pemain di dalam kotak tetap dikeluarkan lewat sisi terdekat", () => {
  const box = boxFromCenter(0, 0, 4, 4);
  const pos = { x: 1.9, z: 0.2 };
  resolveCollisions(pos, 0.4, [box], bounds);
  near(pos.x, 2.4);
});

test("collider lingkaran dan batas dunia", () => {
  const pos = { x: 0.5, z: 0 };
  resolveCollisions(pos, 0.4, [{ kind: "circle", x: 0, z: 0, radius: 0.5 }], bounds);
  near(Math.hypot(pos.x, pos.z), 0.9);

  const out = { x: 100, z: -100 };
  resolveCollisions(out, 0.4, [], bounds);
  near(out.x, 23.6);
  near(out.z, -23.6);
});

test("pemain berjalan lurus ke depan dengan kecepatan jalan", () => {
  const s = createPlayerState(0, 0, 0);
  for (let i = 0; i < 120; i++) stepPlayer(s, { moveX: 0, moveY: 1, sprint: false }, 0, 1 / 60, tuning, [], bounds);
  assert.ok(s.z < -5, "harus bergerak ke -Z");
  near(s.x, 0, 1e-6);
  near(Math.hypot(s.vx, s.vz), tuning.walkSpeed, 0.05);
});

test("sprint lebih cepat dari jalan", () => {
  const walk = createPlayerState(0, 0, 0);
  const run = createPlayerState(0, 0, 0);
  for (let i = 0; i < 120; i++) {
    stepPlayer(walk, { moveX: 0, moveY: 1, sprint: false }, 0, 1 / 60, tuning, [], bounds);
    stepPlayer(run, { moveX: 0, moveY: 1, sprint: true }, 0, 1 / 60, tuning, [], bounds);
  }
  assert.ok(run.z < walk.z);
  assert.equal(run.running, true);
});

test("karakter menghadap arah gerak", () => {
  const s = createPlayerState(0, 0, 0);
  for (let i = 0; i < 60; i++) stepPlayer(s, { moveX: 1, moveY: 0, sprint: false }, 0, 1 / 60, tuning, [], bounds);
  near(s.heading, Math.PI / 2, 0.05); // menghadap +X
});

test("tidak menembus dinding dan meluncur sepanjang dinding", () => {
  const wall: Collider[] = [boxFromCenter(0, -5, 10, 1)]; // dinding membentang di sumbu X
  const s = createPlayerState(-2, 0, 0);
  // Input diagonal: maju dan ke kanan.
  for (let i = 0; i < 400; i++) {
    stepPlayer(s, { moveX: 0.7, moveY: 0.7, sprint: true }, 0, 1 / 60, tuning, wall, bounds);
    // Dinding membentang x -5..5; di luar bentang itu pemain boleh mengitari ujungnya.
    if (s.x <= 5) assert.ok(s.z >= -4.5 + 0.4 - 1e-6, `menembus dinding di langkah ${i}: z=${s.z}`);
  }
  assert.ok(s.x > 2, "harus meluncur ke kanan sepanjang dinding");
});

test("tidak jatuh keluar batas dunia", () => {
  const s = createPlayerState(0, 0, 0);
  for (let i = 0; i < 1000; i++) stepPlayer(s, { moveX: 0, moveY: 1, sprint: true }, 0, 1 / 60, tuning, [], bounds);
  near(s.z, -23.6, 1e-6);
});

test("frame sangat panjang tidak membuat pemain menembus dinding", () => {
  const wall: Collider[] = [boxFromCenter(0, -3, 10, 0.5)];
  const s = createPlayerState(0, 0, 0);
  for (let i = 0; i < 20; i++) stepPlayer(s, { moveX: 0, moveY: 1, sprint: true }, 0, 2, tuning, wall, bounds);
  assert.ok(s.z >= -2.75 + 0.4 - 1e-6);
});
