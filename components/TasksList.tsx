"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronRight, CheckCircle, Clock, AlertCircle, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAcsSidebarData } from "@/lib/supabase/data-fetchers"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface TasksListProps {
  onTaskSelect: (task: any, area: any) => void
  sessionId: string
}

export function TasksList({ onTaskSelect, sessionId }: TasksListProps) {
  const [areas, setAreas] = useState<any[]>([])
  const [tasksByArea, setTasksByArea] = useState<Record<string, any[]>>({})
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [taskStatus, setTaskStatus] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        const data = await getAcsSidebarData(sessionId)

        if (data) {
          setAreas(data.areas)
          setTasksByArea(data.tasksByArea)
          
          // Convert completedTasks array to a status map
          const statusMap: Record<string, string> = {}
          data.completedTasks.forEach((taskId: string) => {
            statusMap[taskId] = "completed"
          })
          
          // Add in-progress tasks if available in the data
          if (data.inProgressTasks) {
            data.inProgressTasks.forEach((taskId: string) => {
              statusMap[taskId] = "in_progress"
            })
          }
          
          setTaskStatus(statusMap)

          // Auto-expand all areas for better visibility
          const expandAll: Record<string, boolean> = {}
          data.areas.forEach((area: any) => {
            expandAll[area.id] = true
          })
          setExpandedAreas(expandAll)
        }
      } catch (error) {
        console.error("Error fetching tasks data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasksData()
  }, [sessionId])

  const toggleArea = (areaId: string) => {
    setExpandedAreas((prev) => ({
      ...prev,
      [areaId]: !prev[areaId],
    }))
  }

  const handleTaskClick = (task: any, area: any) => {
    setSelectedTaskId(task.id)
    onTaskSelect(task, area)
  }
  
  const getStatusIcon = (taskId: string) => {
    const status = taskStatus[taskId] || "not_started"
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-amber-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }
  
  const filterTasks = () => {
    if (!searchTerm.trim()) return { areas, tasksByArea }
    
    const filteredAreas = [...areas]
    const filteredTasksByArea: Record<string, any[]> = {}
    
    areas.forEach(area => {
      const areaTasks = tasksByArea[area.id] || []
      const matchingTasks = areaTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.order_letter.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      if (matchingTasks.length > 0) {
        filteredTasksByArea[area.id] = matchingTasks
      }
    })
    
    return { areas: filteredAreas, tasksByArea: filteredTasksByArea }
  }
  
  const { areas: filteredAreas, tasksByArea: filteredTasksByArea } = filterTasks()

  if (loading) {
    return (
      <div className="w-full p-4 border rounded-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-4 border-b bg-blue-50">
        <h2 className="font-semibold text-blue-700 mb-3">Tasks</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)] p-2">
        <div className="space-y-2 p-2">
          {filteredAreas.map((area) => {
            const areaTasks = filteredTasksByArea[area.id] || []
            if (areaTasks.length === 0) return null
            
            // Count completed tasks in this area
            const completedCount = areaTasks.filter(task => 
              taskStatus[task.id] === "completed"
            ).length
            
            return (
              <div key={area.id} className="border rounded-md overflow-hidden">
                <button
                  className="flex items-center justify-between w-full p-3 text-left font-medium bg-gray-50 hover:bg-gray-100"
                  onClick={() => toggleArea(area.id)}
                >
                  <div className="flex items-center gap-2">
                    <span>{area.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {completedCount}/{areaTasks.length}
                    </Badge>
                  </div>
                  {expandedAreas[area.id] ? 
                    <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  }
                </button>

                {expandedAreas[area.id] && (
                  <div className="pl-3 pr-3 pb-2 space-y-1">
                    {areaTasks.map((task: any) => (
                      <button
                        key={task.id}
                        className={cn(
                          "flex items-center justify-between w-full p-2 text-sm rounded-md",
                          "hover:bg-blue-50",
                          selectedTaskId === task.id ? "bg-blue-50 text-blue-700" : ""
                        )}
                        onClick={() => handleTaskClick(task, area)}
                      >
                        <span className="flex items-center gap-2 overflow-hidden">
                          {getStatusIcon(task.id)}
                          <span className="truncate">
                            {task.order_letter}. {task.title}
                          </span>
                          {task.is_required && 
                            <span className="shrink-0 ml-1 text-xs text-red-500 font-medium">Required</span>
                          }
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          
          {filteredAreas.length === 0 || 
           Object.values(filteredTasksByArea).flat().length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No tasks match your search.
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  )
} 