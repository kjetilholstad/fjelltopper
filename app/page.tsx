import { HomeHeroClient } from '@/components/HomeHeroClient'
import { HomeStatsClient } from '@/components/HomeStatsClient'

export const metadata = {
  title: 'Fjelltopper — Norges høyeste topper',
}

export default function Home() {
  return (
    <div>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="bg-parchment px-4 sm:px-6 lg:px-12 pt-10 sm:pt-14 pb-0">
        <div className="max-w-6xl mx-auto">
          <HomeHeroClient />
        </div>

        {/* ── Fjellsilhuett ──────────────────────────────────────── */}
        <div className="w-full mt-10 leading-none pointer-events-none select-none">
          <svg
            viewBox="0 0 1200 100"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            style={{ display: 'block', width: '100%', height: 100 }}
          >
            {/* Layer 1 — bakre rekke, lavest opacity */}
            <path
              d="M0,100 L0,72 L90,52 L180,68 L270,32 L360,58 L450,22 L540,48 L630,14 L720,42 L810,20 L900,44 L990,26 L1080,48 L1150,33 L1200,42 L1200,100 Z"
              fill="#2D5016" fillOpacity="0.15"
            />
            {/* Layer 2 — midtre rekke */}
            <path
              d="M0,100 L0,82 L100,66 L210,78 L320,50 L430,70 L520,40 L610,64 L700,36 L790,56 L870,43 L960,60 L1050,48 L1130,62 L1200,54 L1200,100 Z"
              fill="#2D5016" fillOpacity="0.25"
            />
            {/* Layer 3 — fremre rekke, full opacity */}
            <path
              d="M0,100 L0,96 L70,91 L140,96 L220,80 L300,93 L375,65 L435,84 L495,57 L550,76 L605,88 L665,73 L725,91 L810,83 L895,91 L975,86 L1055,93 L1125,87 L1200,91 L1200,100 Z"
              fill="#2D5016" fillOpacity="1"
            />
            {/* Snøtopp 1 — høyeste punkt ca x=495 */}
            <polygon points="495,57 484,76 506,76" fill="white" fillOpacity="0.88" />
            {/* Snøtopp 2 — nest høyeste ca x=375 */}
            <polygon points="375,65 366,80 384,80" fill="white" fillOpacity="0.88" />
          </svg>
        </div>
      </section>

      {/* ── Stats-bar ───────────────────────────────────────────── */}
      <HomeStatsClient />

    </div>
  )
}
