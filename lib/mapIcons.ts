import L from 'leaflet'

export function makeIcon(size: number, bg: string, borderColor = 'white'): L.DivIcon {
  const half = size / 2
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:2px solid ${borderColor};box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half],
    popupAnchor: [0, -(half + 2)],
  })
}
