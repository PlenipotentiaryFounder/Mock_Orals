"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AcsSidebar } from "@/components/acs-sidebar"
import { ElementView } from "@/components/element-view"
import { getSessionWithTemplate } from "@/lib/supabase/data-fetchers"
import { Printer, FileText } from "lucide-react"

export default function SessionPage() {
  const { id } = useParams()
  const [session, setSession] = useState<any>(null)
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentTask, setCurrentTask] = useState<any>(null)
  const [currentArea, setCurrentArea] = useState<any>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await getSessionWithTemplate(id as string)

        if (sessionData) {
          setSession(sessionData.session)
          setTemplate(sessionData.template)
        }
      } catch (error) {
        console.error("Error fetching session:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSession()
    }
  }, [id])

  const handleTaskSelect = (task: any, area: any) => {
    setCurrentTask(task)
    setCurrentArea(area)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading session...</div>
  }

  if (!session) {
    return <div className="flex items-center justify-center h-screen">Session not found</div>
  }

  return (
    <div className="flex h-screen">
      <AcsSidebar onTaskSelect={handleTaskSelect} sessionId={id as string} />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{session.session_name}</h1>
            <p className="text-muted-foreground">{template?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        {currentTask ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {currentArea.title} - {currentTask.order_letter}. {currentTask.title}
                    </CardTitle>
                    <CardDescription>{currentTask.objective}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Mark Complete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="knowledge">
                  <TabsList className="mb-4">
                    <TabsTrigger value="knowledge">Knowledge Elements</TabsTrigger>
                    <TabsTrigger value="risk">Risk Management Elements</TabsTrigger>
                    <TabsTrigger value="skill">Skills Elements</TabsTrigger>
                  </TabsList>
                  <TabsContent value="knowledge">
                    <ElementView taskId={currentTask.id} sessionId={id as string} elementType="knowledge" />
                  </TabsContent>
                  <TabsContent value="risk">
                    <ElementView taskId={currentTask.id} sessionId={id as string} elementType="risk" />
                  </TabsContent>
                  <TabsContent value="skill">
                    <ElementView taskId={currentTask.id} sessionId={id as string} elementType="skill" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <h2 className="text-xl font-semibold mb-2">Select a Task</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Select a task from the sidebar to begin evaluating the student on specific elements.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
