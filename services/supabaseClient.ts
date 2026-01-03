
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://npuombwyicwvelxnmkzs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rIuUtAqvlB0ut8IdWvKhYA_jrSPAiBI';

// Note: Using the publishable key for client-side operations as per standard practice.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
