export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(s / 60);
  return `${String(minutes).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}