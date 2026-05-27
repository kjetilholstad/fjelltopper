import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const s = createClient(
  'https://enrbraxvxnytyfeuewqq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVucmJyYXh2eG55dHlmZXVld3FxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg2ODY3MCwiZXhwIjoyMDk0NDQ0NjcwfQ.4vxGMgeIoBZEh9PoLcZdxq0-00jOMiIjyOUR7JHX-6s'
);

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
