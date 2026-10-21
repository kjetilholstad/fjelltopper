/** Timer (desimal) som «Xt Ymin». Regner i hele minutter, så 1,999 t blir «2t 0min», ikke «1t 60min». */
export function formatTime(hours: number, hideZeroHours = false): string {
  const totalMin = Math.round(hours * 60)
  const hh = Math.floor(totalMin / 60)
  const mm = totalMin % 60
  return hideZeroHours && hh === 0 ? `${mm}min` : `${hh}t ${mm}min`
}
