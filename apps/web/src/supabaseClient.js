import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iqtqgiwnjvvuzdeicqtt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdHFnaXduanZ2dXpkZWljcXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTA1OTcsImV4cCI6MjA3NDIyNjU5N30.ngnIygg5AT1SwGjk__K6j-_YKpyHJTj573702pXyQB0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
