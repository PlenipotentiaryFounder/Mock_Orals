"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function RootPage() {
  const router = useRouter()
  const supabase = useRef(createSupabaseBrowserClient()).current

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // User is logged in, redirect to dashboard
        router.replace("/dashboard")
      } else {
        // User is not logged in, redirect to register page (new default)
        router.replace("/register")
      }
    }

    checkAuthAndRedirect()
  }, [router, supabase])

  // Display a loading indicator while checking auth
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}
