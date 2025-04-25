"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    // Remove the user from localStorage
    localStorage.removeItem("mockOralUser")

    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })

    // Redirect to login page
    router.push("/")
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
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </nav>
  )
}
