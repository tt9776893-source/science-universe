import fs from 'fs';

console.log('--- search_supabase.js ---');
try { console.log(fs.readFileSync('tools/search_supabase.js', 'utf8')); } catch(e){ console.log(e.message); }

console.log('--- prepare_apply_auth.js ---');
try { console.log(fs.readFileSync('tools/prepare_apply_auth.js', 'utf8').substring(0, 1000)); } catch(e){ console.log(e.message); }

