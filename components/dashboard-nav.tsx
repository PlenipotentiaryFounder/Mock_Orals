"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Settings, LogOut, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useRef } from "react"

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const supabase = useRef(createSupabaseBrowserClient()).current

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Logout Failed",
        description: error.message || "Could not log you out. Please try again.",
        variant: "destructive",
      })
      setIsLoggingOut(false)
    } else {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      })
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Button variant="ghost" size="sm">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </Link>
      <Link
        href="/sessions"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/sessions") ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Button variant="ghost" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Sessions
        </Button>
      </Link>
      <Link
        href="/settings"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/settings" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Button variant="ghost" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </Link>
      <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="mr-2 h-4 w-4" />
        )}
        Logout
      </Button>
    </nav>
  )
}
