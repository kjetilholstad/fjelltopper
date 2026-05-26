/**
 * Populer description, image_url og image_credit for alle fjelltopper.
 *
 * Kjør fra fjelltopper/-mappen:
 *   npx tsx scripts/populate-peak-content.ts             # full kjøring
 *   npx tsx scripts/populate-peak-content.ts --dry-run   # forhåndsvisning
 *   npx tsx scripts/populate-peak-content.ts --limit 5   # test med 5 topper
 *   npx tsx scripts/populate-peak-content.ts --skip-images # kun beskrivelser
 *
 * Beskrivelser leses fra scripts/peak-descriptions.json (generert av Claude).
 * Faller tilbake til mal-beskrivelse hvis ID ikke finnes i JSON.
 */

import fs from 'fs';
import path from 'path';

// Les inn forhåndsgenererte beskrivelser
const descriptionsPath = path.join(process.cwd(), 'scripts', 'peak-descriptions.json');
const PEAK_DESCRIPTIONS: Record<string, string> = JSON.parse(
  fs.readFileSync(descriptionsPath, 'utf-8')
);

const SUPABASE_URL = "https://enrbraxvxnytyfeuewqq.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVucmJyYXh2eG55dHlmZXVld3FxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg2ODY3MCwiZXhwIjoyMDk0NDQ0NjcwfQ.4vxGMgeIoBZEh9PoLcZdxq0-00jOMiIjyOUR7JHX-6s";

const HEADERS: Record<string, string> = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

// Filtrerer på filnavn (siste del av URL) — ikke hele pathen
// Holdes bevisst kort for å unngå å blokkere gyldige fjellbilder
const SKIP_KEYWORDS = [
  "map", "logo", "icon", "coat", "flag", "symbol",
  "locator", "topographic", "outline",
  "hytte", "hotel", "hytter", "lodge",
];

function isSkippable(url: string): boolean {
  // Hent kun filnavnet, ikke hele URL-pathen
  const filename = url.split("/").pop()?.toLowerCase() ?? "";
  return SKIP_KEYWORDS.some((kw) => filename.includes(kw));
}

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN     = args.includes("--dry-run");
const SKIP_IMAGES = args.includes("--skip-images");
const FORCE       = args.includes("--force"); // overskriver eksisterende innhold
const limitIdx    = args.indexOf("--limit");
const LIMIT       = limitIdx !== -1 ? parseInt(args[limitIdx + 1]) : null;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Peak {
  id: string;
  name: string;
  height: number;
  county: string | null;
  municipality: string | null;
  primary_factor: number | null;
  nearest_higher_peak: string | null;
  description: string | null;
  image_url: string | null;
}

// ---------------------------------------------------------------------------
// Beskrivelse — henter fra JSON, faller tilbake til mal
// ---------------------------------------------------------------------------

function generateDescription(peak: Peak): string {
  // Bruk forhåndsgenerert beskrivelse hvis tilgjengelig
  if (PEAK_DESCRIPTIONS[peak.id]) {
    return PEAK_DESCRIPTIONS[peak.id];
  }

  // Fallback: mal-beskrivelse
  const { height, county, municipality, primary_factor: pf, nearest_higher_peak: nhp } = peak;
  const sentences: string[] = [];

  if (municipality && county) {
    sentences.push(
      `Toppen ligger i ${municipality} kommune i ${county} og er ${height} meter over havet.`
    );
  } else if (county) {
    sentences.push(`Toppen ligger i ${county} og er ${height} meter over havet.`);
  } else {
    sentences.push(`Toppen er ${height} meter over havet.`);
  }

  if (pf != null) {
    if (pf >= 500) {
      sentences.push(
        `Med en primærfaktor på ${pf} meter er den et markant og selvstendig fjell i terrenget.`
      );
    } else if (pf >= 100) {
      sentences.push(
        `Primærfaktoren på ${pf} meter gjør den til en tydelig selvstendig topp.`
      );
    } else if (pf >= 30) {
      sentences.push(`Primærfaktoren er ${pf} meter.`);
    }
  }

  if (nhp) {
    sentences.push(`Nærmeste høyere topp er ${nhp}.`);
  }

  return sentences.join(" ");
}

// ---------------------------------------------------------------------------
// Wikimedia Commons
// ---------------------------------------------------------------------------

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "").trim();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Fjern vanlige norske retningssufikser for å bedre søketreff
// "Store Styggedalstinden Østtoppen" → "Store Styggedalstinden"
function baseName(name: string): string {
  return name
    .replace(/\s+(Østtoppen|Vesttoppen|Nordtoppen|Sørtoppen|Midttoppen|Fortoppen|Sørøsttoppen|Nordøsttoppen|Sørvesttoppen|Nordvesttoppen|N\d+|S\d+|V\d+|Ø\d+|SØ\d+|NV\d+|NØ\d+|SV\d+)$/i, "")
    .trim();
}

async function fetchWikimediaImage(
  peakName: string
): Promise<{ url: string; credit: string | null } | null> {
  const base = baseName(peakName);
  // Prøv norsk søk først — fungerer best for norske fjellnavn
  const queries = [
    base,
    `${base} fjell`,
    `${base} mountain`,
  ];
  // Ikke dupliser hvis basename == peakName
  if (base !== peakName) queries.push(peakName);

  for (const query of queries) {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrnamespace: "6",
      gsrsearch: query,
      gsrlimit: "20",          // økt fra 8 → 20
      prop: "imageinfo",
      iiprop: "url|extmetadata|mime",
      iiurlwidth: "800",
      format: "json",
      origin: "*",
    });

    try {
      const resp = await fetch(
        `https://commons.wikimedia.org/w/api.php?${params}`
      );
      const text = await resp.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        await sleep(2000);
        continue;
      }
      const pages: Record<string, any> = data?.query?.pages ?? {};

      for (const page of Object.values(pages)) {
        const ii = page?.imageinfo?.[0];
        if (!ii) continue;

        const mime: string = ii.mime ?? "";
        const url: string  = ii.thumburl ?? ii.url ?? "";

        if (!mime.startsWith("image/jpeg") && !mime.startsWith("image/png")) continue;
        if (isSkippable(url)) continue;

        const meta        = ii.extmetadata ?? {};
        const artist      = stripHtml(meta?.Artist?.value ?? "");
        const licenseName = meta?.LicenseShortName?.value ?? "";
        const credit      = [artist, licenseName].filter(Boolean).join(" / ") || null;

        return { url, credit };
      }
    } catch (e) {
      console.error(`    ⚠ Wikimedia-feil for '${query}': ${e}`);
    }

    await sleep(200);
  }

  return null;
}

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

async function fetchPeaks(): Promise<Peak[]> {
  const params = new URLSearchParams({
    select:
      "id,name,height,county,municipality,primary_factor,nearest_higher_peak,description,image_url",
    height: "gte.2000",
    order:  "height.desc",
    limit:  "500",
  });

  const resp = await fetch(`${SUPABASE_URL}/rest/v1/peaks?${params}`, {
    headers: HEADERS,
  });

  if (!resp.ok) {
    throw new Error(`Supabase feil: ${resp.status} ${await resp.text()}`);
  }
  return resp.json();
}

async function updatePeak(
  id: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/peaks?id=eq.${id}`, {
    method:  "PATCH",
    headers: HEADERS,
    body:    JSON.stringify(payload),
  });
  return resp.status === 200 || resp.status === 204;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (DRY_RUN)  console.log("🔍 DRY-RUN — ingenting skrives til Supabase\n");

  console.log("Henter topper fra Supabase...");
  const peaks = await fetchPeaks();
  console.log(`Fant ${peaks.length} topper totalt`);

  let toProcess = FORCE
    ? peaks
    : peaks.filter((p) => !p.description || !p.image_url);
  console.log(`Skal behandle: ${toProcess.length} topper${FORCE ? " (--force, inkl. eksisterende)" : " (mangler innhold)"}\n`);

  if (LIMIT) {
    toProcess = toProcess.slice(0, LIMIT);
    console.log(`Begrenset til ${toProcess.length} topper (--limit)\n`);
  }

  let okDesc = 0, okImg = 0, errors = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const peak = toProcess[i];
    console.log(`[${i + 1}/${toProcess.length}] ${peak.name} (${peak.height} m)`);

    const payload: Record<string, unknown> = {};

    // Beskrivelse
    if (!peak.description || FORCE) {
      const desc = generateDescription(peak);
      payload.description = desc;
      okDesc++;
      console.log(`    📝 ${desc.slice(0, 90)}`);
    }

    // Bilde
    if ((!peak.image_url || FORCE) && !SKIP_IMAGES) {
      const img = await fetchWikimediaImage(peak.name);
      if (img) {
        payload.image_url    = img.url;
        payload.image_credit = img.credit;
        okImg++;
        console.log(`    🖼  ${img.url.slice(0, 70)}`);
        if (img.credit) console.log(`    ©  ${img.credit}`);
      } else {
        console.log(`    – Ingen Wikimedia-bilde funnet`);
      }
      await sleep(300);
    }

    // Skriv til Supabase
    if (Object.keys(payload).length > 0) {
      if (!DRY_RUN) {
        const ok = await updatePeak(peak.id, payload);
        if (!ok) {
          console.error(`    ❌ Feil ved oppdatering av ${peak.name}`);
          errors++;
        }
      } else {
        console.log(`    [DRY-RUN] ville skrevet: ${Object.keys(payload).join(", ")}`);
      }
    }
  }

  console.log(`\n✅ Ferdig!`);
  console.log(`   Beskrivelser skrevet: ${okDesc}`);
  console.log(`   Bilder hentet:        ${okImg}`);
  if (errors) console.log(`   Feil:                 ${errors}`);
  if (DRY_RUN) console.log(`\n   (DRY-RUN — ingenting ble skrevet til Supabase)`);
}

main().catch((e) => {
  console.error("Uventet feil:", e);
  process.exit(1);
});
