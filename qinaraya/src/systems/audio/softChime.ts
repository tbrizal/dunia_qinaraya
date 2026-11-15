/**
 * Denting lembut buatan kode (dua nada sinus pendek) untuk pengingat waktu.
 * Sengaja bukan azan atau rekaman apa pun. Default mati; hanya dimainkan bila pemain mengaktifkannya.
 */
let context: AudioContext | null = null;

export function playSoftChime(): void {
  try {
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    context ??= new AudioCtor();
    const ctx = context;
    if (ctx.state === "suspended") void ctx.resume();

    const start = ctx.currentTime;
    [523.25, 659.25].forEach((frequency, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = start + i * 0.28;
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.07, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.2);
    });
  } catch {
    /* audio tidak tersedia: abaikan, game tetap berjalan */
  }
}
