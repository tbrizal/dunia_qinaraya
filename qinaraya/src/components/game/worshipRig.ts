import { CapsuleGeometry, BoxGeometry, CircleGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, SphereGeometry, Vector3 } from "three";
import type { CharacterPalette } from "../../data/npcs";
import type { PoseValues } from "../../systems/worship/poses";

/**
 * Kerangka karakter untuk animasi ibadah. Dipakai bersama oleh game (komponen R3F) dan test geometri,
 * sehingga pose yang lolos test sama persis dengan yang tampil. Satuan: meter pada skala 1.
 * Karakter menghadap +Z; sisi kanan karakter berada di -X.
 */

export const DIM = {
  hipX: 0.13,
  thigh: 0.25,
  shin: 0.22,
  ankle: 0.03,
  torso: 0.62,
  shoulderX: 0.31,
  shoulderY: 0.55,
  upperArm: 0.29,
  foreArm: 0.26,
  hand: 0.07,
  headUp: 0.31,
  headR: 0.3,
} as const;

export const STANDING_PELVIS_Y = DIM.thigh + DIM.shin + DIM.ankle;

export type BoneName =
  | "pelvis"
  | "torso"
  | "head"
  | "shoulderR"
  | "elbowR"
  | "shoulderL"
  | "elbowL"
  | "hipR"
  | "kneeR"
  | "ankleR"
  | "hipL"
  | "kneeL"
  | "ankleL";

export type MarkerName =
  | "handR"
  | "handL"
  | "elbowR"
  | "elbowL"
  | "shoulderR"
  | "shoulderL"
  | "kneeR"
  | "kneeL"
  | "ankleR"
  | "ankleL"
  | "toeR"
  | "toeL"
  | "heelR"
  | "heelL"
  | "forehead"
  | "nose"
  | "headTop"
  | "chest"
  | "pelvis"
  | "back";

export interface WorshipRig {
  root: Group;
  /** Skala tubuh (dipakai penjaga lantai). */
  scale: number;
  bones: Record<BoneName, Object3D>;
  markers: Record<MarkerName, Object3D>;
}

function mesh(geometry: CapsuleGeometry | SphereGeometry | BoxGeometry, color: string): Mesh {
  return new Mesh(geometry, new MeshStandardMaterial({ color, flatShading: true }));
}

function joint(parent: Object3D, x: number, y: number, z = 0): Group {
  const g = new Group();
  g.position.set(x, y, z);
  g.rotation.order = "YXZ";
  parent.add(g);
  return g;
}

function marker(parent: Object3D, x: number, y: number, z: number): Object3D {
  const m = new Object3D();
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

function capsuleBetween(parent: Object3D, radius: number, length: number, color: string): void {
  const m = mesh(new CapsuleGeometry(radius, Math.max(0.001, length - radius * 2), 4, 8), color);
  m.position.y = -length / 2;
  parent.add(m);
}

export function createWorshipRig(palette: CharacterPalette, scale = 0.85): WorshipRig {
  const root = new Group();
  const body = new Group();
  body.scale.setScalar(scale);
  root.add(body);

  // Bayangan bulat sederhana di tanah (tidak ikut skala tubuh).
  const shadow = new Mesh(new CircleGeometry(0.55, 20), new MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.2, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  root.add(shadow);

  const pelvis = joint(body, 0, STANDING_PELVIS_Y);
  const torso = joint(pelvis, 0, 0);

  const torsoMesh = mesh(new CapsuleGeometry(0.23, 0.22, 4, 10), palette.tunic);
  torsoMesh.position.y = 0.32;
  torso.add(torsoMesh);
  const bag = mesh(new BoxGeometry(0.34, 0.4, 0.16), palette.bag);
  bag.position.set(0, 0.35, -0.3);
  torso.add(bag);

  const neck = joint(torso, 0, DIM.torso);
  const head = joint(neck, 0, 0);
  const skull = mesh(new SphereGeometry(DIM.headR, 16, 12), palette.skin);
  skull.position.y = DIM.headUp;
  head.add(skull);
  const hair = mesh(new SphereGeometry(DIM.headR + 0.02, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), palette.hair);
  hair.position.set(0, DIM.headUp + 0.03, -0.01);
  hair.rotation.x = -0.35;
  head.add(hair);
  for (const side of [-1, 1]) {
    const eye = mesh(new SphereGeometry(0.045, 8, 6), "#2a2220");
    eye.position.set(side * 0.1, DIM.headUp + 0.01, 0.27);
    head.add(eye);
  }

  const arm = (side: "R" | "L") => {
    const sx = side === "R" ? -DIM.shoulderX : DIM.shoulderX;
    const shoulder = joint(torso, sx, DIM.shoulderY);
    capsuleBetween(shoulder, 0.07, DIM.upperArm, palette.tunic);
    const elbow = joint(shoulder, 0, -DIM.upperArm);
    capsuleBetween(elbow, 0.065, DIM.foreArm, palette.tunic);
    const wrist = joint(elbow, 0, -DIM.foreArm);
    const hand = mesh(new SphereGeometry(0.085, 10, 8), palette.skin);
    hand.position.y = -DIM.hand;
    wrist.add(hand);
    return { shoulder, elbow, hand: marker(wrist, 0, -DIM.hand, 0), elbowPt: marker(shoulder, 0, -DIM.upperArm, 0), shoulderPt: marker(shoulder, 0, 0, 0) };
  };
  const armR = arm("R");
  const armL = arm("L");

  const leg = (side: "R" | "L") => {
    const hx = side === "R" ? -DIM.hipX : DIM.hipX;
    const hip = joint(pelvis, hx, 0);
    capsuleBetween(hip, 0.1, DIM.thigh, palette.pants);
    const knee = joint(hip, 0, -DIM.thigh);
    capsuleBetween(knee, 0.09, DIM.shin, palette.pants);
    const ankle = joint(knee, 0, -DIM.shin);
    const foot = mesh(new BoxGeometry(0.11, 0.06, 0.2), palette.pants);
    foot.position.set(0, 0, 0.05);
    ankle.add(foot);
    return {
      hip,
      knee,
      ankle,
      kneePt: marker(hip, 0, -DIM.thigh, 0),
      anklePt: marker(knee, 0, -DIM.shin, 0),
      toe: marker(ankle, 0, -DIM.ankle, 0.15),
      heel: marker(ankle, 0, -DIM.ankle, -0.05),
    };
  };
  const legR = leg("R");
  const legL = leg("L");

  return {
    root,
    scale,
    bones: {
      pelvis,
      torso,
      head,
      shoulderR: armR.shoulder,
      elbowR: armR.elbow,
      shoulderL: armL.shoulder,
      elbowL: armL.elbow,
      hipR: legR.hip,
      kneeR: legR.knee,
      ankleR: legR.ankle,
      hipL: legL.hip,
      kneeL: legL.knee,
      ankleL: legL.ankle,
    },
    markers: {
      handR: armR.hand,
      handL: armL.hand,
      elbowR: armR.elbowPt,
      elbowL: armL.elbowPt,
      shoulderR: armR.shoulderPt,
      shoulderL: armL.shoulderPt,
      kneeR: legR.kneePt,
      kneeL: legL.kneePt,
      ankleR: legR.anklePt,
      ankleL: legL.anklePt,
      toeR: legR.toe,
      toeL: legL.toe,
      heelR: legR.heel,
      heelL: legL.heel,
      forehead: marker(head, 0, DIM.headUp + 0.1, 0.28),
      nose: marker(head, 0, DIM.headUp - 0.02, 0.3),
      headTop: marker(head, 0, DIM.headUp + DIM.headR, 0),
      chest: marker(torso, 0, 0.4, 0.22),
      pelvis: marker(pelvis, 0, 0, 0),
      back: marker(torso, 0, 0.4, -0.22),
    },
  };
}

/**
 * Jarak aman (meter, skala 1) tiap titik dari lantai: lutut, tangan, dan pinggul punya ketebalan,
 * sedangkan ujung kaki dan hidung boleh menyentuh lantai.
 */
const CLEARANCE: Partial<Record<MarkerName, number>> = {
  toeR: 0,
  toeL: 0,
  heelR: 0,
  heelL: 0,
  ankleR: 0.02,
  ankleL: 0.02,
  kneeR: 0.08,
  kneeL: 0.08,
  forehead: 0.02,
  nose: 0,
  handR: 0.04,
  handL: 0.04,
  pelvis: 0.08,
  chest: 0.06,
};

const probe = new Vector3();

/**
 * Menjaga tubuh tetap di atas lantai: bila ada titik yang akan menembus, pinggul dinaikkan sebesar kekurangannya.
 * Pose akhir sudah memenuhi syarat ini, jadi koreksi hanya bekerja pada peralihan antar pose
 * (mis. dari berdiri ke sujud, ketika telapak kaki berputar sebelum lutut menyentuh lantai).
 */
function keepAboveFloor(rig: WorshipRig): void {
  rig.root.updateMatrixWorld(true);
  let deficit = 0;
  for (const [name, clearance] of Object.entries(CLEARANCE) as [MarkerName, number][]) {
    rig.markers[name].getWorldPosition(probe);
    deficit = Math.max(deficit, clearance * rig.scale - probe.y);
  }
  if (deficit > 1e-6) {
    rig.bones.pelvis.position.y += deficit / rig.scale;
    rig.root.updateMatrixWorld(true);
  }
}

/** Menerapkan nilai pose ke kerangka. Sisi kiri dicerminkan untuk channel ".z" dan ".y". */
export function applyPose(rig: WorshipRig, v: PoseValues, groundGuard = true): void {
  const b = rig.bones;
  b.pelvis.position.set(0, STANDING_PELVIS_Y + v.rootY, v.rootZ);
  b.torso.rotation.set(v.torso, 0, 0);
  b.head.rotation.set(v.head, v.headTurn, 0);

  b.shoulderR.rotation.set(v["shoulderR.x"], 0, v["shoulderR.z"]);
  b.elbowR.rotation.set(v["elbowR.x"], v["elbowR.y"], 0);
  b.shoulderL.rotation.set(v["shoulderL.x"], 0, -v["shoulderL.z"]);
  b.elbowL.rotation.set(v["elbowL.x"], -v["elbowL.y"], 0);

  b.hipR.rotation.set(v.hipR, 0, 0);
  b.kneeR.rotation.set(v.kneeR, 0, 0);
  b.ankleR.rotation.set(v.ankleR, 0, 0);
  b.hipL.rotation.set(v.hipL, 0, 0);
  b.kneeL.rotation.set(v.kneeL, 0, 0);
  b.ankleL.rotation.set(v.ankleL, 0, 0);

  if (groundGuard) keepAboveFloor(rig);
}
