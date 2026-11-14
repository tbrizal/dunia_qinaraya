import { useRef } from "react";
import type { PointerEvent, WheelEvent } from "react";
import { gameConfig } from "../../config/gameConfig";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { cameraInput } from "../../systems/input/inputState";

interface Point {
  x: number;
  y: number;
}

/**
 * Lapisan transparan di atas canvas untuk memutar kamera.
 * Satu jari / mouse: putar. Dua jari: cubit untuk zoom. Roda mouse: zoom.
 * Joystick dan tombol berada di atasnya, jadi tidak ikut memutar kamera.
 */
export function CameraDragSurface() {
  const pointers = useRef(new Map<number, Point>());

  const pinchDistance = (): number | null => {
    if (pointers.current.size < 2) return null;
    const [a, b] = Array.from(pointers.current.values());
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : null;
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (e.pointerType === "touch" && !useSettingsStore.getState().showTouchControls) {
      useSettingsStore.getState().setShowTouchControls(true);
    }
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;

    if (pointers.current.size === 1) {
      cameraInput.dx += e.clientX - prev.x;
      cameraInput.dy += e.clientY - prev.y;
      prev.x = e.clientX;
      prev.y = e.clientY;
      return;
    }

    const before = pinchDistance();
    prev.x = e.clientX;
    prev.y = e.clientY;
    const after = pinchDistance();
    if (before !== null && after !== null) {
      // Jari merapat (jarak mengecil) = zoom out = jarak kamera bertambah.
      cameraInput.zoom += (before - after) * gameConfig.camera.pinchZoomSpeed;
    }
  };

  const onEnd = (e: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
  };

  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    cameraInput.zoom += e.deltaY * gameConfig.camera.wheelZoomSpeed;
  };

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-[1] cursor-grab touch-none select-none active:cursor-grabbing"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onEnd}
      onPointerCancel={onEnd}
      onLostPointerCapture={onEnd}
      onWheel={onWheel}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
