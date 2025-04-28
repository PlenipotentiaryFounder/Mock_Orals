"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getSessionWithDetails,
  getTaskScoresForSession,
  getElementScoresWithDetailsForSession,
} from "@/lib/supabase/data-fetchers"
import { Printer, Download } from "lucide-react"

export default function ReportPage() {
  const { id } = useParams()
  const [session, setSession] = useState<any>(null)
  const [template, setTemplate] = useState<any>(null)
  const [taskScores, setTaskScores] = useState<any[]>([])
  const [elementScores, setElementScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Get session and template data
        const sessionData = await getSessionWithDetails(id as string)
        if (!sessionData) return

        setSession(sessionData.session)
        setTemplate(sessionData.template)

        // Get task scores with details
        const taskScoresData = await getTaskScoresForSession(id as string)
        setTaskScores(taskScoresData)

        // Get element scores with details
        const elementScoresData = await getElementScoresWithDetailsForSession(id as string)
        setElementScores(elementScoresData)
      } catch (error) {
        console.error("Error fetching report:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchReport()
    }
  }, [id])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading report...</div>
  }

  if (!session) {
    return <div className="flex items-center justify-center h-screen">Report not found</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{session.session_name} - Report</h1>
          <p className="text-muted-foreground">{template?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Session Date</h3>
                  <p>{new Date(session.date_started).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Completion Date</h3>
                  <p>
                    {session.date_completed ? new Date(session.date_completed).toLocaleDateString() : "In Progress"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Overall Notes</h3>
                <p className="p-4 bg-muted rounded-md">{session.notes || "No overall notes provided."}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Areas of Strength</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {taskScores
                    .filter((task: any) => task.feedback_tag === "excellent" || task.feedback_tag === "proficient")
                    .slice(0, 4)
                    .map((task: any) => (
                      <div key={task.id} className="p-2 bg-green-50 border border-green-200 rounded-md">
                        <p className="font-medium">
                          {task.task.area?.title} - {task.task.order_letter}. {task.task.title}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Areas Needing Improvement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {taskScores
                    .filter((task: any) => task.feedback_tag === "needs_review" || task.feedback_tag === "weak")
                    .slice(0, 4)
                    .map((task: any) => (
                      <div key={task.id} className="p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="font-medium">
                          {task.task.area?.title} - {task.task.order_letter}. {task.task.title}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {taskScores.map((task: any) => (
                <div key={task.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">
                      {task.task.area?.title} - {task.task.order_letter}. {task.task.title}
                    </h3>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">
                        Score: {task.task_score_earned}/{task.task_score_total}
                      </span>
                      <div
                        className={`px-2 py-1 text-xs rounded-full ${
                          task.feedback_tag === "excellent"
                            ? "bg-green-100 text-green-800"
                            : task.feedback_tag === "proficient"
                              ? "bg-blue-100 text-blue-800"
                              : task.feedback_tag === "needs_review"
                                ? "bg-yellow-100 text-yellow-800"
                                : task.feedback_tag === "weak"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.feedback_tag?.replace(/_/g, " ")}
                      </div>
                    </div>
                  </div>
                  {task.instructor_feedback && (
                    <div className="mt-2 p-3 bg-muted rounded-md text-sm">{task.instructor_feedback}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Element-Level Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {elementScores.map((element: any) => (
                <div key={element.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium">{element.element.code}</span>
                      <h3 className="font-medium">{element.element.description}</h3>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Score: {element.score}/4</span>
                      <div
                        className={`px-2 py-1 text-xs rounded-full ${
                          element.score === 4
                            ? "bg-green-100 text-green-800"
                            : element.score === 3
                              ? "bg-blue-100 text-blue-800"
                              : element.score === 2
                                ? "bg-yellow-100 text-yellow-800"
                                : element.score === 1
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {element.score === 4
                          ? "Correlation"
                          : element.score === 3
                            ? "Application"
                            : element.score === 2
                              ? "Understanding"
                              : element.score === 1
                                ? "Rote"
                                : "Not Scored"}
                      </div>
                    </div>
                  </div>
                  {element.instructor_comment && (
                    <div className="mt-2 p-3 bg-muted rounded-md text-sm">{element.instructor_comment}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
