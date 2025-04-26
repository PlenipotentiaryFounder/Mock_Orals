// NOTE: THIS FILE IS DEPRECATED AND SHOULD BE REMOVED
// Use createClient from '@/lib/supabase/utils' instead for Server Components.
// For administrative tasks requiring the service role key, create a separate client
// instance explicitly where needed, being careful about security implications.

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient as createServerUtilsClient } from './utils'

// Deprecated: Use createClient from ./utils instead.
export const createServerClient = () => {
  console.warn("createServerClient from lib/supabase/server.ts is deprecated. Use createClient from lib/supabase/utils.ts instead.")
  return createServerUtilsClient() // Return the cookie-based client for compatibility
}

// Example of creating a service role client IF NEEDED (use with caution):
export const createServiceRoleClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables for service role")
  }

  // Create a Supabase client with the service role key
  // This has admin privileges and should ONLY be used in secure server-side environments
  // for tasks requiring elevated permissions.
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      // Service role client does not manage user sessions, so persistence is irrelevant here.
      // autoRefreshToken and persistSession defaults are usually fine.
    },
  })
}
