"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Printer, 
  FileText, 
  Share2,
  MoreHorizontal
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface SessionHeaderProps {
  session: any
  template: any
  progressValue: number
}

export function SessionHeader({ session, template, progressValue }: SessionHeaderProps) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  
  const handleGenerateReport = () => {
    setIsGeneratingReport(true)
    setTimeout(() => {
      setIsGeneratingReport(false)
    }, 2000)
  }
  
  return (
    <div className="flex items-center justify-between w-full gap-4">
      <div className="flex-shrink min-w-0">
        <h1 className="text-xl font-bold text-primary truncate">{session.session_name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-muted-foreground truncate">Template: {template?.name}</p>
          {session.status && (
            <Badge variant={session.status === "Completed" ? "success" : "secondary"} className="flex-shrink-0">
              {session.status}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="w-32">
          <Label className="text-xs font-medium text-muted-foreground">Progress</Label>
          <Progress value={progressValue} className="h-2 mt-1" />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button 
            size="sm" 
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
} 