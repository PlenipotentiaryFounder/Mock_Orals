"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Search, Folder, Layers, CheckCircle2, Circle, AlertCircle, Filter, AlertTriangle, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { AreaWithTasksAndElements, TaskWithElements, ElementBasic } from "@/lib/supabase/data-fetchers"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * NavigationPanel - Provides structured access to all evaluation elements
 *
 * This component offers:
 * - Hierarchical navigation through areas, tasks, and elements
 * - Search functionality to quickly find specific elements
 * - Progress tracking view to monitor completion status
 * - Filtering options to focus on specific element statuses
 * - Visual indicators for element status (completed, in-progress, issues)
 *
 * The navigation panel is designed to help instructors efficiently navigate
 * through the evaluation template and track progress at a glance.
 */
interface NavigationPanelProps {
  hierarchy: AreaWithTasksAndElements[]
  isLoading: boolean
  onElementSelect: (elementId: string) => void
  initialSelectedElementId?: string | null
}

export function NavigationPanel({ 
  hierarchy,
  isLoading,
  onElementSelect, 
  initialSelectedElementId 
}: NavigationPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedElementId, setSelectedElementId] = useState<string | null>(initialSelectedElementId || null)
  const [view, setView] = useState<"tree" | "progress">("tree")
  const [statusFilters, setStatusFilters] = useState({
    completed: true,
    "in-progress": true,
    issue: true,
    notStarted: true,
  })

  useEffect(() => {
    setSelectedElementId(initialSelectedElementId || null)
  }, [initialSelectedElementId])

  const handleElementClick = (elementId: string) => {
    setSelectedElementId(elementId)
    onElementSelect(elementId)
  }

  const filteredHierarchy = useMemo(() => {
    if (!searchTerm && Object.values(statusFilters).every((v) => v === true)) {
      return hierarchy
    }

    const lowerSearchTerm = searchTerm.toLowerCase()

    return hierarchy
      .map((area) => {
        const filteredTasks = (area.tasks || [])
          .map((task) => {
            const filteredElements = (task.elements || [])
              .filter((element: ElementBasic) => {
                const matchesSearch =
                  !searchTerm ||
                  element.code.toLowerCase().includes(lowerSearchTerm) ||
                  element.description.toLowerCase().includes(lowerSearchTerm)

                const matchesStatus =
                  (element.status === "completed" && statusFilters.completed) ||
                  (element.status === "in-progress" && (statusFilters["in-progress"] || statusFilters.notStarted)) ||
                  (element.status === "issue" && statusFilters.issue)

                return matchesSearch && matchesStatus
              })

            const taskMatches =
              !searchTerm ||
              task.title.toLowerCase().includes(lowerSearchTerm) ||
              task.order_letter.toLowerCase().includes(lowerSearchTerm)

            if (taskMatches || filteredElements.length > 0) {
              return { ...task, elements: filteredElements }
            }
            return null
          })
          .filter((task): task is TaskWithElements => task !== null)

        const areaMatches = !searchTerm || area.title.toLowerCase().includes(lowerSearchTerm)

        if (areaMatches || filteredTasks.length > 0) {
          return { ...area, tasks: filteredTasks }
        }
        return null
      })
      .filter((area): area is AreaWithTasksAndElements => area !== null)
  }, [hierarchy, searchTerm, statusFilters])

  const defaultAccordionValues = useMemo(() => {
    if (searchTerm) {
      const openItems: string[] = []
      filteredHierarchy.forEach((area) => {
        openItems.push(`area-${area.id}`)
        area.tasks.forEach((task) => {
          if (task.elements.length > 0 || task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            openItems.push(`task-${task.id}`)
          }
        })
      })
      return openItems
    }

    if (selectedElementId) {
      for (const area of hierarchy) {
        for (const task of area.tasks) {
          if (task.elements.some((el) => el.id === selectedElementId)) {
            const filteredAreaExists = filteredHierarchy.some(fa => fa.id === area.id)
            const filteredTaskExists = filteredAreaExists && filteredHierarchy
                .find(fa => fa.id === area.id)?.tasks
                .some(ft => ft.id === task.id)

            if (filteredTaskExists) {
              return [`area-${area.id}`, `task-${task.id}`]
            } else {
              if (filteredAreaExists) return [`area-${area.id}`]
              return []
            }
          }
        }
      }
    }

    return []
  }, [filteredHierarchy, hierarchy, searchTerm, selectedElementId])

  const progressData = useMemo(() => {
    return hierarchy.map((area) => {
      let areaCompleted = 0
      let areaTotal = 0

      const tasks = (area.tasks || []).map((task) => {
        const taskCompleted = (task.elements || []).filter((el: ElementBasic) => el.status === "completed").length
        const taskTotal = (task.elements || []).length

        areaCompleted += taskCompleted
        areaTotal += taskTotal

        return {
          ...task,
          progress: taskTotal > 0 ? (taskCompleted / taskTotal) * 100 : 0,
          completed: taskCompleted,
          total: taskTotal,
        }
      })

      return {
        ...area,
        tasks,
        progress: areaTotal > 0 ? (areaCompleted / areaTotal) * 100 : 0,
        completed: areaCompleted,
        total: areaTotal,
      }
    })
  }, [hierarchy])

  const getStatusOrDeficiencyIcon = (element: any) => {
    if (element.a2_deficiency) {
      if (element.performance_status === "satisfactory") {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span><AlertTriangle className="h-4 w-4 text-green-600" /></span>
              </TooltipTrigger>
              <TooltipContent>Written Test Deficiency (Satisfactory)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      } else if (element.performance_status === "unsatisfactory") {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span><AlertTriangle className="h-4 w-4 text-red-600" /></span>
              </TooltipTrigger>
              <TooltipContent>Written Test Deficiency (Unsatisfactory)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      } else {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span><AlertTriangle className="h-4 w-4 text-yellow-500" /></span>
              </TooltipTrigger>
              <TooltipContent>Written Test Deficiency – Must Be Covered</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    }
    return getStatusIcon(element.status);
  }

  const getStatusIcon = (status: ElementBasic['status'] | 'not-observed') => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
      case "issue":
        return <AlertCircle className="h-3.5 w-3.5 text-red-500" />
      case "in-progress":
      case "not-observed":
        return <Circle className="h-3.5 w-3.5 text-amber-500" />
      default:
        return <Circle className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col border bg-card rounded-lg shadow-sm overflow-hidden">
      <div className="p-3 border-b">
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Tasks & Elements..."
            className="pl-8 h-8 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem
                checked={statusFilters.completed}
                onCheckedChange={(checked) => setStatusFilters({ ...statusFilters, completed: checked })}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mr-2" />
                Completed
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilters["in-progress"]}
                onCheckedChange={(checked) => setStatusFilters({ ...statusFilters, "in-progress": checked })}
              >
                <Circle className="h-3.5 w-3.5 text-amber-500 mr-2" />
                In Progress
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilters.issue}
                onCheckedChange={(checked) => setStatusFilters({ ...statusFilters, issue: checked })}
              >
                <AlertCircle className="h-3.5 w-3.5 text-red-500 mr-2" />
                Issues
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilters.notStarted}
                onCheckedChange={(checked) => setStatusFilters({ ...statusFilters, notStarted: checked })}
              >
                <Circle className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                Not Started
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Progress:</span>
            <Badge variant="outline" className="h-5 text-[10px]">
              {Math.round(progressData.reduce((acc, area) => acc + area.progress, 0) / progressData.length)}%
            </Badge>
          </div>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as "tree" | "progress")} className="w-full">
          <TabsList className="w-full h-7">
            <TabsTrigger value="tree" className="flex-1 text-xs">
              Structure
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex-1 text-xs">
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tree" className="p-0 m-0">
            <ScrollArea className="h-[calc(100vh-10rem)]">
              {filteredHierarchy.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {searchTerm ? "No matching results found." : "No areas found for this template."}
                </div>
              ) : (
                <Accordion
                  type="multiple"
                  className="w-full"
                  key={defaultAccordionValues.join("-")}
                  defaultValue={defaultAccordionValues}
                >
                  {filteredHierarchy.map((area) => (
                    <AccordionItem key={area.id} value={`area-${area.id}`} className="border-b-0">
                      <AccordionTrigger className="px-3 py-2 text-sm hover:bg-muted/50 hover:no-underline">
                        <div className="flex items-center gap-2 font-medium">
                          <Layers className="h-4 w-4 text-primary" />
                          <span>
                            {area.order_number}. {area.title}
                          </span>
                          <Badge variant="outline" className="ml-auto text-[10px] h-5">
                            {progressData.find((a) => a.id === area.id)?.completed || 0}/
                            {progressData.find((a) => a.id === area.id)?.total || 0}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0 pb-1 pl-3">
                        {area.tasks.length > 0 ? (
                          <Accordion type="multiple" className="w-full" defaultValue={defaultAccordionValues}>
                            {area.tasks.map((task) => (
                              <AccordionItem key={task.id} value={`task-${task.id}`} className="border-b-0">
                                <AccordionTrigger className="pl-4 pr-3 py-1.5 text-xs hover:bg-muted/50 hover:no-underline [&[data-state=open]>div>svg]:rotate-90">
                                  <div className="flex items-center gap-2 justify-between w-full">
                                    <div className="flex items-center gap-2">
                                      <Folder className="h-3.5 w-3.5 text-secondary-foreground transition-transform duration-200" />
                                      <span>
                                        {task.order_letter}. {task.title}
                                      </span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] h-5">
                                      {task.elements.filter((el) => el.status === "completed").length}/
                                      {task.elements.length}
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-0 pb-1 pl-8 pr-2">
                                  {task.elements.length > 0 ? (
                                    <div className="space-y-1 mt-1">
                                      {task.elements.map((element) => (
                                        <Button
                                          key={element.id}
                                          variant="ghost"
                                          className={cn(
                                            "w-full h-auto justify-start text-left py-1 px-2 text-xs font-normal leading-snug",
                                            selectedElementId === element.id
                                              ? "bg-accent text-accent-foreground"
                                              : "hover:bg-accent/80",
                                          )}
                                          onClick={() => handleElementClick(element.id)}
                                          title={element.description}
                                        >
                                          <div className="flex items-center gap-1.5 w-full">
                                            {getStatusOrDeficiencyIcon(element)}
                                            <span className="flex-1 truncate">
                                              {element.code}: {element.description}
                                            </span>
                                          </div>
                                        </Button>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground py-1 px-2">No elements</p>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        ) : (
                          <p className="text-xs text-muted-foreground py-1 px-4">No tasks in this area</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="progress" className="p-0 m-0">
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <div className="p-3 space-y-4">
                {progressData.map((area) => (
                  <div key={area.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">
                        {area.order_number}. {area.title}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {area.completed}/{area.total}
                      </span>
                    </div>
                    <Progress value={area.progress} className="h-1.5" />

                    <div className="pl-4 space-y-3 mt-3">
                      {area.tasks.map((task) => (
                        <div key={task.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs">
                              {task.order_letter}. {task.title}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {task.completed}/{task.total}
                            </span>
                          </div>
                          <Progress value={task.progress} className="h-1" />

                          <div className="grid grid-cols-2 gap-1 mt-1">
                            {task.elements.map((element) => (
                              <Button
                                key={element.id}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "h-auto justify-start text-left py-1 px-2 text-xs font-normal",
                                  selectedElementId === element.id
                                    ? "bg-accent text-accent-foreground"
                                    : "hover:bg-accent/80",
                                  element.status === "completed" && "border-l-2 border-green-500",
                                  element.status === "issue" && "border-l-2 border-red-500",
                                  element.status === "in-progress" && "border-l-2 border-amber-500",
                                )}
                                onClick={() => handleElementClick(element.id)}
                              >
                                <div className="flex items-center gap-1.5">
                                  {getStatusOrDeficiencyIcon(element)}
                                  <span className="truncate">{element.code}</span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
