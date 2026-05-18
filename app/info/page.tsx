import { Mountain, MapPin, Navigation, Route, Upload, PenLine } from 'lucide-react'

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

function ToNaermesteSVG() {
  // To paneler side om side: topografisk rute vs. luftlinje
  return (
    <svg viewBox="0 0 440 170" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-lg mx-auto block" aria-label="Forskjell på nærmeste høyere topp og nærmeste topp over 2000m">

      {/* ── Venstre panel: Nærmeste Høyere Topp ── */}
      {/* Fjell 1 (nåværende) */}
      <path d="M 0,130 L 60,50 L 120,130 Z" fill="#E8E2D9" stroke="#C8BFB2" strokeWidth="1.2" />
      {/* Sadel og fjell 2 */}
      <path d="M 100,130 L 140,100 L 180,55 L 220,130 Z" fill="#D6CFC4" stroke="#C8BFB2" strokeWidth="1.2" />

      {/* Buet pil over sadelen (topografisk rute) */}
      <path d="M 60,46 Q 140,10 180,51" fill="none" stroke="#2D5016" strokeWidth="2" strokeDasharray="5,3" />
      <polygon points="180,51 168,48 172,60" fill="#2D5016" />

      {/* Toppmarkører */}
      <circle cx="60" cy="50" r="4" fill="#2D5016" />
      <circle cx="180" cy="55" r="4" fill="#6B6560" />

      {/* Label: "over sadel" */}
      <text x="110" y="12" fontSize="9" fill="#2D5016" textAnchor="middle" fontFamily="system-ui, sans-serif" fontStyle="italic">via laveste pass</text>

      {/* Tittel venstre */}
      <text x="110" y="150" fontSize="11" fill="#1A1A1A" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">Nærmeste Høyere Topp</text>
      <text x="110" y="164" fontSize="9.5" fill="#6B6560" textAnchor="middle" fontFamily="system-ui, sans-serif">topografisk / terrengstyrt</text>

      {/* ── Skillelinje ── */}
      <line x1="220" y1="10" x2="220" y2="135" stroke="#E8E2D9" strokeWidth="1.5" />

      {/* ── Høyre panel: Nærmeste Topp Over 2000 m ── */}
      {/* Referansefjell */}
      <path d="M 225,130 L 280,45 L 335,130 Z" fill="#E8E2D9" stroke="#C8BFB2" strokeWidth="1.2" />
      {/* Nærmeste over 2000 m (kortere avstand) */}
      <path d="M 355,130 L 390,70 L 440,130 Z" fill="#D6CFC4" stroke="#C8BFB2" strokeWidth="1.2" />

      {/* Rett stiplet linje mellom toppene */}
      <line x1="280" y1="45" x2="390" y2="70" stroke="#8B6914" strokeWidth="2" strokeDasharray="6,3" />
      <polygon points="390,70 379,60 383,73" fill="#8B6914" />

      {/* Toppmarkører */}
      <circle cx="280" cy="45" r="4" fill="#2D5016" />
      <circle cx="390" cy="70" r="4" fill="#8B6914" />

      {/* Label: "luftlinje" */}
      <text x="335" y="43" fontSize="9" fill="#8B6914" textAnchor="middle" fontFamily="system-ui, sans-serif" fontStyle="italic">luftlinje</text>

      {/* Tittel høyre */}
      <text x="332" y="150" fontSize="11" fill="#1A1A1A" fontWeight="600" textAnchor="middle" fontFamily="system-ui, sans-serif">Nærmeste Over 2000 m</text>
      <text x="332" y="164" fontSize="9.5" fill="#6B6560" textAnchor="middle" fontFamily="system-ui, sans-serif">geografisk / haversine-avstand</text>
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

// ─── Side ─────────────────────────────────────────────────────────────────

export default function InfoPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
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

        {/* ── 1. Primærfaktor ── */}
        <section className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm p-6 mb-5">
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
            Galdhøpiggen har PF på 1&nbsp;850&nbsp;m — det finnes ingen høyere topp i Norge, så man
            må ned til havnivå for å finne et høyere fjell i Europa. Glittertinden har PF på 986&nbsp;m.
            En nabotopp med PF på 15&nbsp;m er knapt en selvstendig topp — den er mer en forhøyning på en fjellrygg.
          </p>
          <PrimaerfaktorSVG />
          <p className="text-xs text-[#6B6560] text-center mt-3 italic">
            Primærfaktoren til Fjell B = høyden fra sadelen opp til toppen.
          </p>
        </section>

        {/* ── 2. Nærmeste Høyere Topp vs Nærmeste Over 2000 m ── */}
        <section className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm p-6 mb-5">
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
                Et topografisk konsept: den toppen du må krysse det laveste passet for å nå noe høyere.
                Kan ligge langt unna geografisk — terrenget bestemmer, ikke fuglen.
                Brukes i beregningen av primærfaktor.
              </p>
            </div>
            <div className="bg-[#F7F4EF] rounded-lg p-4 border border-[#E8E2D9]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Navigation size={14} className="text-[#8B6914] shrink-0" strokeWidth={1.75} />
                <span className="text-sm font-semibold text-[#1A1A1A]">Nærmeste Over 2000 m</span>
              </div>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Ren geografisk luftlinjeavstand til den nærmeste toppen i databasen som er registrert
                over 2&nbsp;000 moh. Beregnes med haversine-formelen fra koordinatene.
              </p>
            </div>
          </div>

          <ToNaermesteSVG />
          <p className="text-xs text-[#6B6560] text-center mt-3 italic">
            Venstre: topografisk rute via laveste pass. Høyre: korteste luftlinje til nærmeste 2000-mtopp.
          </p>
        </section>

        {/* ── 3. Nærliggende Topper ── */}
        <section className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm p-6 mb-5">
          <h2 className="text-base font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f5e8] text-[#2D5016] text-xs font-bold">3</span>
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
        <section className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm p-6 mb-5">
          <h2 className="text-base font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f5e8] text-[#2D5016] text-xs font-bold">4</span>
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
        <section className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm p-6 mb-5">
          <h2 className="text-base font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f5e8] text-[#2D5016] text-xs font-bold">5</span>
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
                <span className="text-xs text-[#1A1A1A]">Nærmeste over 2000 m</span>
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
                  { color: '#D4A017', label: 'Nærmeste høyere fjell', desc: 'Stiplet gul linje til den topografisk nærmeste høyere toppen.' },
                  { color: '#E8671A', label: 'Nærmeste over 2000 m',  desc: 'Stiplet oransje linje til den geografisk nærmeste toppen over 2 000 moh.' },
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

      </div>
    </main>
  )
}
