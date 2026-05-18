import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a distance in metres: < 1500 m → "X m", ≥ 1500 m → "X,Y km" */
export function formatDist(m: number): string {
  return m < 1500
    ? Math.round(m).toLocaleString('no') + ' m'
    : (m / 1000).toFixed(1).replace('.', ',') + ' km'
}
