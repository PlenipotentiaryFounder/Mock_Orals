// NOTE: THIS FILE IS DEPRECATED AND SHOULD BE REMOVED
// Use createClient from '@/'lib/supabase/utils' in Server Components
// and createBrowserClient from '@supabase/ssr' in Client Components instead.

import { createBrowserClient } from "@supabase/ssr"

export const createClient = () => {
  // Use the environment variables that were provided in the project setup
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables for client")
    // Consider showing a user-friendly error or fallback UI
    throw new Error("Application configuration error. Please contact support.")
  }

  // Use createBrowserClient for client-side components
  return createBrowserClient(
    supabaseUrl!,
    supabaseKey!
  )
}
