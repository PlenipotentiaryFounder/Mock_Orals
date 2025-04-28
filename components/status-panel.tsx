"use client"

import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, User, BarChart, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

/**
 * StatusPanel - Provides at-a-glance session information
 *
 * This component displays:
 * - Session date and duration
 * - Evaluator information
 * - Overall progress metrics
 * - Critical issues summary
 *
 * The status panel helps instructors maintain awareness of the overall
 * session status while focusing on individual elements.
 */
interface StatusPanelProps {
  session: any
  template: any
  completed: number
  total: number
  issues: number
  percentage: number
}

export function StatusPanel({ session, template, completed, total, issues, percentage }: StatusPanelProps) {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate session duration
  const calculateDuration = () => {
    if (!session.start_time) return "Not started"

    const start = new Date(session.start_time)
    const end = session.end_time ? new Date(session.end_time) : new Date()

    const durationMs = end.getTime() - start.getTime()
    const minutes = Math.floor(durationMs / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="p-3 flex items-center justify-between text-xs">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{formatDate(session.created_at)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Duration: {calculateDuration()}</span>
        </div>

        {/* Add Student information */}
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Student: {session.student || "John Student"}</span>
          {/* TODO: Replace with dynamic student data from the session object */}
        </div>

        {session.evaluator && (
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Evaluator: {session.evaluator}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Progress metrics */}
        <div className="flex items-center gap-1.5">
          <BarChart className="h-3.5 w-3.5 text-muted-foreground" />
          <span>
            Progress: {completed}/{total}
          </span>
          <Progress value={percentage} className="w-20 h-1.5 ml-1" />
        </div>

        {/* Issues indicator */}
        {issues > 0 && (
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-amber-500">{issues} Issues</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-5 text-[10px]">
            {template?.category || "Standard"}
          </Badge>

          <Badge variant="outline" className="h-5 text-[10px]">
            v{template?.version || "1.0"}
          </Badge>
        </div>
      </div>
    </div>
  )
}
