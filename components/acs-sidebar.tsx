"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CalendarDays, FileText, PlusCircle, Users, CheckCircle, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function AcsSidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
      }
    }
    fetchUser()
  }, [])

  const routes = [
    {
      href: "/dashboard",
      icon: <CalendarDays className="h-5 w-5" />,
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/sessions",
      icon: <CalendarDays className="h-5 w-5" />,
      label: "Sessions",
      active: pathname.startsWith("/sessions"),
    },
    {
      href: "/reports",
      icon: <FileText className="h-5 w-5" />,
      label: "Reports",
      active: pathname.startsWith("/reports"),
    },
    {
      href: "/students",
      icon: <Users className="h-5 w-5" />,
      label: "Students",
      active: pathname.startsWith("/students"),
    },
  ]

  return (
    <div className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          Mock Orals
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                route.active ? "bg-primary/10 text-primary" : "text-muted-foreground",
              )}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="sticky bottom-0 border-t bg-muted/40 p-4">
        {user && (
          <div className="flex flex-col items-center text-center mb-4">
            <span className="font-medium">{user.user_metadata?.full_name || user.email}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
          </div>
        )}
        <Button asChild className="w-full mt-2">
          <Link href="#" onClick={() => supabase.auth.signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Link>
        </Button>
      </div>
    </div>
  )
}
