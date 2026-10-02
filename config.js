/*
  Optional cloud database. Leave both values empty and the hub saves in the browser you use.
  To share one database between devices and teammates on GitHub Pages, create a free Supabase
  project, run supabase.sql once, then paste the Project URL and the anon public key here.
  (Step by step in HUB-README.md.)
*/
window.HUB_CONFIG = {
  supabaseUrl: '',   // e.g. 'https://abcdxyz.supabase.co'
  supabaseKey: '',   // the "anon public" key
  table: 'hub'
};
