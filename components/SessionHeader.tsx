"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Printer, 
  FileText, 
  BarChart2, 
  Calendar, 
  User, 
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
import { format } from "date-fns"

interface SessionHeaderProps {
  session: any
  template: any
}

export function SessionHeader({ session, template }: SessionHeaderProps) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  
  const handleGenerateReport = () => {
    setIsGeneratingReport(true)
    // Here you would implement the actual report generation logic
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setIsGeneratingReport(false)
    }, 2000)
  }
  
  // Calculate session stats
  const calculateCompletionStats = () => {
    if (!session.tasks) return { completed: 0, total: 0, percentage: 0 }
    
    const total = session.tasks.length
    const completed = session.tasks.filter((task: any) => task.status === "completed").length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { completed, total, percentage }
  }
  
  const stats = calculateCompletionStats()
  const sessionDate = session.session_date ? new Date(session.session_date) : new Date()
  
  return (
    <div className="flex flex-col space-y-4 bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">{session.session_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">{template?.name}</p>
              <Badge variant="outline" className="ml-2">
                {session.status || "In Progress"}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-blue-600">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
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
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                Share Session
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                Reschedule
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Cancel Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="flex items-center p-3 rounded-md bg-blue-50 border border-blue-100">
          <Calendar className="h-5 w-5 text-blue-600 mr-3" />
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="font-medium">{format(sessionDate, "PPP")}</p>
          </div>
        </div>
        <div className="flex items-center p-3 rounded-md bg-blue-50 border border-blue-100">
          <User className="h-5 w-5 text-blue-600 mr-3" />
          <div>
            <p className="text-xs text-muted-foreground">Student</p>
            <p className="font-medium">{session.student_name || "Not assigned"}</p>
          </div>
        </div>
        <div className="flex items-center p-3 rounded-md bg-blue-50 border border-blue-100">
          <BarChart2 className="h-5 w-5 text-blue-600 mr-3" />
          <div>
            <p className="text-xs text-muted-foreground">Progress</p>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: `${stats.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{stats.percentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 