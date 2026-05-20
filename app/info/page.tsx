import { Mountain, MapPin, Navigation, Route, Upload, PenLine, Calendar, Layers } from 'lucide-react'

// ─── SVG-illustrasjoner ────────────────────────────────────────────────────

function PrimaerfaktorSVG() {
  // Fjell-tverrsnitt: Fjell A (venstre, høyest), sadel, Fjell B (høyre)
  // Peak A: x=115, y=28 | Sadel: x=242, y=115 | Peak B: x=348, y=62
  const mountainPath = 'M 0,168 L 115,28 L 242,115 L 348,62 L 440,168 Z'
  const saddelY = 115
  const peakBY = 62
  const peakBX = 348
  const arrowX = peakBX - 18

  return (
    <svg viewBox="0 0 440 180" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md mx-auto block" aria-label="Illustrasjon av primærfaktor">
      {/* Fjellsilhuett */}
      <path d={mountainPath} fill="#E8E2D9" stroke="#C8BFB2" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Sadel – stiplet horisontal linje */}
      <line x1="200" y1={saddelY} x2="440" y2={saddelY} stroke="#8B6914" strokeWidth="1.2" strokeDasharray="5,4" />

      {/* Primærfaktor-pil (dobbeltpilet, vertikal) */}
      <line x1={arrowX} y1={saddelY} x2={arrowX} y2={peakBY + 6} stroke="#2D5016" strokeWidth="2" />
      {/* Pil opp */}
      <polygon points={`${arrowX},${peakBY} ${arrowX - 5},${peakBY + 10} ${arrowX + 5},${peakBY + 10}`} fill="#2D5016" />
      {/* Pil ned */}
      <polygon points={`${arrowX},${saddelY + 1} ${arrowX - 5},${saddelY - 9} ${arrowX + 5},${saddelY - 9}`} fill="#2D5016" />

      {/* Etikett: Primærfaktor */}
      <text x={arrowX + 9} y={(saddelY + peakBY) / 2 + 4} fontSize="11" fill="#2D5016" fontWeight="600" fontFamily="system-ui, sans-serif">Primærfaktor</text>

      {/* Etikett: Sadel */}
      <text x="210" y={saddelY - 5} fontSize="10" fill="#8B6914" fontFamily="system-ui, sans-serif">sadel</text>

      {/* Etikett: Fjell A */}
      <text x="82" y="20" fontSize="11" fill="#1A1A1A" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">Fjell A</text>
      <text x="82" y="32" fontSize="9.5" fill="#6B6560" textAnchor="middle" fontFamily="system-ui, sans-serif">(høyere)</text>

      {/* Etikett: Fjell B */}
      <text x="348" y="52" fontSize="11" fill="#1A1A1A" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">Fjell B</text>
    </svg>
  )
}

function NaermesteHoyereToppSVG() {
  return (
    <svg viewBox="0 0 440 178" xmlns="http://www.w3.org/2000/svg" className="w-full" aria-label="Luftlinje til nærmeste høyere topp">
      {/* Fjellprofil — sammenhengende polygon */}
      {/* Fjell A (70,18) | Sadel A↔Ditt (175,116) | Ditt fjell (248,80) | Sadel Ditt↔B (325,100) | Fjell B (400,74) */}
      <path d="M 4,145 L 70,18 L 175,116 L 248,80 L 325,100 L 400,74 L 436,145 Z"
            fill="#E8E2D9" stroke="#C8BFB2" strokeWidth="1.3" strokeLinejoin="round"/>

      {/* PF-markering: horisontal referanselinje ved sadelhøyde + vertikal dobbelpil */}
      <line x1="325" y1="100" x2="264" y2="100" stroke="#8B6914" strokeWidth="1" strokeDasharray="3,2"/>
      <line x1="264" y1="87"  x2="264" y2="93"  stroke="#8B6914" strokeWidth="1.5"/>
      <polygon points="264,80 259,89 269,89"   fill="#8B6914"/>
      <polygon points="264,100 259,91 269,91"  fill="#8B6914"/>
      <rect x="269" y="85" width="20" height="12" rx="2" fill="rgba(255,255,255,0.88)"/>
      <text x="270" y="95" fontSize="9" fill="#8B6914" fontWeight="700" fontFamily="system-ui, sans-serif">PF</text>

      {/* Toppmarkører */}
      <circle cx="248" cy="80" r="5"   fill="#2D5016" stroke="white" strokeWidth="2"/>
      <circle cx="400" cy="74" r="4.5" fill="#6B6560"  stroke="white" strokeWidth="1.8"/>

      {/* Etiketter sentrert over toppene */}
      <text x="70"  y="7"  fontSize="10" fill="#6B6560" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">Fjell A</text>
      <text x="248" y="67" fontSize="10" fill="#2D5016" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">Ditt fjell</text>
      <text x="400" y="61" fontSize="10" fill="#1A1A1A" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">Fjell B</text>

      {/* Bakkelinje */}
      <line x1="4" y1="145" x2="436" y2="145" stroke="#E0D9D0" strokeWidth="0.8"/>

      {/* Grå bracket: Fjell A ↔ Ditt fjell */}
      <line x1="70"  y1="155" x2="248" y2="155" stroke="#C8BFB2" strokeWidth="1.2"/>
      <line x1="70"  y1="151" x2="70"  y2="159" stroke="#C8BFB2" strokeWidth="1.2"/>
      <line x1="248" y1="151" x2="248" y2="159" stroke="#C8BFB2" strokeWidth="1.2"/>

      {/* Grønn pilbracket: Ditt fjell → Fjell B */}
      <line x1="248" y1="155" x2="390" y2="155" stroke="#2D5016" strokeWidth="1.5"/>
      <line x1="248" y1="151" x2="248" y2="159" stroke="#2D5016" strokeWidth="1.5"/>
      <polygon points="400,155 388,150 388,160" fill="#2D5016"/>
    </svg>
  )
}

function NaermesteOver2000SVG() {
  return (
    <svg viewBox="0 0 440 178" xmlns="http://www.w3.org/2000/svg" className="w-full" aria-label="Luftlinje til nærmeste topp over 2000 moh">
      {/* Bakkelinje */}
      <line x1="4" y1="138" x2="436" y2="138" stroke="#E0D9D0" strokeWidth="0.8"/>

      {/* Fjell A — svært høyt, til venstre */}
      <path d="M 18,138 L 88,14 L 158,138 Z"   fill="#E8E2D9" stroke="#C8BFB2" strokeWidth="1.2" strokeLinejoin="round"/>
      {/* Ditt fjell — midten */}
      <path d="M 180,138 L 248,74 L 316,138 Z"  fill="#D6CFC4" stroke="#C8BFB2" strokeWidth="1.2" strokeLinejoin="round"/>
      {/* Fjell B — lavere enn Ditt fjell, til høyre */}
      <path d="M 338,138 L 392,106 L 446,138 Z" fill="#E8E2D9" stroke="#C8BFB2" strokeWidth="1.2" strokeLinejoin="round"/>

      {/* Toppmarkører */}
      <circle cx="248" cy="74"  r="5"   fill="#2D5016" stroke="white" strokeWidth="2"/>
      <circle cx="392" cy="106" r="4.5" fill="#8B6914"  stroke="white" strokeWidth="1.8"/>

      {/* Etiketter sentrert over toppene */}
      <text x="88"  y="4"  fontSize="10" fill="#6B6560" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">Fjell A</text>
      <text x="248" y="61" fontSize="10" fill="#2D5016" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">Ditt fjell</text>
      <text x="392" y="93" fontSize="10" fill="#1A1A1A" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">Fjell B</text>

      {/* Grå bracket: |——— 4 000 m ———| */}
      <line x1="88"  y1="150" x2="248" y2="150" stroke="#C8BFB2" strokeWidth="1.2"/>
      <line x1="88"  y1="146" x2="88"  y2="154" stroke="#C8BFB2" strokeWidth="1.2"/>
      <line x1="248" y1="146" x2="248" y2="154" stroke="#C8BFB2" strokeWidth="1.2"/>
      <text x="168" y="163" fontSize="8.5" fill="#A89F96" textAnchor="middle" fontFamily="system-ui, sans-serif">4 000 m</text>

      {/* Gull pilbracket: |——— 2 000 m ———→ */}
      <line x1="248" y1="150" x2="381" y2="150" stroke="#8B6914" strokeWidth="1.5"/>
      <line x1="248" y1="146" x2="248" y2="154" stroke="#8B6914" strokeWidth="1.5"/>
      <polygon points="392,150 380,145 380,155" fill="#8B6914"/>
      <text x="320" y="163" fontSize="8.5" fill="#8B6914" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">2 000 m</text>
    </svg>
  )
}

function HoydeprofilSVG() {
  const sampleDots = [
    { x: 25,  y: 78  }, { x: 60,  y: 92  }, { x: 95,  y: 106 },
    { x: 130, y: 104 }, { x: 165, y: 99  }, { x: 200, y: 113 },
    { x: 235, y: 102 }, { x: 270, y: 86  }, { x: 305, y: 70  },
    { x: 340, y: 65  }, { x: 375, y: 62  }, { x: 415, y: 58  },
  ]
  return (
    <svg viewBox="0 0 440 145" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-lg mx-auto block" aria-label="Høydeprofil med samplingspunkter mellom to topper">
      <line x1="0" y1="132" x2="440" y2="132" stroke="#E0D9D0" strokeWidth="0.8"/>
      <path d="M 25,132 L 25,78 L 110,112 L 155,95 L 205,115 L 310,68 L 415,58 L 415,132 Z"
            fill="#E8E2D9"/>
      <path d="M 25,78 L 110,112 L 155,95 L 205,115 L 310,68 L 415,58"
            fill="none" stroke="#C8BFB2" strokeWidth="1.3"/>
      {sampleDots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="2.5" fill="#2D5016" opacity="0.65"/>
      ))}
      <circle cx="25"  cy="78" r="5" fill="#2D5016" stroke="white" strokeWidth="1.8"/>
      <text x="25"  y="66" fontSize="9.5" fill="#2D5016" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">Topp A</text>
      <circle cx="415" cy="58" r="5" fill="#2D5016" stroke="white" strokeWidth="1.8"/>
      <text x="415" y="46" fontSize="9.5" fill="#2D5016" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">Topp B</text>
    </svg>
  )
}

function NaerliggendeTopperSVG() {
  // Fugleperspektiv: midtpunkt med 1,5 km-radius sirkel og nabotopper
  const cx = 140
  const cy = 118
  const r = 88

  const peaks = [
    { x: 108, y: 74,  pf: 45,  inside: true,  ok: true,  label: 'PF 45 m' },
    { x: 175, y: 82,  pf: 70,  inside: true,  ok: true,  label: 'PF 70 m' },
    { x: 112, y: 152, pf: 30,  inside: true,  ok: true,  label: 'PF 30 m' },
    { x: 185, y: 148, pf: 130, inside: true,  ok: false, label: 'PF 130 m' },
    { x: 38,  y: 55,  pf: 50,  inside: false, ok: false, label: 'for langt unna' },
    { x: 226, y: 158, pf: 60,  inside: false, ok: false, label: 'for langt unna' },
  ]

  return (
    <svg viewBox="0 0 340 235" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto block" aria-label="Illustrasjon av nærliggende topper">

      {/* Radius-sirkel */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2D5016" strokeWidth="1.2" strokeDasharray="6,4" opacity="0.5" />
      {/* Radius-label */}
      <text x={cx + r - 2} y={cy + 13} fontSize="9" fill="#2D5016" opacity="0.7" fontFamily="system-ui, sans-serif">1,5 km</text>

      {/* Nabotopper */}
      {peaks.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x} cy={p.y} r="5"
            fill={p.ok ? '#2D5016' : '#C8BFB2'}
            stroke={p.ok ? '#2D5016' : '#A89F96'}
            strokeWidth="1"
            opacity={p.ok ? 1 : 0.7}
          />
          {/* Checkmark / kryss */}
          {p.ok ? (
            <text x={p.x + 7} y={p.y + 4} fontSize="9" fill="#2D5016" fontWeight="600" fontFamily="system-ui, sans-serif">✓ {p.label}</text>
          ) : (
            <text x={p.x + 7} y={p.y + 4} fontSize="9" fill="#A89F96" fontFamily="system-ui, sans-serif">✗ {p.label}</text>
          )}
        </g>
      ))}

      {/* Midtpunkt */}
      <circle cx={cx} cy={cy} r="7" fill="#2D5016" stroke="white" strokeWidth="2" />
      <text x={cx} y={cy + 20} fontSize="10" fill="#2D5016" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">Din topp</text>

      {/* Forklaring nederst */}
      <g transform="translate(10, 210)">
        <circle cx="6" cy="5" r="4" fill="#2D5016" />
        <text x="14" y="9" fontSize="9" fill="#1A1A1A" fontFamily="system-ui, sans-serif">Regnes som nærliggende</text>
        <circle cx="158" cy="5" r="4" fill="#C8BFB2" />
        <text x="166" y="9" fontSize="9" fill="#6B6560" fontFamily="system-ui, sans-serif">Regnes ikke</text>
      </g>
    </svg>
  )
}

function NaismithFormelSVG() {
  return (
    <svg
      viewBox="0 0 480 80"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg mx-auto block"
      aria-label="Naismiths regel: Gangtid ≈ avstand delt på 5 km/t pluss stigning delt på 600 hm/t"
    >
      {/* "Gangtid ≈" */}
      <text x="4" y="44" fontSize="14" fontWeight="700" fill="#2D5016" fontFamily="system-ui, sans-serif">
        Gangtid ≈
      </text>

      {/* Brøk 1: Avstand / 5 km/t */}
      <g transform="translate(112, 0)">
        <text x="36" y="28" fontSize="12" fontWeight="600" fill="#1A1A1A" textAnchor="middle" fontFamily="system-ui, sans-serif">
          Avstand
        </text>
        <text x="36" y="42" fontSize="10" fill="#6B6560" textAnchor="middle" fontFamily="system-ui, sans-serif">
          (km)
        </text>
        <line x1="0" y1="52" x2="72" y2="52" stroke="#2D5016" strokeWidth="1.8" />
        <text x="36" y="66" fontSize="12" fontWeight="600" fill="#1A1A1A" textAnchor="middle" fontFamily="system-ui, sans-serif">
          5 km/t
        </text>
      </g>

      {/* "+" */}
      <text x="200" y="44" fontSize="18" fontWeight="300" fill="#6B6560" textAnchor="middle" fontFamily="system-ui, sans-serif">
        +
      </text>

      {/* Brøk 2: Stigning / 600 hm/t */}
      <g transform="translate(218, 0)">
        <text x="56" y="28" fontSize="12" fontWeight="600" fill="#1A1A1A" textAnchor="middle" fontFamily="system-ui, sans-serif">
          Akkumulert stigning
        </text>
        <text x="56" y="42" fontSize="10" fill="#6B6560" textAnchor="middle" fontFamily="system-ui, sans-serif">
          (høydemeter)
        </text>
        <line x1="0" y1="52" x2="112" y2="52" stroke="#2D5016" strokeWidth="1.8" />
        <text x="56" y="66" fontSize="12" fontWeight="600" fill="#1A1A1A" textAnchor="middle" fontFamily="system-ui, sans-serif">
          600 hm/t
        </text>
      </g>
    </svg>
  )
}

function InfoTOC() {
  const seksjoner = [
    { n: 1, kort: 'Primærfaktor',  full: 'Hva er primærfaktor?' },
    { n: 2, kort: 'Nærmeste topp', full: 'Nærmeste høyere topp' },
    { n: 3, kort: 'Gangtid',       full: 'Høydeprofil og gangtid' },
    { n: 4, kort: 'Nærliggende',   full: 'Nærliggende topper' },
    { n: 5, kort: 'Bestigning',    full: 'Registrere bestigning' },
    { n: 6, kort: 'Kartvisning',   full: 'Kart og tegnforklaring' },
    { n: 7, kort: 'Planlegger',    full: 'Turplanlegger' },
  ]

  return (
    <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm p-5 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 rounded-full bg-[#2D5016]" />
        <p className="text-xs font-semibold text-[#6B6560] uppercase tracking-widest">Innhold</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {seksjoner.map(({ n, kort, full }) => (
          <a
            key={n}
            href={`#seksjon-${n}`}
            title={full}
            className="group flex items-center gap-2.5 bg-[#F7F4EF] hover:bg-[#f0f5e8] border border-[#E8E2D9] hover:border-[#C8D8A0] rounded-lg px-3 py-2.5 transition-all no-underline"
          >
            <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white group-hover:bg-[#2D5016] border border-[#E8E2D9] group-hover:border-[#2D5016] text-[#2D5016] group-hover:text-white text-xs font-bold transition-all shadow-sm">
              {n}
            </span>
            <span className="text-xs font-medium text-[#6B6560] group-hover:text-[#2D5016] leading-tight transition-colors">
              {kort}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Side ─────────────────────────────────────────────────────────────────

export default function InfoPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF] scroll-smooth">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Ingress */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
            <Mountain size={24} strokeWidth={1.75} className="text-[#2D5016]" />
            Om Fjelltopper
          </h1>
          <p className="text-[#6B6560] leading-relaxed">
            Her finner du forklaringer på begreper og beregninger som brukes i appen — hva primærfaktor betyr,
            hvordan nærliggende topper velges ut, og forskjellen på de to «nærmeste»-feltene.
            Til slutt: hvordan du registrerer bestigninger manuelt eller via GPX.
          </p>
        </div>

        {/* Innholdsfortegnelse */}
        <InfoTOC />

        {/* ── 1. Primærfaktor ── */}
        <section id="seksjon-1" className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm p-6 mb-5">
          <h2 className="text-base font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f5e8] text-[#2D5016] text-xs font-bold">1</span>
            Primærfaktor
          </h2>
          <p className="text-sm text-[#6B6560] leading-relaxed mb-1">
            Primærfaktoren (PF) måler hvor <strong className="text-[#1A1A1A] font-medium">selvstendig</strong> en topp er.
            Den er definert som høydeforskjellen mellom toppen og det laveste <em>sadelpunktet</em> (passet) du
            må krysse for å nå et høyere fjell. Jo høyere PF, desto mer markant og selvstendig er fjellet.
          </p>
          <p className="text-sm text-[#6B6560] leading-relaxed mb-5">
            Galdhøpiggen (2&nbsp;469&nbsp;moh) har PF på 2&nbsp;370&nbsp;m — nærmeste høyere topp
            er Kriváň i Slovakia (2&nbsp;494&nbsp;moh). Det laveste sadelpunktet mellom dem ligger
            på ca.&nbsp;98&nbsp;moh i de sentral-europeiske lavlandene — man trenger altså ikke helt
            ned til havnivå. Glittertinden har PF på 990&nbsp;m. En nabotopp med PF på 15&nbsp;m
            er knapt en selvstendig topp — den er mer en forhøyning på en fjellrygg.
          </p>
          <PrimaerfaktorSVG />
          <p className="text-xs text-[#6B6560] text-center mt-3 italic">
            Primærfaktoren til Fjell B = høyden fra sadelen opp til toppen.
          </p>
        </section>

        {/* ── 2. Nærmeste Høyere Topp vs Nærmeste Over 2000 m ── */}
        <section id="seksjon-2" className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm p-6 mb-5">
          <h2 className="text-base font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f5e8] text-[#2D5016] text-xs font-bold">2</span>
            To ulike «nærmeste»
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="bg-[#F7F4EF] rounded-lg p-4 border border-[#E8E2D9]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Route size={14} className="text-[#2D5016] shrink-0" strokeWidth={1.75} />
                <span className="text-sm font-semibold text-[#1A1A1A]">Nærmeste Høyere Topp</span>
              </div>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Den høyere toppen som er lagret for hvert fjell — hentet fra Peakbagger der tilgjengelig,
                ellers beregnet som nærmeste geografisk høyere topp.
                Avstanden som vises er luftlinje (haversine) til den lagrede toppen.
              </p>
            </div>
            <div className="bg-[#F7F4EF] rounded-lg p-4 border border-[#E8E2D9]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Navigation size={14} className="text-[#8B6914] shrink-0" strokeWidth={1.75} />
                <span className="text-sm font-semibold text-[#1A1A1A]">Nærmeste Over 2000 m</span>
              </div>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Geografisk luftlinjeavstand (haversine) til den nærmeste toppen i databasen
                med primærfaktor ≥ 30&nbsp;m. PF-kravet sikrer at kun selvstendige topper
                telles — ikke forhøyninger på en fjellrygg.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5">
            <div>
              <NaermesteHoyereToppSVG />
              <p className="text-xs text-[#6B6560] text-center mt-2 italic">
                Luftlinje til nærmeste høyere topp
              </p>
            </div>
            <div>
              <NaermesteOver2000SVG />
              <p className="text-xs text-[#6B6560] text-center mt-2 italic">
                Luftlinje til nærmeste topp over 2&nbsp;000 moh (PF ≥ 30&nbsp;m)
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. Høydeprofil og gangtidsestimat ── */}
        <section id="seksjon-3" className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm p-6 mb-5">
          <h2 className="text-base font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f5e8] text-[#2D5016] text-xs font-bold">3</span>
            Høydeprofil og gangtidsestimat
          </h2>
          <p className="text-sm text-[#6B6560] leading-relaxed mb-3">
            Luftlinjeavstand forteller ikke hele historien mellom to topper. For et bedre bilde
            beregnes en høydeprofil ved å sample <strong className="text-[#1A1A1A] font-medium">50 jevnt fordelte punkter</strong> langs
            luftlinjen og hente høyden i hvert punkt fra Kartverkets høydedataAPI. Dette gir en kurve
            over terrenget mellom toppene — vist som de grønne punktene under.
          </p>
          <p className="text-sm text-[#6B6560] leading-relaxed mb-4">
            Fra profilen beregnes <strong className="text-[#1A1A1A] font-medium">akkumulert stigning</strong> — summen av
            alle høydemeter opp langs profilen (nedturer telles ikke med). Deretter brukes
            Naismiths regel for å estimere gangtiden:
          </p>
          <div className="bg-[#f0f5e8] rounded-lg px-4 py-4 border border-[#C8D8A0] mb-5">
            <NaismithFormelSVG />
          </div>
          <HoydeprofilSVG />
          <p className="text-xs text-[#6B6560] text-center mt-3 italic">
            Grønne punkter = 50 samplingspunkter langs luftlinjen. Høyde fra Kartverkets API.
          </p>
          <p className="mt-4 text-xs text-[#6B6560] bg-[#F7F4EF] rounded-lg px-3 py-2 border border-[#E8E2D9] leading-relaxed">
            Estimatet forutsetter jevnt terreng og ingen sti — reell gangtid kan variere betydelig avhengig av underlag og rute.
          </p>

          <div className="mt-5 border-t border-[#E8E2D9] pt-4">
            <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Slik åpner du høydeprofil i kartet</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-3 bg-[#F7F4EF] rounded-lg px-4 py-3 border border-[#E8E2D9]">
                <div className="flex gap-1 shrink-0 mt-1">
                  <div className="w-3 h-3 rounded-full bg-[#D4A017]" />
                  <div className="w-3 h-3 rounded-full bg-[#E8671A]" />
                </div>
                <p className="text-sm text-[#6B6560] leading-relaxed">
                  <strong className="text-[#1A1A1A] font-medium">Via tegnforklaringen:</strong> Velg en topp i kartet og aktiver
                  «Nærmeste høyere fjell» (gull) eller «Nærmeste over 2000 m» (oransje) — profilen åpnes automatisk mellom de to toppene.
                </p>
              </div>
              <div className="flex items-start gap-3 bg-[#F7F4EF] rounded-lg px-4 py-3 border border-[#E8E2D9]">
                <Route size={14} className="mt-0.5 text-[#E8671A] shrink-0" strokeWidth={1.75} />
                <p className="text-sm text-[#6B6560] leading-relaxed">
                  <strong className="text-[#1A1A1A] font-medium">Sammenlign to topper:</strong> Klikk ruteikon-knappen øverst til høyre
                  i kartet. Klikk første topp, deretter andre — kartet zoomer inn til begge og profilen vises.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Nærliggende Topper ── */}
        <section id="seksjon-4" className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm p-6 mb-5">
          <h2 className="text-base font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f5e8] text-[#2D5016] text-xs font-bold">4</span>
            Nærliggende Topper
          </h2>
          <p className="text-sm text-[#6B6560] leading-relaxed mb-4">
            Nærliggende topper er topper du typisk kan ta på <strong className="text-[#1A1A1A] font-medium">samme tur</strong>.
            De beregnes automatisk for alle topper i databasen ut fra tre kriterier — alle tre må være oppfylt:
          </p>

          <div className="flex flex-col gap-2 mb-5">
            {[
              { label: 'Maks 1,5 km unna', desc: 'Luftlinjeavstand fra toppen.' },
              { label: 'Primærfaktor under 100 m', desc: 'Filtrerer bort selvstendige nabofjell — kun underordnede topper vises.' },
              { label: 'Høydeforskjell maks 200 m', desc: 'Sikrer at toppene er på omtrent samme høydenivå.' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-3 bg-[#F7F4EF] rounded-lg px-4 py-3 border border-[#E8E2D9]">
                <span className="mt-0.5 text-[#2D5016]">✓</span>
                <div>
                  <span className="text-sm font-medium text-[#1A1A1A]">{label}</span>
                  <span className="text-sm text-[#6B6560]"> — {desc}</span>
                </div>
              </div>
            ))}
          </div>

          <NaerliggendeTopperSVG />
          <p className="text-xs text-[#6B6560] text-center mt-3 italic">
            Grønne topper oppfyller alle tre kriteriene. Grå topper faller utenfor (for langt unna eller for høy PF).
          </p>
        </section>

        {/* ── 4. Registrere Bestigning ── */}
        <section id="seksjon-5" className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm p-6 mb-5">
          <h2 className="text-base font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f5e8] text-[#2D5016] text-xs font-bold">5</span>
            Registrere Bestigning
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Manuelt */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#f0f5e8] flex items-center justify-center shrink-0">
                  <PenLine size={15} strokeWidth={1.75} className="text-[#2D5016]" />
                </div>
                <span className="text-sm font-semibold text-[#1A1A1A]">Manuelt</span>
              </div>
              <ol className="flex flex-col gap-2">
                {[
                  'Gå til en toppside via Topper-listen eller kartet.',
                  'Klikk «Logg bestigning».',
                  'Fyll inn dato og eventuelt notat.',
                  'Toppen merkes med grønn hake i liste og kart.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#6B6560] leading-snug">
                    <span className="mt-0.5 text-xs font-bold text-[#2D5016] bg-[#f0f5e8] rounded-full w-5 h-5 flex items-center justify-center shrink-0">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Via GPX */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#FDF8EE] flex items-center justify-center shrink-0">
                  <Upload size={15} strokeWidth={1.75} className="text-[#8B6914]" />
                </div>
                <span className="text-sm font-semibold text-[#1A1A1A]">Via GPX-spor</span>
              </div>
              <ol className="flex flex-col gap-2">
                {[
                  'Gå til Profilsiden din.',
                  'Last opp en .gpx-fil fra turen din.',
                  'Appen analyserer sporet og foreslår topper over 2 000 moh som er innenfor 300 m fra sporet.',
                  'Bekreft forslagene og velg dato.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#6B6560] leading-snug">
                    <span className="mt-0.5 text-xs font-bold text-[#8B6914] bg-[#FDF8EE] rounded-full w-5 h-5 flex items-center justify-center shrink-0">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-[#6B6560] bg-[#F7F4EF] rounded-lg px-3 py-2 border border-[#E8E2D9] leading-relaxed">
                🔒 GPX-filen lagres ikke. Sporet analyseres kun i nettleseren din og kastes umiddelbart etter at forslagene er generert.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. Kartvisning og tegnforklaring ── */}
        <section id="seksjon-6" className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm p-6 mb-5">
          <h2 className="text-base font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f5e8] text-[#2D5016] text-xs font-bold">6</span>
            Kartvisning og tegnforklaring
          </h2>
          <p className="text-sm text-[#6B6560] leading-relaxed mb-4">
            I kartvisningen kan du tegne linjer mellom topper for å visualisere topografiske relasjoner.
            Linjene aktiveres via tegnforklaringen — men først må du <strong className="text-[#1A1A1A] font-medium">velge en topp</strong> ved å klikke på den i kartet.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 items-start">

            {/* Mockup av tegnforklaringen */}
            <div className="bg-white rounded-xl shadow-md border border-[#E8E2D9] px-3 py-2.5 flex flex-col gap-0.5 shrink-0 w-56">
              <p className="text-[10px] font-semibold text-[#6B6560] uppercase tracking-wide mb-1">Tegnforklaring</p>

              {/* Valgt topp — ikke klikkbar */}
              <div className="flex items-center gap-2 px-1.5 py-1">
                <div className="w-[18px] h-[18px] rounded-full bg-[#1A3A0A] border-[1.5px] border-white shadow shrink-0" />
                <span className="text-xs text-[#1A1A1A]">Valgt topp</span>
              </div>

              {/* Nærmeste høyere fjell — klikkbar */}
              <div className="flex items-center gap-2 rounded-lg px-1.5 py-1 -mx-1.5 bg-[#F7F4EF] cursor-pointer">
                <div className="w-[13px] h-[13px] rounded-full bg-[#D4A017] border-[1.5px] border-white shadow shrink-0" />
                <svg width="20" height="10" viewBox="0 0 20 10" className="shrink-0">
                  <line x1="0" y1="5" x2="20" y2="5" stroke="#D4A017" strokeWidth="2" strokeDasharray="4 3" />
                </svg>
                <span className="text-xs text-[#1A1A1A]">Nærmeste høyere fjell</span>
                <span className="ml-auto text-[10px] font-semibold text-[#D4A017]">På</span>
              </div>

              {/* Nærmeste over 2000 m — klikkbar, inaktiv */}
              <div className="flex items-center gap-2 rounded-lg px-1.5 py-1 -mx-1.5 hover:bg-[#F7F4EF] cursor-pointer">
                <div className="w-[13px] h-[13px] rounded-full bg-[#E8671A] border-[1.5px] border-white shadow shrink-0" />
                <svg width="20" height="10" viewBox="0 0 20 10" className="shrink-0">
                  <line x1="0" y1="5" x2="20" y2="5" stroke="#E8671A" strokeWidth="2" strokeDasharray="4 3" />
                </svg>
                <span className="text-xs text-[#1A1A1A]">Nærmeste over 2000 m (PF ≥ 30 m)</span>
              </div>

              {/* Nærliggende topper — klikkbar, inaktiv */}
              <div className="flex items-center gap-2 rounded-lg px-1.5 py-1 -mx-1.5 hover:bg-[#F7F4EF] cursor-pointer">
                <div className="w-[11px] h-[11px] rounded-full bg-[#DC2626] border-[1.5px] border-white shadow shrink-0" />
                <svg width="20" height="10" viewBox="0 0 20 10" className="shrink-0">
                  <line x1="0" y1="5" x2="20" y2="5" stroke="#DC2626" strokeWidth="2" />
                </svg>
                <span className="text-xs text-[#1A1A1A]">Nærliggende topper</span>
              </div>

              {/* Separator */}
              <div className="border-t border-[#E8E2D9] my-1" />

              {/* Bestigning registrert */}
              <div className="flex items-center gap-2 px-1.5 py-1">
                <div className="w-[11px] h-[11px] rounded-full bg-white border-2 border-[#2D5016] shadow shrink-0" />
                <span className="text-xs text-[#1A1A1A]">Bestigning registrert</span>
              </div>

              {/* Topp */}
              <div className="flex items-center gap-2 px-1.5 py-1">
                <div className="w-[9px] h-[9px] rounded-full bg-[#2D5016] border-[1.5px] border-white shadow shrink-0" />
                <span className="text-xs text-[#1A1A1A]">Topp</span>
              </div>
            </div>

            {/* Forklaring ved siden av */}
            <div className="flex flex-col gap-3 text-sm text-[#6B6560]">
              <p className="leading-relaxed">
                De tre øverste radene med fargede linjer er <strong className="text-[#1A1A1A] font-medium">klikkbare</strong> når du har valgt en topp.
                Klikk én gang for å tegne linjen, klikk igjen for å skjule den.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { color: '#D4A017', label: 'Nærmeste høyere fjell', desc: 'Stiplet gul linje til den topografisk nærmeste høyere toppen. Åpner høydeprofil automatisk.' },
                  { color: '#E8671A', label: 'Nærmeste over 2000 m (PF ≥ 30 m)',  desc: 'Stiplet oransje linje til den geografisk nærmeste toppen over 2 000 moh med primærfaktor ≥ 30 m. Åpner høydeprofil automatisk.' },
                  { color: '#DC2626', label: 'Nærliggende topper',    desc: 'Røde linjer til alle topper som oppfyller nærliggende-kriteriene.' },
                ].map(({ color, label, desc }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <div className="mt-1 w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                    <p><span className="font-medium text-[#1A1A1A]">{label}:</span> {desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs bg-[#F7F4EF] rounded-lg px-3 py-2 border border-[#E8E2D9] leading-relaxed">
                Radene er grået ut så lenge ingen topp er valgt. Klikk på en toppmarkør i kartet for å aktivere dem.
              </p>
            </div>
          </div>
        </section>

        {/* ── 7. Turplanlegger ── */}
        <section id="seksjon-7" className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm p-6 mb-5">
          <h2 className="text-base font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f5e8] text-[#2D5016] text-xs font-bold">7</span>
            Turplanlegger
          </h2>
          <p className="text-sm text-[#6B6560] leading-relaxed mb-4">
            Turplanleggeren lar deg sette sammen en rute med flere stopp, se distanse og høydeprofil,
            og laste ned ruten som GPX. Du finner den under <strong className="text-[#1A1A1A] font-medium">Planlegg</strong> i menyen.
          </p>

          {/* Slik legger du til vegpunkter */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-[#1A1A1A] mb-2">Slik legger du til vegpunkter</p>
            <div className="flex flex-col gap-2">
              {[
                {
                  icon: <MapPin size={14} className="text-[#2D5016] shrink-0 mt-0.5" strokeWidth={1.75} />,
                  text: <><strong className="text-[#1A1A1A] font-medium">Klikk på kartet</strong> for å plassere et vegpunkt akkurat der du vil.</>,
                },
                {
                  icon: <div className="w-3.5 h-3.5 rounded-full bg-[#2D5016] border-[1.5px] border-white shadow shrink-0 mt-0.5" />,
                  text: <><strong className="text-[#1A1A1A] font-medium">Klikk på en fjelltopp</strong> (grønn markør) for å legge den til som vegpunkt med navn.</>,
                },
                {
                  icon: <div className="w-3.5 h-3.5 rounded-full bg-[#E8671A] border-[1.5px] border-white shadow shrink-0 mt-0.5" />,
                  text: <>Vegpunkter kan <strong className="text-[#1A1A1A] font-medium">dras</strong> til ny posisjon direkte i kartet. <strong className="text-[#1A1A1A] font-medium">Høyreklikk</strong> (eller trykk lenge på mobil) for å slette.</>,
                },
                {
                  icon: <span className="text-[#2D5016] font-bold text-sm shrink-0 mt-0.5">↑↓</span>,
                  text: <>Rekkefølgen på vegpunkter kan endres med <strong className="text-[#1A1A1A] font-medium">pilknappene</strong> i sidepanelet.</>,
                },
              ].map(({ icon, text }, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#F7F4EF] rounded-lg px-4 py-3 border border-[#E8E2D9]">
                  {icon}
                  <p className="text-sm text-[#6B6560] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ruting langs stier */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-[#1A1A1A] mb-2">Ruting langs stier — per etappe</p>
            <p className="text-sm text-[#6B6560] leading-relaxed mb-3">
              Hver etappe mellom to vegpunkter kan velge mellom to rutingmodi.
              Bytt modus med knappen som vises mellom vegpunktene i sidepanelet:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#F7F4EF] rounded-lg px-4 py-3 border border-[#E8E2D9]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-[#2D5016] bg-[#f0f5e8] border border-[#2D5016]/30 rounded px-1.5">~</span>
                  <span className="text-sm font-semibold text-[#1A1A1A]">Rute langs sti</span>
                </div>
                <p className="text-xs text-[#6B6560] leading-relaxed">
                  GraphHopper beregner korteste vei langs merkede stier og veier. Viser reell gangdistanse og
                  korrekt høydeprofil. Krever nettforbindelse. Vises som heltrukken linje på kartet.
                </p>
              </div>
              <div className="bg-[#F7F4EF] rounded-lg px-4 py-3 border border-[#E8E2D9]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-[#A89F96] bg-[#F7F4EF] border border-[#E8E2D9] rounded px-1.5">—</span>
                  <span className="text-sm font-semibold text-[#1A1A1A]">Rett linje</span>
                </div>
                <p className="text-xs text-[#6B6560] leading-relaxed">
                  Luftlinje mellom vegpunktene med høydeprofil fra Kartverkets høyde-API. Egnet for fri
                  fjellferd uten merkede stier. Vises som stiplet linje på kartet.
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#6B6560] bg-[#F7F4EF] rounded-lg px-3 py-2 border border-[#E8E2D9]">
              Når et vegpunkt er plassert utenfor en merkede sti, vil snap-ruten inkludere en stiplet oransje linje
              fra vegpunktet bort til nærmeste sti — slik at ruten alltid går fra ditt faktiske vegpunkt.
            </p>
          </div>

          {/* Statistikk og høydeprofil */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-[#1A1A1A] mb-2">Statistikk og høydeprofil</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-3 bg-[#F7F4EF] rounded-lg px-4 py-3 border border-[#E8E2D9]">
                <Calendar size={14} className="text-[#2D5016] shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-sm text-[#6B6560] leading-relaxed">
                  Sidepanelet viser <strong className="text-[#1A1A1A] font-medium">total distanse, gangtid, stigning og nedstigning</strong> for hele
                  ruten. Gangtiden beregnes med Naismiths regel (se seksjon 3).
                </p>
              </div>
              <div className="flex items-start gap-3 bg-[#F7F4EF] rounded-lg px-4 py-3 border border-[#E8E2D9]">
                <Route size={14} className="text-[#2D5016] shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-sm text-[#6B6560] leading-relaxed">
                  En <strong className="text-[#1A1A1A] font-medium">høydeprofil</strong> for hele ruten vises i bunnen av kartet når du har
                  minst to vegpunkter. Klikk på <strong className="text-[#1A1A1A] font-medium">↗-ikonet</strong> for å åpne profilen i stor
                  visning — der ser du vegpunkt-navn langs ruten, høyde på start og slutt, og
                  fjelltopper langs ruten markert med navn og høyde.
                </p>
              </div>
            </div>
          </div>

          {/* Kartlag og GPX */}
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A] mb-2">Kartlag og GPX-eksport</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#F7F4EF] rounded-lg px-4 py-3 border border-[#E8E2D9]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Layers size={14} className="text-[#2D5016] shrink-0" strokeWidth={1.75} />
                  <span className="text-sm font-semibold text-[#1A1A1A]">Kartlag</span>
                </div>
                <p className="text-xs text-[#6B6560] leading-relaxed">
                  Velg mellom <strong className="text-[#1A1A1A] font-medium">Kartverket Topo</strong> (norsk offisielt kart)
                  og <strong className="text-[#1A1A1A] font-medium">OpenTopoMap</strong> (globalt topografisk kart med
                  tydelige stinett) via knappene i sidepanelet.
                </p>
              </div>
              <div className="bg-[#F7F4EF] rounded-lg px-4 py-3 border border-[#E8E2D9]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Upload size={14} className="text-[#8B6914] shrink-0" strokeWidth={1.75} />
                  <span className="text-sm font-semibold text-[#1A1A1A]">Last ned GPX</span>
                </div>
                <p className="text-xs text-[#6B6560] leading-relaxed">
                  Klikk <strong className="text-[#1A1A1A] font-medium">GPX</strong>-knappen nederst i sidepanelet for å laste ned ruten.
                  Du kan gi filen et eget navn (f.eks. «Jotunheimen-rundtur») — standardnavn
                  genereres automatisk fra første og siste vegpunkt.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}
