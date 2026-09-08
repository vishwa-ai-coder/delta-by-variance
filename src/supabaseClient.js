import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://garknlhvtopsadtfsuyc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcmtubGh2dG9wc2FkdGZzdXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MTc2MDUsImV4cCI6MjEwMjk5MzYwNX0.rSF77tVRE-Z0cWnpW6zonD1WCnnU3jvVO6se592VTUM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)