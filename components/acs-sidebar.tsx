"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAcsSidebarData } from "@/lib/supabase/data-fetchers"

interface AcsSidebarProps {
  onTaskSelect: (task: any, area: any) => void
  sessionId: string
}

export function AcsSidebar({ onTaskSelect, sessionId }: AcsSidebarProps) {
  const [areas, setAreas] = useState<any[]>([])
  const [tasksByArea, setTasksByArea] = useState<Record<string, any[]>>({})
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])

  useEffect(() => {
    const fetchAcsData = async () => {
      try {
        const data = await getAcsSidebarData(sessionId)

        if (data) {
          setAreas(data.areas)
          setTasksByArea(data.tasksByArea)
          setCompletedTasks(data.completedTasks)

          // Auto-expand the first area
          if (data.areas.length > 0) {
            setExpandedAreas({ [data.areas[0].id]: true })
          }
        }
      } catch (error) {
        console.error("Error fetching ACS data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAcsData()
  }, [sessionId])

  const toggleArea = (areaId: string) => {
    setExpandedAreas((prev) => ({
      ...prev,
      [areaId]: !prev[areaId],
    }))
  }

  const handleTaskClick = (task: any, area: any) => {
    onTaskSelect(task, area)
  }

  if (loading) {
    return <div className="w-64 border-r p-4">Loading ACS structure...</div>
  }

  return (
    <div className="w-64 border-r overflow-auto">
      <div className="p-4">
        <h2 className="font-semibold mb-4">ACS Areas of Operation</h2>
        <div className="space-y-2">
          {areas.map((area) => (
            <div key={area.id} className="border rounded-md">
              <button
                className="flex items-center justify-between w-full p-2 text-left font-medium"
                onClick={() => toggleArea(area.id)}
              >
                <span>{area.title}</span>
                {expandedAreas[area.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {expandedAreas[area.id] && tasksByArea[area.id] && (
                <div className="pl-4 pr-2 pb-2 space-y-1">
                  {tasksByArea[area.id].map((task: any) => (
                    <button
                      key={task.id}
                      className={cn(
                        "flex items-center justify-between w-full p-2 text-sm rounded-md",
                        "hover:bg-accent hover:text-accent-foreground",
                      )}
                      onClick={() => handleTaskClick(task, area)}
                    >
                      <span className="flex items-center">
                        {task.order_letter}. {task.title}
                        {task.is_required && <span className="ml-1 text-xs text-red-500">*</span>}
                      </span>
                      {completedTasks.includes(task.id) && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
