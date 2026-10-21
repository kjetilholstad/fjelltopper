-- =============================================================================
-- Eksplisitte Data API-grants for NYE miljøer (Supabase)
-- =============================================================================
-- Brukes til: db reset, preview-branches og nye Supabase-prosjekter.
-- Skal IKKE kjøres mot prod — prod har allerede rettigheter og strammes inn
-- med grants_prod_hardening.sql.
--
-- Bakgrunn: fra 30. oktober 2026 gir Supabase ikke lenger anon/authenticated/
-- service_role automatisk tilgang til nye objekter i public. Uten GRANT får
-- Data API-et "permission denied".
--
-- Filen er KUN additiv: bare GRANT, ingen REVOKE, ingen transaksjon. Den er
-- idempotent (GRANT på nytt er ufarlig) og kjøres etter at tabellene finnes
-- (schema/migrasjoner) og før appen tas i bruk.
--
-- !! FREMTIDIGE TABELLER OG FUNKSJONER: hver migrasjon som lager en ny tabell
-- !! eller funksjon i public MÅ inneholde egne GRANT-setninger (og RLS) i
-- !! samme migrasjon. GRANT kommer i tillegg til RLS, ikke i stedet for.
--
-- Rolleoversikt:
--   anon          utlogget besøkende: leser topper, collections og antall-RPC-ene.
--   authenticated innlogget: egne bestigninger; admin oppdaterer topper (RLS
--                 avgjør hvem).
--   service_role  scripts/server utenfor appen (omgår RLS).
-- =============================================================================

-- peaks: offentlig lesbar. Admin-redigering (app/peaks/adminActions.ts) bruker
-- innlogget brukers klient og endrer kun disse fire kolonnene; UPDATE-policyen
-- "Admin kan oppdatere topper" avgjør hvem som får lov.
grant select on public.peaks to anon, authenticated;
grant update (name, height, lat, lng) on public.peaks to authenticated;

-- collections / collection_peaks: leses klientside av alle, også utlogget.
grant select on public.collections      to anon, authenticated;
grant select on public.collection_peaks to anon, authenticated;

-- ascents: kun innlogget. Offentlige antall hentes via SECURITY DEFINER-RPC-ene.
-- upsert (logAscent) krever INSERT + UPDATE (+ SELECT).
grant select, insert, update, delete on public.ascents to authenticated;

-- profiles: kun SELECT til authenticated (egen is_admin, og admin-policyen på
-- peaks). Ingen INSERT/UPDATE/DELETE: rader opprettes av handle_new_user
-- (security definer), og en bred UPDATE ville latt brukere sette is_admin.
-- Ingen utloggede sider leser profiles.
grant select on public.profiles to authenticated;

-- service_role: scripts (export-peaks.ts, populate-peak-content.ts).
grant all on public.peaks, public.collections, public.collection_peaks,
             public.ascents, public.profiles to service_role;

-- Funksjoner: slås opp via pg_proc så argumenttyper ikke må gjettes.
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig, p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'get_peak_ascent_counts',
        'get_peak_ascent_counts_by_year',
        'handle_new_user',
        'haversine_km'
      )
  loop
    if f.proname in ('get_peak_ascent_counts', 'get_peak_ascent_counts_by_year') then
      -- SECURITY DEFINER; kalles via .rpc() fra utloggede sider.
      execute format('grant execute on function %s to anon, authenticated, service_role', f.sig);
    else
      -- handle_new_user: trigger-funksjon, skal ikke kunne kalles via API.
      -- haversine_km: hjelpefunksjon for SQL-editor.
      execute format('grant execute on function %s to service_role', f.sig);
    end if;
  end loop;
end
$$;
