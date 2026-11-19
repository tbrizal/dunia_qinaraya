import assert from "node:assert/strict";
import { test } from "node:test";
import { Vector3 } from "three";
import { applyPose, createWorshipRig } from "../src/components/game/worshipRig.ts";
import type { MarkerName } from "../src/components/game/worshipRig.ts";
import { buildWorshipGuide } from "../src/data/unreviewed/ibadahGuide.ts";
import { CLIPS, ClipPlayer, MAX_ANGULAR_SPEED, POSES, calmSeconds, clipDuration, expandClip } from "../src/systems/worship/poseLibrary.ts";
import { CHANNELS, NEUTRAL } from "../src/systems/worship/poses.ts";
import { buildSalatSteps, buildWuduSteps } from "../src/systems/worship/sequences.ts";

/**
 * Menguji bentuk tubuh pada setiap pose memakai kerangka yang sama dengan yang tampil di game:
 * posisi sendi dihitung dengan transformasi Three.js sungguhan, lalu diperiksa terhadap lantai,
 * posisi tangan, arah kaki, dan seterusnya.
 */

const rig = createWorshipRig({ tunic: "#000", pants: "#000", hair: "#000", skin: "#000", bag: "#000" }, 1);
const v = new Vector3();

function marks(poseId: string): Record<MarkerName, { x: number; y: number; z: number }> {
  applyPose(rig, POSES[poseId]!);
  rig.root.updateMatrixWorld(true);
  const out = {} as Record<MarkerName, { x: number; y: number; z: number }>;
  for (const name of Object.keys(rig.markers) as MarkerName[]) {
    rig.markers[name].getWorldPosition(v);
    out[name] = { x: v.x, y: v.y, z: v.z };
  }
  return out;
}
const dist = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const guide = buildWorshipGuide();

test("setiap pose valid: tidak ada nilai aneh dan tidak ada bagian tubuh menembus lantai", () => {
  for (const [id, pose] of Object.entries(POSES)) {
    for (const c of CHANNELS) {
      assert.ok(Number.isFinite(pose[c]), `${id}.${c}`);
      assert.ok(Math.abs(pose[c]) <= 3.3, `${id}.${c} berlebihan: ${pose[c]}`);
    }
    for (const [name, p] of Object.entries(marks(id))) assert.ok(p.y >= -0.012, `${id}: ${name} menembus lantai (y=${p.y.toFixed(3)})`);
  }
});

test("pose berdiri: kaki menapak datar di lantai dan tinggi karakter wajar", () => {
  const m = marks("stand");
  assert.ok(Math.abs(m.toeR.y) < 0.01 && Math.abs(m.heelL.y) < 0.01);
  assert.ok(m.headTop.y > 1.6 && m.headTop.y < 1.85);
});

test("qiyam (sedekap): kedua tangan bertumpuk di depan dada atau perut, kaki menapak", () => {
  const m = marks("qiyam");
  for (const hand of [m.handR, m.handL]) {
    assert.ok(Math.abs(hand.x) < 0.1, `tangan jauh dari tengah tubuh: ${hand.x.toFixed(2)}`);
    assert.ok(hand.y > 0.75 && hand.y < 1.05, `tinggi tangan ${hand.y.toFixed(2)}`);
    assert.ok(hand.z > 0.1 && hand.z < 0.35);
  }
  assert.ok(m.pelvis.y > 0.48, "berdiri tegak");
});

test("takbir: kedua tangan diangkat sejajar bahu atau telinga di kiri dan kanan", () => {
  const m = marks("takbir-up");
  assert.ok(m.handR.y > 1.05 && m.handR.y < 1.4 && m.handL.y > 1.05 && m.handL.y < 1.4);
  assert.ok(m.handR.x < -0.18 && m.handL.x > 0.18, "tangan di sisi kiri-kanan");
  assert.ok(Math.abs(m.handR.y - m.handL.y) < 0.02, "simetris");
});

test("rukuk: punggung rata, tangan di lutut, kepala sejajar punggung, kaki tegak", () => {
  const m = marks("rukuk");
  // Sumbu punggung = titik tengah antara dada dan punggung; harus mendatar setinggi pinggul.
  const midY = (m.back.y + m.chest.y) / 2;
  const midZ = (m.back.z + m.chest.z) / 2;
  assert.ok(Math.abs(midY - m.pelvis.y) < 0.04, `punggung tidak rata (selisih ${(midY - m.pelvis.y).toFixed(3)})`);
  assert.ok(midZ - m.pelvis.z > 0.35, "punggung terentang ke depan");
  assert.ok(Math.abs(POSES.rukuk!.torso - Math.PI / 2) < 0.08, "membungkuk sekitar 90 derajat");
  assert.ok(dist(m.handR, m.kneeR) < 0.08 && dist(m.handL, m.kneeL) < 0.08, "tangan menumpu di lutut");
  assert.ok(m.nose.y < m.pelvis.y + 0.05 && m.nose.y > 0.2, "kepala sejajar punggung");
  assert.ok(m.kneeR.y > 0.2, "lutut tidak menekuk dalam");
});

test("iktidal: berdiri tegak dengan tangan di sisi tubuh", () => {
  const m = marks("iktidal");
  assert.ok(m.pelvis.y > 0.49);
  assert.ok(m.handR.y < 0.6 && m.handL.y < 0.6, "tangan terkulai");
});

test("sujud: dahi dan hidung di lantai, telapak tangan, lutut, dan jari kaki menyentuh lantai", () => {
  const m = marks("sujud");
  assert.ok(m.forehead.y < 0.07, `dahi y=${m.forehead.y.toFixed(3)}`);
  assert.ok(m.nose.y < 0.07, `hidung y=${m.nose.y.toFixed(3)}`);
  assert.ok(m.handR.y < 0.12 && m.handL.y < 0.12, "telapak tangan di lantai");
  assert.ok(m.kneeR.y > 0.05 && m.kneeR.y < 0.14 && m.kneeL.y < 0.14, "lutut di lantai");
  assert.ok(m.toeR.y < 0.03 && m.toeL.y < 0.03, "ujung jari kaki menyentuh lantai");
  assert.ok(m.pelvis.y > m.forehead.y + 0.15, "pinggul lebih tinggi dari dahi");
});

test("sujud: tangan di kiri-kanan kepala, dan kaki mengarah ke belakang (tidak terlipat ke arah lutut)", () => {
  const m = marks("sujud");
  assert.ok(m.handR.x < -0.15 && m.handL.x > 0.15, "tangan di samping kepala");
  assert.ok(Math.abs(m.handR.z - m.forehead.z) < 0.25, "tangan sejajar dahi");
  assert.ok(m.toeR.z < m.ankleR.z - 0.08 && m.toeL.z < m.ankleL.z - 0.08, "jari kaki berada di belakang pergelangan");
  assert.ok(m.forehead.z > m.kneeR.z + 0.5, "kepala jauh di depan lutut");
});

test("sujud: tubuh simetris kiri-kanan", () => {
  const m = marks("sujud");
  assert.ok(Math.abs(m.handR.y - m.handL.y) < 1e-6 && Math.abs(m.kneeR.z - m.kneeL.z) < 1e-6 && Math.abs(m.handR.x + m.handL.x) < 1e-6);
});

test("duduk di antara dua sujud (iftirasy): duduk di telapak kaki kiri, kaki kanan ditegakkan", () => {
  const m = marks("duduk");
  assert.ok(m.pelvis.y < 0.3 && m.pelvis.y > 0.1, `pinggul y=${m.pelvis.y.toFixed(2)}`);
  assert.ok(m.toeL.z < m.ankleL.z - 0.08, "telapak kiri rebah ke belakang");
  assert.ok(m.ankleL.y < 0.07, "kaki kiri di lantai");
  assert.ok(m.heelR.y > m.toeR.y + 0.06, "kaki kanan tegak: tumit terangkat, jari menapak");
  assert.ok(m.toeR.y < 0.03);
  assert.ok(Math.abs(m.pelvis.z - m.ankleL.z) < 0.15, "pinggul di atas kaki kiri");
  assert.ok(dist(m.handR, m.kneeR) < 0.2 && dist(m.handL, m.kneeL) < 0.2, "tangan di atas paha");
  assert.ok(m.headTop.y > 1.2, "punggung tegak");
});

test("duduk tasyahud akhir (tawarruk): duduk di lantai, kaki kanan tegak, kaki kiri terselip di bawah", () => {
  const m = marks("tasyahud-akhir");
  assert.ok(m.pelvis.y < 0.2, `pinggul y=${m.pelvis.y.toFixed(2)}`);
  assert.ok(m.heelR.y > m.toeR.y + 0.05 && m.toeR.y < 0.03, "kaki kanan tegak");
  assert.ok(m.toeL.z < m.ankleL.z - 0.08 && m.ankleL.y < 0.07, "kaki kiri rebah ke belakang di bawah");
  assert.ok(m.pelvis.y < marks("duduk").pelvis.y, "lebih rendah daripada iftirasy");
  assert.ok(dist(m.handR, m.kneeR) < 0.25 && dist(m.handL, m.kneeL) < 0.25, "tangan di atas paha");
});

test("salam: kepala menoleh ke kanan lalu ke kiri dengan sudut yang wajar, badan tetap duduk", () => {
  const r = POSES["salam-r"]!;
  const l = POSES["salam-l"]!;
  assert.ok(r.headTurn < -0.7 && r.headTurn > -1.4, "menoleh ke kanan");
  assert.ok(l.headTurn > 0.7 && l.headTurn < 1.4, "menoleh ke kiri");
  assert.equal(r.rootY, POSES["tasyahud-akhir"]!.rootY);
  const mr = marks("salam-r");
  const ml = marks("salam-l");
  assert.ok(mr.nose.x < -0.15, "hidung bergeser ke kanan karakter");
  assert.ok(ml.nose.x > 0.15, "hidung bergeser ke kiri karakter");
});

test("transisi ke sujud: berlutut dengan tangan menjangkau lantai di depan", () => {
  const m = marks("kneel-hands");
  assert.ok(m.kneeR.y < 0.14 && m.handR.y < 0.12);
  assert.ok(m.toeR.z < m.ankleR.z - 0.08);
  assert.ok(m.handR.z > m.kneeR.z + 0.3);
});

// ---------- Wudu ----------

test("wudu: membasuh telapak tangan di depan perut dengan kedua tangan berdekatan", () => {
  for (const id of ["wudu-hands-a", "wudu-hands-b"]) {
    const m = marks(id);
    assert.ok(Math.abs(m.handR.x) < 0.12 && Math.abs(m.handL.x) < 0.12, `${id}: tangan berdekatan`);
    assert.ok(m.handR.y > 0.8 && m.handR.y < 1.1, `${id}: tinggi ${m.handR.y.toFixed(2)}`);
  }
});

test("wudu: berkumur dan membersihkan hidung: tangan kanan di depan mulut dan hidung", () => {
  const mouth = marks("wudu-mouth");
  assert.ok(dist(mouth.handR, { x: 0, y: mouth.nose.y - 0.08, z: mouth.nose.z + 0.04 }) < 0.14, "tangan di depan mulut");
  const nose = marks("wudu-nose");
  assert.ok(dist(nose.handR, { x: 0, y: nose.nose.y + 0.0, z: nose.nose.z + 0.05 }) < 0.14, "tangan di depan hidung");
  assert.ok(marks("wudu-mouth").handL.y < 1.0 && marks("wudu-mouth").handL.y > 0.7, "tangan kiri tetap di depan perut");
});

test("wudu: membasuh wajah: kedua tangan bergerak dari dahi sampai dagu di depan wajah", () => {
  const up = marks("wudu-face-up");
  const down = marks("wudu-face-down");
  assert.ok(up.handR.y > up.nose.y + 0.05, "tangan di dahi");
  assert.ok(down.handR.y < down.nose.y, "tangan di dagu");
  assert.ok(up.handR.z > up.nose.z - 0.05 && Math.abs(up.handR.x) < 0.2, "di depan wajah");
  assert.ok(Math.abs(up.handR.x + up.handL.x) < 1e-6, "simetris");
});

test("wudu: membasuh tangan sampai siku: tangan lain bergerak dari pergelangan ke siku", () => {
  const a = marks("wudu-arm-a");
  const b = marks("wudu-arm-b");
  assert.ok(a.handR.z > 0.35 && Math.abs(a.handR.y - 1.02) < 0.15, "lengan kanan terulur ke depan");
  assert.ok(dist(a.handL, a.handR) < 0.2, "tangan kiri di pergelangan kanan");
  assert.ok(dist(b.handL, b.elbowR) < 0.22, "tangan kiri bergeser ke siku kanan");
  const la = marks("wudu-arm-la");
  assert.ok(la.handL.x > 0.2 && la.handL.z > 0.35, "gerakan kiri adalah cermin dari kanan");
  assert.ok(Math.abs(la.handL.x + a.handR.x) < 1e-6);
});

test("wudu: mengusap kepala: tangan kanan menyentuh sisi atas kepala dan bergerak dari depan ke belakang", () => {
  const a = marks("wudu-head-a");
  const b = marks("wudu-head-b");
  const center = (m: typeof a) => ({ x: 0, y: m.headTop.y - 0.3, z: m.headTop.z });
  assert.ok(dist(a.handR, center(a)) < 0.4, "tangan menempel kepala (jarak dari pusat kepala)");
  assert.ok(a.handR.y > 1.45 && b.handR.y > 1.45, "tangan di atas telinga");
  assert.ok(a.handR.z > b.handR.z + 0.15, "mengusap dari depan ke belakang");
});

test("wudu: mengusap telinga: kedua tangan di sisi kepala setinggi telinga", () => {
  const m = marks("wudu-ears");
  assert.ok(m.handR.x < -0.22 && m.handL.x > 0.22);
  assert.ok(Math.abs(m.handR.y - (m.headTop.y - 0.3)) < 0.15, "setinggi telinga");
  assert.ok(Math.abs(m.handR.z) < 0.15);
});

test("wudu: membasuh kaki: kaki terangkat ke depan, tangan menjangkau kaki, kaki penopang menapak", () => {
  const m = marks("wudu-foot");
  assert.ok(m.ankleR.y > 0.3, `kaki kanan terangkat (y=${m.ankleR.y.toFixed(2)})`);
  assert.ok(dist(m.handR, m.ankleR) < 0.2, "tangan di dekat kaki");
  assert.ok(Math.abs(m.toeL.y) < 0.03 && Math.abs(m.heelL.y) < 0.03, "kaki kiri menapak");
  const ml = marks("wudu-foot-l");
  assert.ok(ml.ankleL.y > 0.3 && Math.abs(ml.toeR.y) < 0.03, "sisi kiri adalah cermin");
});

test("wudu: berdoa: kedua tangan terangkat di depan dada, kepala sedikit terangkat", () => {
  const m = marks("wudu-dua");
  assert.ok(m.handR.y > 0.9 && m.handR.y < 1.25 && m.handR.z > 0.2);
  assert.ok(POSES["wudu-dua"]!.head < 0);
});

// ---------- Klip animasi ----------

test("setiap klip yang dipakai panduan ada, dan setiap klip hanya memakai pose yang ada", () => {
  const used = new Set<string>();
  for (const s of buildWuduSteps(guide)) used.add(s.clip);
  for (const p of ["subuh", "dzuhur", "ashar", "maghrib", "isya"] as const) for (const s of buildSalatSteps(p, guide)) used.add(s.clip);
  for (const id of used) assert.ok(CLIPS[id], `klip ${id} tidak ada`);
  for (const [id, clip] of Object.entries(CLIPS)) {
    assert.ok(expandClip(clip).length > 0, id);
    for (const key of expandClip(clip)) assert.ok(POSES[key.pose], `${id}: pose ${key.pose} tidak ada`);
  }
});

/**
 * Menjalankan urutan langkah seperti pemain: tiap klip diputar dari pose akhir langkah sebelumnya.
 * `advanceAfter` mensimulasikan pemain menekan Berikutnya sebelum animasi selesai.
 */
function simulate(clips: string[], advanceAfter?: number) {
  const player = new ClipPlayer();
  const problems: string[] = [];
  let peak = 0;
  const dt = 1 / 60;
  clips.forEach((clipId, index) => {
    player.play(clipId);
    const limit = Math.min(advanceAfter ?? Infinity, clipDuration(CLIPS[clipId]!));
    let slowest = 0;
    for (let t = 0, frame = 0; t < limit; t += dt, frame++) {
      const before = { ...player.getPose() };
      const pose = player.update(dt);
      for (const c of CHANNELS) slowest = Math.max(slowest, Math.abs(pose[c] - before[c]) / dt);
      if (frame % 3 === 0) {
        applyPose(rig, pose);
        rig.root.updateMatrixWorld(true);
        for (const name of Object.keys(rig.markers) as MarkerName[]) {
          rig.markers[name].getWorldPosition(v);
          if (v.y < -0.03) problems.push(`#${index} ${clipId} t=${t.toFixed(2)}: ${name} menembus lantai (y=${v.y.toFixed(3)})`);
        }
      }
    }
    peak = Math.max(peak, slowest);
    if (slowest > 3.2) problems.push(`#${index} ${clipId}: gerakan terlalu cepat (${slowest.toFixed(2)} rad/s)`);
  });
  return { problems: [...new Set(problems)].slice(0, 12), peak };
}

const allSalatClips = (p: "subuh" | "dzuhur" | "ashar" | "maghrib" | "isya") => [...buildSalatSteps(p, guide).map((s) => s.clip), "return-stand"];

test("gerakan tenang: seluruh urutan wudu berjalan mulus (tanpa gerakan cepat dan tanpa menembus lantai)", () => {
  const { problems } = simulate([...buildWuduSteps(guide).map((s) => s.clip), "return-stand"]);
  assert.deepEqual(problems, []);
});

test("gerakan tenang: seluruh urutan salat tiap waktu berjalan mulus (tanpa gerakan cepat dan tanpa menembus lantai)", () => {
  for (const p of ["subuh", "dzuhur", "ashar", "maghrib", "isya"] as const) {
    assert.deepEqual(simulate(allSalatClips(p)).problems, [], p);
  }
});

test("pemain menekan Berikutnya sebelum animasi selesai: tetap mulus dan tidak menembus lantai", () => {
  for (const after of [0.3, 0.8, 1.5]) {
    assert.deepEqual(simulate([...buildWuduSteps(guide).map((s) => s.clip), "return-stand"], after).problems, [], `wudu setelah ${after}s`);
    assert.deepEqual(simulate(allSalatClips("dzuhur"), after).problems, [], `salat setelah ${after}s`);
  }
});

test("durasi klip wajar dan tidak ada perpindahan kunci kurang dari 0,8 detik", () => {
  for (const [id, clip] of Object.entries(CLIPS)) {
    assert.ok(clipDuration(clip) < 24, `${id}: klip terlalu panjang (${clipDuration(clip).toFixed(1)}s)`);
    for (const key of expandClip(clip)) assert.ok(key.seconds >= 0.8, `${id}: perpindahan ke ${key.pose} hanya ${key.seconds}s`);
  }
});

test("tumakninah: rukuk, iktidal, sujud, dan duduk ditahan cukup lama", () => {
  for (const id of ["salat-rukuk", "salat-iktidal", "salat-sujud", "salat-sujud-kedua", "salat-duduk", "salat-tasyahud-awal", "salat-tasyahud-akhir"]) {
    const keys = expandClip(CLIPS[id]!);
    assert.ok((keys[keys.length - 1]!.hold ?? 0) >= 1.2, `${id}: tahan pose terakhir minimal 1,2 detik`);
  }
});

test("klip wudu yang berulang menyebut tiga kali sesuai panduan", () => {
  for (const id of ["wudu-hands", "wudu-mouth", "wudu-nose", "wudu-face"]) assert.equal(CLIPS[id]!.loop!.times, 3, id);
  const arms = expandClip(CLIPS["wudu-arms"]!).filter((x) => x.pose === "wudu-arm-b" || x.pose === "wudu-arm-lb").length;
  assert.equal(arms, 6, "tiga usapan untuk tiap lengan");
});

test("ClipPlayer: tiba di pose akhir, deterministik, dan tidak bergantung ukuran langkah waktu", () => {
  const run = (step: number) => {
    const p = new ClipPlayer();
    p.play("salat-rukuk");
    for (let t = 0; t < clipDuration(CLIPS["salat-rukuk"]!) + 0.5; t += step) p.update(step);
    return p.getPose();
  };
  for (const c of CHANNELS) {
    assert.ok(Math.abs(run(1 / 60)[c] - POSES.rukuk![c]) < 1e-3, c);
    assert.ok(Math.abs(run(1 / 60)[c] - run(0.25)[c]) < 1e-3, `${c}: bergantung frame rate`);
  }
});

test("ClipPlayer: berpindah klip di tengah jalan tanpa lonjakan dan menandai selesai", () => {
  const p = new ClipPlayer();
  p.play("salat-sujud");
  for (let i = 0; i < 60; i++) p.update(1 / 60);
  const before = { ...p.getPose() };
  assert.equal(p.finished, false);
  p.play("salat-duduk");
  for (const c of CHANNELS) assert.equal(p.getPose()[c], before[c], `lonjakan pada ${c}`);
  p.update(1 / 60);
  for (const c of CHANNELS) assert.ok(Math.abs(p.getPose()[c] - before[c]) < 0.05, `gerak terlalu besar dalam 1 frame pada ${c}`);
  for (let i = 0; i < 60 * 10; i++) p.update(1 / 60);
  assert.equal(p.finished, true);
});

test("ClipPlayer: nilai tetap terbatas walau langkah waktu sangat besar", () => {
  const p = new ClipPlayer();
  p.play("wudu-arms");
  p.update(1000);
  for (const c of CHANNELS) assert.ok(Number.isFinite(p.getPose()[c]));
  assert.equal(p.finished, true);
});

test("pembatas kecepatan: perpindahan sejauh apa pun diperpanjang agar tetap tenang", () => {
  assert.equal(calmSeconds(POSES.stand!, POSES.stand!), 0);
  const far = calmSeconds(POSES.sujud!, POSES.qiyam!);
  assert.ok(far > 0.8 && far < 3, `perpindahan sujud ke berdiri butuh waktu wajar (${far.toFixed(2)}s)`);
  const p = new ClipPlayer(POSES.sujud!);
  p.play("salat-sedekap"); // klip 1 detik, tetapi jarak sendinya besar
  let peak = 0;
  for (let i = 0; i < 60 * 8; i++) {
    const before = { ...p.getPose() };
    const after = p.update(1 / 60);
    for (const c of CHANNELS) peak = Math.max(peak, Math.abs(after[c] - before[c]) * 60);
  }
  assert.ok(peak <= MAX_ANGULAR_SPEED + 0.15, `kecepatan puncak ${peak.toFixed(2)} rad/s`);
  assert.equal(p.finished, true);
});
