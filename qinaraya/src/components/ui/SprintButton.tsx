import { useEffect, useState } from "react";
import type { PointerEvent } from "react";
import { touchButtons } from "../../systems/input/inputState";

/** Tombol lari: tahan untuk berlari. */
export function SprintButton() {
  const [pressed, setPressed] = useState(false);

  useEffect(
    () => () => {
      touchButtons.sprint = false;
    },
    [],
  );

  const press = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    touchButtons.sprint = true;
    setPressed(true);
  };
  const release = () => {
    touchButtons.sprint = false;
    setPressed(false);
  };

  return (
    <button
      type="button"
      aria-label="Lari (tahan)"
      aria-pressed={pressed}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(e) => e.preventDefault()}
      className="pointer-events-auto touch-none select-none rounded-full text-base font-bold"
      style={{
        width: "var(--btn-size)",
        height: "var(--btn-size)",
        color: "var(--qin-sand)",
        background: pressed ? "rgba(217, 120, 74, 0.9)" : "rgba(31, 42, 46, 0.55)",
        border: "2px solid rgba(230, 216, 180, 0.6)",
      }}
    >
      Lari
    </button>
  );
}
