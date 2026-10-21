import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

try { process.loadEnvFile('.env.local'); } catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
if (!SUPABASE_URL || !SECRET_KEY) {
  console.error('Mangler NEXT_PUBLIC_SUPABASE_URL og/eller SUPABASE_SECRET_KEY (sett dem i .env.local eller miljøet).');
  process.exit(1);
}

const s = createClient(SUPABASE_URL, SECRET_KEY);

async function main() {
  const { data, error } = await s
    .from('peaks')
    .select('id,name,height,county,municipality,primary_factor,nearest_higher_peak_id')
    .gte('height', 2000)
    .order('height', { ascending: false })
    .limit(500);

  if (error) { console.error(error); process.exit(1); }

  fs.writeFileSync('peaks_export.json', JSON.stringify(data, null, 2));
  console.log(`Eksportert ${data?.length} topper til peaks_export.json`);
}

main();
