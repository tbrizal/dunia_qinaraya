import { useLayoutEffect, useRef } from "react";
import { Color, Object3D } from "three";
import type { InstancedMesh } from "three";
import { villageLayout } from "./villageLayout";
import type { TreeSpec } from "./villageLayout";

const LEAF_A = new Color("#4f8a4a");
const LEAF_B = new Color("#7aa653");
const BUSH_A = new Color("#5f9a4e");
const BUSH_B = new Color("#86b25a");

/**
 * Semua pohon digambar dengan InstancedMesh (3 draw call untuk ratusan pohon),
 * agar tetap ringan di perangkat mobile.
 */
function Trees({ trees }: { trees: readonly TreeSpec[] }) {
  const trunkRef = useRef<InstancedMesh>(null);
  const crownRef = useRef<InstancedMesh>(null);
  const topRef = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const trunk = trunkRef.current;
    const crown = crownRef.current;
    const top = topRef.current;
    if (!trunk || !crown || !top) return;
    const dummy = new Object3D();
    const color = new Color();

    trees.forEach((t, i) => {
      dummy.rotation.set(0, t.tint * Math.PI * 2, 0);

      dummy.position.set(t.x, 0.9 * t.scale, t.z);
      dummy.scale.set(t.scale, t.scale, t.scale);
      dummy.updateMatrix();
      trunk.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.x, 2.4 * t.scale, t.z);
      dummy.scale.set(1.5 * t.scale, 1.25 * t.scale, 1.5 * t.scale);
      dummy.updateMatrix();
      crown.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.x, 3.5 * t.scale, t.z);
      dummy.scale.set(1.0 * t.scale, 0.9 * t.scale, 1.0 * t.scale);
      dummy.updateMatrix();
      top.setMatrixAt(i, dummy.matrix);

      color.copy(LEAF_A).lerp(LEAF_B, t.tint);
      crown.setColorAt(i, color);
      top.setColorAt(i, color);
    });

    for (const mesh of [trunk, crown, top]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, [trees]);

  return (
    <>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.2, 0.28, 1.8, 6]} />
        <meshStandardMaterial color="#6b4a32" flatShading />
      </instancedMesh>
      <instancedMesh ref={crownRef} args={[undefined, undefined, trees.length]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffffff" flatShading />
      </instancedMesh>
      <instancedMesh ref={topRef} args={[undefined, undefined, trees.length]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffffff" flatShading />
      </instancedMesh>
    </>
  );
}

function Bushes({ bushes }: { bushes: readonly TreeSpec[] }) {
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new Object3D();
    const color = new Color();
    bushes.forEach((b, i) => {
      dummy.rotation.set(0, b.tint * Math.PI * 2, 0);
      dummy.position.set(b.x, 0.4 * b.scale, b.z);
      dummy.scale.set(b.scale, 0.75 * b.scale, b.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.copy(BUSH_A).lerp(BUSH_B, b.tint);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [bushes]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, bushes.length]} frustumCulled={false}>
      <icosahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial color="#ffffff" flatShading />
    </instancedMesh>
  );
}

export function Vegetation() {
  const { interiorTrees, forestTrees, bushes } = villageLayout;
  return (
    <>
      <Trees trees={interiorTrees} />
      <Trees trees={forestTrees} />
      <Bushes bushes={bushes} />
    </>
  );
}
