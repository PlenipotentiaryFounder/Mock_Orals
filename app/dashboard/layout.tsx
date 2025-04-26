"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { DashboardNav } from "@/components/dashboard-nav"
import { AcsSidebar } from "@/components/acs-sidebar"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        // Handle error appropriately, maybe redirect to an error page
        router.replace("/login"); // Redirect to login on error
        return;
      }

      if (!session) {
        // No active session, redirect to login
        router.replace("/login");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">Mock Oral Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Logged in as: <span className="font-medium">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </span>
            <nav className="flex items-center space-x-4">
              <DashboardNav user={user} />
            </nav>
          </div>
        </div>
      </header>
      <div className="container flex flex-1 items-start md:grid md:grid-cols-[256px_1fr] md:gap-6 lg:gap-10">
        <AcsSidebar user={user} />
        {children}
      </div>
    </div>
  )
}
