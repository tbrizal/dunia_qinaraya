import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Color, DirectionalLight, Fog, HemisphereLight } from "three";
import { gameConfig } from "../../config/gameConfig";
import { getAtmosphere } from "../../systems/time/dayNight";
import { gameClock } from "../../systems/time/gameClockInstance";

/** Langit, kabut, dan cahaya mengikuti jam game. Membaca langsung dari Game Clock. */
export function DayNightLighting() {
  const sky = useRef<Color>(null);
  const fog = useRef<Fog>(null);
  const hemi = useRef<HemisphereLight>(null);
  const sun = useRef<DirectionalLight>(null);
  const { backgroundColor, fogNear, fogFar } = gameConfig.scene;

  useFrame(() => {
    const clock = gameClock.getState();
    const hour = clock.hour + (clock.minute + gameClock.getAccumulator()) / 60;
    const atmosphere = getAtmosphere(hour);
    sky.current?.setHex(atmosphere.skyColor);
    fog.current?.color.setHex(atmosphere.skyColor);
    if (hemi.current) hemi.current.intensity = atmosphere.hemiIntensity;
    if (sun.current) {
      sun.current.intensity = atmosphere.dirIntensity;
      sun.current.color.setHex(atmosphere.dirColor);
    }
  });

  return (
    <>
      <color ref={sky} attach="background" args={[backgroundColor]} />
      <fog ref={fog} attach="fog" args={[backgroundColor, fogNear, fogFar]} />
      <hemisphereLight ref={hemi} args={["#e6f0dc", "#6e5d45", 0.95]} />
      <directionalLight ref={sun} position={[-14, 20, 12]} intensity={1.15} color="#ffe6bd" />
    </>
  );
}
