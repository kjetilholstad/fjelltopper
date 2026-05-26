"""
Populer description, image_url og image_credit for alle fjelltopper.

Kjør fra fjelltopper/-mappen:
    python scripts/populate-peak-content.py           # full kjøring
    python scripts/populate-peak-content.py --dry-run # forhåndsvisning uten skriving
    python scripts/populate-peak-content.py --limit 5 # test med 5 topper

Krever: pip install requests
"""

import requests
import json
import time
import re
import sys
import argparse

SUPABASE_URL = "https://enrbraxvxnytyfeuewqq.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVucmJyYXh2eG55dHlmZXVld3FxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg2ODY3MCwiZXhwIjoyMDk0NDQ0NjcwfQ.4vxGMgeIoBZEh9PoLcZdxq0-00jOMiIjyOUR7JHX-6s"

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}


# ---------------------------------------------------------------------------
# Beskrivelsesmal
# ---------------------------------------------------------------------------

def generate_description(peak: dict) -> str:
    name        = peak["name"]
    height      = peak["height"]
    municipality = peak.get("municipality") or ""
    county      = peak.get("county") or ""
    pf          = peak.get("primary_factor")
    nhp         = peak.get("nearest_higher_peak")

    sentences = []

    # Setning 1 — plassering og høyde
    if municipality and county:
        sentences.append(f"Toppen ligger i {municipality} kommune i {county} og er {height} meter over havet.")
    elif county:
        sentences.append(f"Toppen ligger i {county} og er {height} meter over havet.")
    else:
        sentences.append(f"Toppen er {height} meter over havet.")

    # Setning 2 — primærfaktor
    if pf is not None:
        if pf >= 500:
            sentences.append(
                f"Med en primærfaktor på {pf} meter er den et markant og selvstendig fjell i terrenget."
            )
        elif pf >= 100:
            sentences.append(
                f"Primærfaktoren på {pf} meter gjør den til en tydelig selvstendig topp."
            )
        elif pf >= 30:
            sentences.append(
                f"Primærfaktoren er {pf} meter."
            )

    # Setning 3 — nærmeste høyere topp
    if nhp:
        sentences.append(f"Nærmeste høyere topp er {nhp}.")

    return " ".join(sentences)


# ---------------------------------------------------------------------------
# Wikimedia Commons bildesøk
# ---------------------------------------------------------------------------

SKIP_KEYWORDS = ["map", "logo", "icon", "coat", "flag", "symbol",
                 "locator", "kart", "location", "outline", "topographic"]

def strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text).strip()

def fetch_wikimedia_image(peak_name: str) -> tuple[str | None, str | None]:
    """Returnerer (image_url, image_credit) eller (None, None)."""
    queries = [
        f"{peak_name} mountain norway",
        f"{peak_name} fjell norge",
        peak_name,
    ]

    for query in queries:
        try:
            resp = requests.get(
                "https://commons.wikimedia.org/w/api.php",
                params={
                    "action":       "query",
                    "generator":    "search",
                    "gsrnamespace": "6",
                    "gsrsearch":    query,
                    "gsrlimit":     "8",
                    "prop":         "imageinfo",
                    "iiprop":       "url|extmetadata|mime",
                    "iiurlwidth":   "800",
                    "format":       "json",
                    "origin":       "*",
                },
                timeout=10
            )
            data = resp.json()
        except Exception as e:
            print(f"    ⚠ Wikimedia-feil for '{query}': {e}")
            continue

        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            ii = page.get("imageinfo", [{}])[0]
            mime = ii.get("mime", "")
            url  = ii.get("thumburl") or ii.get("url", "")

            # Filtrer ut ikke-bilder og uønskede filer
            if not mime.startswith(("image/jpeg", "image/png")):
                continue
            url_lower = url.lower()
            if any(kw in url_lower for kw in SKIP_KEYWORDS):
                continue

            # Bygg krediteringsstreng
            meta    = ii.get("extmetadata", {})
            artist  = strip_html(meta.get("Artist", {}).get("value", ""))
            license_name = meta.get("LicenseShortName", {}).get("value", "")
            credit  = " / ".join(filter(None, [artist, license_name])) or None

            return url, credit

        time.sleep(0.2)

    return None, None


# ---------------------------------------------------------------------------
# Supabase-operasjoner
# ---------------------------------------------------------------------------

def fetch_peaks() -> list[dict]:
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/peaks",
        headers=HEADERS,
        params={
            "select": "id,name,height,county,municipality,primary_factor,nearest_higher_peak,description,image_url",
            "height": "gte.2000",
            "order":  "height.desc",
            "limit":  "500",
        },
        timeout=15
    )
    resp.raise_for_status()
    return resp.json()


def update_peak(peak_id: str, payload: dict) -> bool:
    resp = requests.patch(
        f"{SUPABASE_URL}/rest/v1/peaks",
        headers=HEADERS,
        params={"id": f"eq.{peak_id}"},
        json=payload,
        timeout=15
    )
    return resp.status_code in (200, 204)


# ---------------------------------------------------------------------------
# Hovedløkke
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="Vis hva som ville blitt skrevet uten å oppdatere Supabase")
    parser.add_argument("--limit", type=int, default=None,
                        help="Begrens antall topper som behandles")
    parser.add_argument("--skip-images", action="store_true",
                        help="Hopp over Wikimedia-bildesøk")
    args = parser.parse_args()

    print("Henter topper fra Supabase...")
    peaks = fetch_peaks()
    print(f"Fant {len(peaks)} topper totalt")

    # Filtrer kun de som mangler innhold
    to_process = [p for p in peaks if not p.get("description") or not p.get("image_url")]
    print(f"Mangler innhold: {len(to_process)} topper\n")

    if args.limit:
        to_process = to_process[:args.limit]
        print(f"Begrenset til {len(to_process)} topper (--limit)\n")

    ok_desc = ok_img = errors = 0

    for i, peak in enumerate(to_process):
        name = peak["name"]
        print(f"[{i+1}/{len(to_process)}] {name} ({peak['height']} m)")

        payload = {}

        # Beskrivelse
        if not peak.get("description"):
            desc = generate_description(peak)
            payload["description"] = desc
            ok_desc += 1
            print(f"    📝 {desc[:80]}...")

        # Bilde
        if not peak.get("image_url") and not args.skip_images:
            img_url, credit = fetch_wikimedia_image(name)
            if img_url:
                payload["image_url"] = img_url
                payload["image_credit"] = credit
                ok_img += 1
                print(f"    🖼  {img_url[:70]}...")
            else:
                print(f"    – Ingen Wikimedia-bilde funnet")
            time.sleep(0.3)

        # Skriv til Supabase
        if payload and not args.dry_run:
            success = update_peak(peak["id"], payload)
            if not success:
                print(f"    ❌ Feil ved oppdatering av {name}")
                errors += 1
        elif args.dry_run and payload:
            print(f"    [DRY-RUN] ville skrevet: {list(payload.keys())}")

    print(f"\n✅ Ferdig!")
    print(f"   Beskrivelser skrevet: {ok_desc}")
    print(f"   Bilder hentet:        {ok_img}")
    print(f"   Feil:                 {errors}")
    if args.dry_run:
        print("   (DRY-RUN — ingenting ble faktisk skrevet til Supabase)")


if __name__ == "__main__":
    main()
