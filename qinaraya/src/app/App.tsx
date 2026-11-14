import { useEffect } from "react";
import { GameCanvas } from "../components/game/GameCanvas";
import { CameraDragSurface } from "../components/ui/CameraDragSurface";
import { ControlsHint } from "../components/ui/ControlsHint";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { FpsLabel } from "../components/ui/FpsLabel";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { SettingsPanel } from "../components/ui/SettingsPanel";
import { TouchControls } from "../components/ui/TouchControls";
import { useKeyboardInput } from "../hooks/useKeyboardInput";
import { useAppStore } from "../stores/useAppStore";

export function App() {
  const sceneReady = useAppStore((s) => s.sceneReady);
  useKeyboardInput();

  // iOS Safari memicu zoom halaman lewat gestur cubit walau viewport sudah dikunci.
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", block);
    return () => document.removeEventListener("gesturestart", block);
  }, []);

  return (
    <ErrorBoundary>
      <div className="relative h-full w-full select-none overflow-hidden">
        <GameCanvas />
        <CameraDragSurface />
        <TouchControls />
        <FpsLabel />
        <ControlsHint />
        <SettingsPanel />
        {!sceneReady && <LoadingScreen />}
      </div>
    </ErrorBoundary>
  );
}
