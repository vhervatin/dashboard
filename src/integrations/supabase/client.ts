// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bbotlgrvdehuhmiletdf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJib3RsZ3J2ZGVodWhtaWxldGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NjI1NDksImV4cCI6MjA2MTQzODU0OX0.MAdQLvNxyh4920AAQQ2uaTyERWoDwhvr2HlM0Y3slrM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);