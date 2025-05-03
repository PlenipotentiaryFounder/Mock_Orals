// NOTE: THIS FILE IS DEPRECATED AND SHOULD BE REMOVED
// Use createClient from '@/'lib/supabase/utils' in Server Components
// and createBrowserClient from '@supabase/ssr' in Client Components instead.

import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
