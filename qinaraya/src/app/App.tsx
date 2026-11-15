import { useEffect } from "react";
import { GameCanvas } from "../components/game/GameCanvas";
import { ActionPrompt } from "../components/ui/ActionPrompt";
import { CameraDragSurface } from "../components/ui/CameraDragSurface";
import { DialoguePanel } from "../components/ui/DialoguePanel";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { FpsLabel } from "../components/ui/FpsLabel";
import { InventoryPanel } from "../components/ui/InventoryPanel";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { SettingsPanel } from "../components/ui/SettingsPanel";
import { Toast } from "../components/ui/Toast";
import { TopLeftHud } from "../components/ui/TopLeftHud";
import { TouchControls } from "../components/ui/TouchControls";
import { useKeyboardInput } from "../hooks/useKeyboardInput";
import { connectSystemsToClock, saveGame, startAutosave } from "../stores/persistence";
import { useAppStore } from "../stores/useAppStore";

export function App() {
  const sceneReady = useAppStore((s) => s.sceneReady);
  useKeyboardInput();

  // Menghubungkan Game Clock ke sistem lain dan menyalakan autosave selama game berjalan.
  useEffect(() => {
    const disconnect = connectSystemsToClock();
    const stopAutosave = startAutosave();
    return () => {
      saveGame();
      stopAutosave();
      disconnect();
    };
  }, []);

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
        <TopLeftHud />
        <ActionPrompt />
        <FpsLabel />
        <InventoryPanel />
        <SettingsPanel />
        <DialoguePanel />
        <Toast />
        {!sceneReady && <LoadingScreen />}
      </div>
    </ErrorBoundary>
  );
}
