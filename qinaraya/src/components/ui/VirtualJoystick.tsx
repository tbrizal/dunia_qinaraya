import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent } from "react";
import { gameConfig } from "../../config/gameConfig";
import { joystickInput } from "../../systems/input/inputState";

/** Joystick virtual kiri. Mendukung multi-touch: jari lain bebas memutar kamera. */
export function VirtualJoystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);

  const release = useCallback(() => {
    activePointer.current = null;
    joystickInput.x = 0;
    joystickInput.y = 0;
    if (knobRef.current) knobRef.current.style.transform = "translate(0px, 0px)";
  }, []);

  const update = useCallback((clientX: number, clientY: number) => {
    const base = baseRef.current;
    const knob = knobRef.current;
    if (!base || !knob) return;

    const rect = base.getBoundingClientRect();
    const maxRadius = rect.width * 0.32;
    let dx = clientX - (rect.left + rect.width / 2);
    let dy = clientY - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
      dx *= maxRadius / dist;
      dy *= maxRadius / dist;
    }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;

    const nx = dx / maxRadius;
    const ny = dy / maxRadius;
    const magnitude = Math.hypot(nx, ny);
    const dead = gameConfig.input.joystickDeadZone;
    if (magnitude < dead) {
      joystickInput.x = 0;
      joystickInput.y = 0;
      return;
    }
    const scaled = (magnitude - dead) / (1 - dead);
    joystickInput.x = (nx / magnitude) * scaled;
    joystickInput.y = -(ny / magnitude) * scaled; // layar: bawah positif, game: maju positif
  }, []);

  useEffect(() => release, [release]);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointer.current = e.pointerId;
    update(e.clientX, e.clientY);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerId === activePointer.current) update(e.clientX, e.clientY);
  };
  const onEnd = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerId === activePointer.current) release();
  };

  return (
    <div
      ref={baseRef}
      role="application"
      aria-label="Joystick untuk berjalan"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onEnd}
      onPointerCancel={onEnd}
      onLostPointerCapture={onEnd}
      onContextMenu={(e) => e.preventDefault()}
      className="pointer-events-auto relative touch-none select-none rounded-full"
      style={{
        width: "var(--joy-size)",
        height: "var(--joy-size)",
        background: "rgba(31, 42, 46, 0.45)",
        border: "2px solid rgba(230, 216, 180, 0.45)",
      }}
    >
      <div
        ref={knobRef}
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "50%",
          width: "calc(var(--joy-size) * 0.42)",
          height: "calc(var(--joy-size) * 0.42)",
          margin: "calc(var(--joy-size) * -0.21) 0 0 calc(var(--joy-size) * -0.21)",
          background: "rgba(122, 154, 91, 0.9)",
          border: "2px solid rgba(230, 216, 180, 0.8)",
        }}
      />
    </div>
  );
}
