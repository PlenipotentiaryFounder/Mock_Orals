"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Printer,
  FileText,
  Share2,
  MoreHorizontal,
  ChevronDown,
  Command,
  Zap,
  Clock,
  LayoutGrid,
  Download,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

/**
 * CommandBar - The primary control center for instructor actions
 *
 * This component provides quick access to:
 * - Session information and status
 * - View switching (standard, focus, timeline)
 * - Primary actions (print, generate report, share)
 * - Additional options via dropdown
 *
 * The command bar is designed to be compact yet comprehensive,
 * providing instructors with all necessary tools without taking
 * up excessive screen space.
 */
interface CommandBarProps {
  session: any
  template: any
  onViewChange?: (view: string) => void
  currentView?: string
}

export function CommandBar({ session, template, onViewChange, currentView = "standard" }: CommandBarProps) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [reportText, setReportText] = useState("")
  const [copying, setCopying] = useState(false)

  // Handle report generation
  const handleGenerateReport = () => {
    setIsGeneratingReport(true)
    setTimeout(() => {
      setIsGeneratingReport(false)
    }, 2000)
  }

  // Handle print
  const handlePrint = () => {
    window.print()
  }

  // Handle copy link
  const handleCopyLink = async () => {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(`https://instructor.app/sessions/${session.id}`)
      toast({ title: "Copied!", description: "Session link copied to clipboard.", variant: "default" })
    } catch {
      toast({ title: "Error", description: "Failed to copy link.", variant: "destructive" })
    }
    setCopying(false)
  }

  // Handle report issue submit
  const handleReportSubmit = () => {
    // For now, just log and show a toast
    toast({ title: "Report submitted", description: reportText, variant: "default" })
    setReportText("")
    setIsReportDialogOpen(false)
  }

  return (
    <div className="flex items-center justify-between w-full h-14 px-4">
      <div className="flex items-center gap-4">
        {/* Session Title and Status */}
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-primary truncate max-w-[240px]">{session.session_name}</h1>
          {session.status && (
            <Badge variant={session.status === "Completed" ? "default" : "secondary"} className="flex-shrink-0">
              {session.status}
            </Badge>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Template Info with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              {template?.name}
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">Template Details</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">
              Created: {new Date(template?.created_at).toLocaleDateString()}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Version: {template?.version || "1.0"}</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Category: {template?.category || "Standard"}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">View Template Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        {/* View Switcher - Toggle between different views of the session
         *
         * Design Intent:
         * 1. Standard View: The default comprehensive view that shows all panels
         *    (navigation, workspace, and context). Provides complete access to all
         *    evaluation tools and information in a balanced layout.
         *
         * 2. Focus View: A distraction-free mode that minimizes or hides secondary
         *    panels (navigation and context) to maximize the workspace area.
         *    Designed for concentrated evaluation of individual elements without
         *    distractions, especially useful during actual evaluation sessions.
         *
         * 3. Timeline View: A chronological presentation of the session that
         *    emphasizes the sequence and timing of events, evaluations, and notes.
         *    Useful for reviewing the progression of a session and understanding
         *    the student's performance over time.
         *
         * These views allow instructors to switch between different perspectives
         * of the same session data based on their current task and needs.
         */}
        <Tabs value={currentView} onValueChange={onViewChange} className="mr-4">
          <TabsList className="h-8">
            <TabsTrigger value="standard" className="text-xs h-7 px-2">
              <LayoutGrid className="h-3.5 w-3.5 mr-1" />
              Standard
            </TabsTrigger>
            <TabsTrigger value="focus" className="text-xs h-7 px-2">
              <Zap className="h-3.5 w-3.5 mr-1" />
              Focus
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs h-7 px-2">
              <Clock className="h-3.5 w-3.5 mr-1" />
              Timeline
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Command Palette Trigger */}
        <Button variant="outline" size="sm" className="mr-2 h-8 gap-1 text-xs">
          <Command className="h-3.5 w-3.5" />
          <span>K</span>
        </Button>

        {/* Share Button */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Session</DialogTitle>
              <DialogDescription>
                Share this session with other instructors or export for the student.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="share-link">Session Link</Label>
                <div className="flex items-center space-x-2">
                  <Input id="share-link" value={`https://instructor.app/sessions/${session.id}`} readOnly />
                  <Button size="sm" variant="outline" onClick={handleCopyLink} disabled={copying}>
                    {copying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Copy"}
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Share Options</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Student Report
                  </Button>
                  {/* Web Share API */}
                  {typeof window !== "undefined" && navigator.share && (
                    <Button variant="outline" size="sm" className="justify-start col-span-2" onClick={() => navigator.share({ title: session.session_name, url: `https://instructor.app/sessions/${session.id}` })}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Native Share
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsShareDialogOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Issue Button & Dialog */}
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Report Issue</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report an Issue</DialogTitle>
              <DialogDescription>
                Describe the issue you encountered with this session. This will help us improve the platform.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              placeholder="Describe the issue..."
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReportSubmit} disabled={!reportText.trim()}>
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Print Button */}
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={handlePrint}>
          <Printer className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Print</span>
        </Button>

        {/* Generate Report Button */}
        <Button size="sm" onClick={handleGenerateReport} disabled={isGeneratingReport} className="h-8 gap-1 text-xs">
          {isGeneratingReport ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="hidden sm:inline">Generating...</span>
            </>
          ) : (
            <>
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Generate Report</span>
            </>
          )}
        </Button>

        {/* More Options Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Share2 className="mr-2 h-4 w-4" />
              Share Session
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Export Data</DropdownMenuItem>
            <DropdownMenuItem>Clone Session</DropdownMenuItem>
            <DropdownMenuItem>Archive Session</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Session Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
