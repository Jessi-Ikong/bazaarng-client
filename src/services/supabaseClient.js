import { createClient } from '@supabase/supabase-js';

// Frontend client uses the public 'anon' key — safe to expose. It's only
// ever used to SUBSCRIBE to realtime message updates; all reads/writes of
// actual data go through our own Express backend (see chatService.js),
// which enforces who's allowed to see what.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
