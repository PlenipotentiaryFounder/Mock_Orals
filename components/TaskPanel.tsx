"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ElementView } from "@/components/element-view"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface TaskPanelProps {
  currentTask: any
  currentArea: any
  sessionId: string
  onMarkComplete: (taskId: string) => void
}

export function TaskPanel({ currentTask, currentArea, sessionId, onMarkComplete }: TaskPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "in_progress":
        return "text-amber-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-amber-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  if (!currentTask) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] border rounded-lg bg-muted/20">
        <h2 className="text-xl font-semibold mb-2 text-blue-600">Select a Task</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Select a task from the Tasks panel to view and evaluate its elements.
        </p>
      </div>
    )
  }

  return (
    <Card className="border-blue-600 shadow-md">
      <CardHeader className="bg-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon(currentTask.status || "not_started")}
              <span className={`text-xs font-medium ${getStatusColor(currentTask.status || "not_started")}`}>
                {currentTask.status === "completed" 
                  ? "Completed" 
                  : currentTask.status === "in_progress" 
                    ? "In Progress" 
                    : "Not Started"}
              </span>
            </div>
            <CardTitle className="text-blue-700">
              {currentArea?.title} - {currentTask.order_letter}. {currentTask.title}
            </CardTitle>
            <CardDescription className="mt-1">{currentTask.objective}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={currentTask.status === "completed" ? "outline" : "default"} 
              size="sm" 
              className={currentTask.status === "completed" ? "text-green-600 border-green-600" : "bg-green-600 hover:bg-green-700"}
              onClick={() => onMarkComplete(currentTask.id)}
            >
              {currentTask.status === "completed" ? "Marked Complete" : "Mark Complete"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="knowledge" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="knowledge" className="data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-700">
              Knowledge
            </TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-700">
              Risk Management
            </TabsTrigger>
            <TabsTrigger value="skill" className="data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-700">
              Skills
            </TabsTrigger>
          </TabsList>
          <div className="p-4">
            <TabsContent value="knowledge" className="mt-0">
              <ElementView taskId={currentTask.id} sessionId={sessionId} elementType="knowledge" />
            </TabsContent>
            <TabsContent value="risk" className="mt-0">
              <ElementView taskId={currentTask.id} sessionId={sessionId} elementType="risk" />
            </TabsContent>
            <TabsContent value="skill" className="mt-0">
              <ElementView taskId={currentTask.id} sessionId={sessionId} elementType="skill" />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
} 