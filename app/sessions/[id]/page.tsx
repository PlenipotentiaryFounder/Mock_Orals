"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getSessionWithDetails } from "@/lib/supabase/data-fetchers"
import { TasksList } from "@/components/TasksList"
import { TaskPanel } from "@/components/TaskPanel"
import { SessionHeader } from "@/components/SessionHeader"
import { ScenarioDetails } from "@/components/ScenarioDetails"

export default function SessionPage() {
  const { id } = useParams()
  const [session, setSession] = useState<any>(null)
  const [template, setTemplate] = useState<any>(null)
  const [scenario, setScenario] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentTask, setCurrentTask] = useState<any>(null)
  const [currentArea, setCurrentArea] = useState<any>(null)

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true)
      try {
        const sessionData = await getSessionWithDetails(id as string)
        if (sessionData) {
          setSession(sessionData.session)
          setTemplate(sessionData.template)
          setScenario(sessionData.scenario)
        } else {
           console.error("Session data not found for ID:", id)
           setSession(null)
           setTemplate(null)
           setScenario(null)
        }
      } catch (error) {
        console.error("Error fetching session details:", error)
         setSession(null)
         setTemplate(null)
         setScenario(null)
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

  const handleMarkComplete = (taskId: string) => {
    // Here you would implement the actual completion logic
    // For now, we'll just update the local state
    if (currentTask && currentTask.id === taskId) {
      const updatedTask = {
        ...currentTask,
        status: currentTask.status === "completed" ? "in_progress" : "completed"
      }
      setCurrentTask(updatedTask)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="max-w-md text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Session Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested session could not be found or failed to load.
          </p>
          <a href="/sessions" className="text-blue-600 hover:underline">
            Return to Sessions List
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <SessionHeader session={session} template={template} />
          
          {scenario && <ScenarioDetails scenario={scenario} />}
          
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <TasksList 
                onTaskSelect={handleTaskSelect} 
                sessionId={id as string}
              />
            </div>
            
            <div className="col-span-3">
              <TaskPanel 
                currentTask={currentTask} 
                currentArea={currentArea} 
                sessionId={id as string}
                onMarkComplete={handleMarkComplete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
