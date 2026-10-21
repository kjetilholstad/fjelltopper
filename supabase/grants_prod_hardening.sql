-- =============================================================================
-- Prod-innstramming av Data API-rettigheter (Supabase)
-- =============================================================================
-- Prod har i dag Supabase-standard: ALL for anon og authenticated på alle
-- tabeller, og RLS som eneste sperre. Denne filen fjerner rettigheter appen
-- ikke trenger, slik at en feil i en policy ikke er nok til å åpne tilgang.
--
-- Rører ikke service_role, data eller policies. profiles-fiksen
-- (revoke update/insert/delete) er allerede kjørt i prod og er ikke med her,
-- men TRUNCATE/TRIGGER/REFERENCES på profiles fjernes under.
--
-- Én transaksjon: peaks mister og får tilbake kolonne-UPDATE atomisk, så
-- admin-redigering aldri er uten rettighet midt i kjøringen.
--
-- Kjør bevisst i SQL-editoren (etter backup), og kjør kontrollspørringene nederst.
--
-- Mål-tilstand:
--   peaks            anon: SELECT | authenticated: SELECT + UPDATE(name,height,lat,lng)
--   collections      anon, authenticated: SELECT
--   collection_peaks anon, authenticated: SELECT
--   ascents          anon: ingen  | authenticated: SELECT, INSERT, UPDATE, DELETE
--   profiles         anon: ingen  | authenticated: SELECT
-- Fremtidige tabeller/funksjoner må ha GRANT i samme migrasjon som lager dem.
-- =============================================================================

begin;

-- peaks
revoke all on table public.peaks from anon, authenticated;
grant select on public.peaks to anon, authenticated;
grant update (name, height, lat, lng) on public.peaks to authenticated;

-- collections / collection_peaks
revoke all on table public.collections      from anon, authenticated;
revoke all on table public.collection_peaks from anon, authenticated;
grant select on public.collections      to anon, authenticated;
grant select on public.collection_peaks to anon, authenticated;

-- ascents: ingen anon. authenticated mister TRUNCATE, TRIGGER og REFERENCES.
revoke all on table public.ascents from anon, authenticated;
grant select, insert, update, delete on public.ascents to authenticated;

-- profiles: ingen utloggede sider leser profiles (verifisert i koden), så
-- anon mister alt, inkludert SELECT. authenticated beholder kun SELECT.
revoke all on table public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

-- Funksjoner
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
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);

    if f.proname in ('get_peak_ascent_counts', 'get_peak_ascent_counts_by_year') then
      execute format('grant execute on function %s to anon, authenticated', f.sig);
    end if;
    -- handle_new_user og haversine_km: ingen anon/authenticated. Trigger-
    -- kjøring sjekker ikke EXECUTE. service_role røres ikke.
  end loop;
end
$$;

commit;

-- =============================================================================
-- Kontroll (endrer ingenting). Forventet resultat står under hver spørring.
-- =============================================================================

-- 1) Tabellrettigheter
--   select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privs
--   from information_schema.role_table_grants
--   where table_schema = 'public' and grantee in ('anon','authenticated')
--   group by 1, 2 order by 1, 2;
--   Forventet:
--     ascents          authenticated  DELETE, INSERT, SELECT, UPDATE
--     collection_peaks anon           SELECT        (og authenticated: SELECT)
--     collections      anon           SELECT        (og authenticated: SELECT)
--     peaks            anon           SELECT        (authenticated: SELECT; UPDATE er kolonnegrant)
--     profiles         authenticated  SELECT
--     (ingen rader for anon på ascents og profiles)

-- 2) Kolonnegrants
--   select table_name, grantee, column_name, privilege_type
--   from information_schema.column_privileges
--   where table_schema = 'public' and grantee in ('anon','authenticated')
--     and privilege_type = 'UPDATE'
--   order by 1, 2, 3;
--   Forventet: kun peaks / authenticated / height, lat, lng, name.

-- 3) Funksjoner
--   select p.proname, r.rolname, has_function_privilege(r.oid, p.oid, 'execute') as can_exec
--   from pg_proc p, pg_roles r
--   where p.pronamespace = 'public'::regnamespace
--     and r.rolname in ('anon','authenticated','service_role')
--   order by 1, 2;
--   Forventet: get_peak_ascent_counts(_by_year) true for alle tre;
--   handle_new_user og haversine_km true kun for service_role.

-- 4) Røyktest utenfra (anon-nøkkel):
--   .../rest/v1/peaks?select=id&limit=1             -> 200
--   .../rest/v1/collections?select=id&limit=1       -> 200
--   .../rest/v1/ascents?select=id&limit=1           -> 401/403 (permission denied)
--   .../rest/v1/profiles?select=id&limit=1          -> 401/403 (permission denied)
--   .../rest/v1/rpc/get_peak_ascent_counts          -> 200
