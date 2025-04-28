"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Search, Folder, Layers, CheckCircle2, Circle, AlertCircle, Filter } from "lucide-react"
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
  templateId: string
  onElementSelect: (elementId: string) => void
  initialSelectedElementId?: string | null
}

// Dummy function, replace with actual implementation
async function getFullHierarchy(templateId: string): Promise<any[]> {
  // Replace this with your actual data fetching logic
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = [
        {
          id: "area1",
          order_number: 1,
          title: "Area 1",
          tasks: [
            {
              id: "task1",
              order_letter: "A",
              title: "Task 1",
              elements: [
                { id: "element1", code: "EL1", description: "Element 1", status: "completed" },
                { id: "element2", code: "EL2", description: "Element 2", status: "in-progress" },
              ],
            },
            {
              id: "task2",
              order_letter: "B",
              title: "Task 2",
              elements: [
                { id: "element3", code: "EL3", description: "Element 3", status: "issue" },
                { id: "element4", code: "EL4", description: "Element 4", status: "completed" },
              ],
            },
          ],
        },
        {
          id: "area2",
          order_number: 2,
          title: "Area 2",
          tasks: [
            {
              id: "task3",
              order_letter: "A",
              title: "Task 3",
              elements: [
                { id: "element5", code: "EL5", description: "Element 5", status: "completed" },
                { id: "element6", code: "EL6", description: "Element 6", status: "in-progress" },
              ],
            },
          ],
        },
      ]
      resolve(mockData)
    }, 500)
  })
}

export function NavigationPanel({ templateId, onElementSelect, initialSelectedElementId }: NavigationPanelProps) {
  const [hierarchy, setHierarchy] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedElementId, setSelectedElementId] = useState<string | null>(initialSelectedElementId || null)
  const [view, setView] = useState<"tree" | "progress">("tree")
  const [statusFilters, setStatusFilters] = useState({
    completed: true,
    "in-progress": true,
    issue: true,
    notStarted: true,
  })

  // Load hierarchy data
  useEffect(() => {
    const loadHierarchy = async () => {
      setLoading(true)
      try {
        const data = await getFullHierarchy(templateId)
        setHierarchy(data)
      } catch (error) {
        console.error("Error loading hierarchy:", error)
      } finally {
        setLoading(false)
      }
    }

    if (templateId) {
      loadHierarchy()
    }
  }, [templateId])

  // Update selected element when prop changes
  useEffect(() => {
    setSelectedElementId(initialSelectedElementId || null)
  }, [initialSelectedElementId])

  // Handle element selection
  const handleElementClick = (elementId: string) => {
    setSelectedElementId(elementId)
    onElementSelect(elementId)
  }

  // Filter hierarchy based on search term and status filters
  const filteredHierarchy = useMemo(() => {
    if (!searchTerm && Object.values(statusFilters).every((v) => v === true)) {
      return hierarchy
    }

    const lowerSearchTerm = searchTerm.toLowerCase()

    return hierarchy
      .map((area) => {
        const filteredTasks = area.tasks
          .map((task) => {
            const filteredElements = task.elements.filter((element) => {
              // Filter by search term
              const matchesSearch =
                !searchTerm ||
                element.code.toLowerCase().includes(lowerSearchTerm) ||
                element.description.toLowerCase().includes(lowerSearchTerm)

              // Filter by status
              const matchesStatus =
                (element.status === "completed" && statusFilters.completed) ||
                (element.status === "in-progress" && statusFilters["in-progress"]) ||
                (element.status === "issue" && statusFilters.issue) ||
                (!element.status && statusFilters.notStarted)

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
          .filter((task) => task !== null)

        const areaMatches = !searchTerm || area.title.toLowerCase().includes(lowerSearchTerm)

        if (areaMatches || filteredTasks.length > 0) {
          return { ...area, tasks: filteredTasks }
        }
        return null
      })
      .filter((area) => area !== null)
  }, [hierarchy, searchTerm, statusFilters])

  // Determine which accordion items should be open by default
  const defaultAccordionValues = useMemo(() => {
    if (searchTerm) {
      const openItems: string[] = []
      filteredHierarchy.forEach((area) => {
        openItems.push(`area-${area.id}`)
        area.tasks.forEach((task) => {
          openItems.push(`task-${task.id}`)
        })
      })
      return openItems
    }

    if (selectedElementId) {
      for (const area of hierarchy) {
        for (const task of area.tasks) {
          if (task.elements.some((el) => el.id === selectedElementId)) {
            return [`area-${area.id}`, `task-${task.id}`]
          }
        }
      }
    }

    return []
  }, [filteredHierarchy, hierarchy, searchTerm, selectedElementId])

  // Calculate progress for each area and task
  const progressData = useMemo(() => {
    return hierarchy.map((area) => {
      let areaCompleted = 0
      let areaTotal = 0

      const tasks = area.tasks.map((task) => {
        const taskCompleted = task.elements.filter((el) => el.status === "completed").length
        const taskTotal = task.elements.length

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

  // Get element status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
      case "in-progress":
        return <Circle className="h-3.5 w-3.5 text-amber-500" />
      case "issue":
        return <AlertCircle className="h-3.5 w-3.5 text-red-500" />
      default:
        return <Circle className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalElements = hierarchy.reduce(
      (acc, area) => acc + area.tasks.reduce((taskAcc, task) => taskAcc + task.elements.length, 0),
      0,
    )

    const completedElements = hierarchy.reduce(
      (acc, area) =>
        acc +
        area.tasks.reduce(
          (taskAcc, task) => taskAcc + task.elements.filter((el) => el.status === "completed").length,
          0,
        ),
      0,
    )

    return totalElements > 0 ? Math.round((completedElements / totalElements) * 100) : 0
  }, [hierarchy])

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        {/* Search input with icon */}
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Tasks & Elements..."
            className="pl-8 h-8 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter dropdown */}
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

          {/* Overall progress indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Progress:</span>
            <Badge variant="outline" className="h-5 text-[10px]">
              {overallProgress}%
            </Badge>
          </div>
        </div>

        {/* View switcher tabs */}
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
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredHierarchy.length === 0 ? (
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
                    <AccordionItem value={`area-${area.id}`} key={area.id} className="border-b-0">
                      <AccordionTrigger className="px-3 py-2 text-sm hover:bg-muted/50 hover:no-underline">
                        <div className="flex items-center gap-2 font-medium">
                          <Layers className="h-4 w-4 text-primary" />
                          <span>
                            {area.order_number}. {area.title}
                          </span>
                          {/* Show area progress badge */}
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
                              <AccordionItem value={`task-${task.id}`} key={task.id} className="border-b-0">
                                <AccordionTrigger className="pl-4 pr-3 py-1.5 text-xs hover:bg-muted/50 hover:no-underline [&[data-state=open]>div>svg]:rotate-90">
                                  <div className="flex items-center gap-2 justify-between w-full">
                                    <div className="flex items-center gap-2">
                                      <Folder className="h-3.5 w-3.5 text-secondary-foreground transition-transform duration-200" />
                                      <span>
                                        {task.order_letter}. {task.title}
                                      </span>
                                    </div>
                                    {/* Show task progress badge */}
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
                                            {getStatusIcon(element.status)}
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

                          {/* Task elements with clickable buttons */}
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
                                  {getStatusIcon(element.status)}
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
