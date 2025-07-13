import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://htvtuvkluespcjxfyplm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dnR1dmtsdWVzcGNqeGZ5cGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODIwMjEsImV4cCI6MjA2MzM1ODAyMX0.Zyf8nyr40Te6V-iTL2wox9reyvBidw2WRUiW5ApjB0g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 