"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { getElementViewData, saveElementScore } from "@/lib/supabase/data-fetchers"
import { 
  ExternalLink,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Save,
  AlertCircle,
  FileText,
  HelpCircle,
  ChevronRight,
  ChevronDown
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ElementViewProps {
  taskId: string
  sessionId: string
  elementType: "knowledge" | "risk" | "skill"
}

export function ElementView({ taskId, sessionId, elementType }: ElementViewProps) {
  const [elements, setElements] = useState<any[]>([])
  const [instructorNotes, setInstructorNotes] = useState<Record<string, any[]>>({})
  const [sampleQuestions, setSampleQuestions] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [instructorMentioned, setInstructorMentioned] = useState<Record<string, boolean>>({})
  const [studentMentioned, setStudentMentioned] = useState<Record<string, boolean>>({})
  const [expandedElements, setExpandedElements] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchElements = async () => {
      try {
        const data = await getElementViewData(taskId, sessionId, elementType)

        if (data) {
          setElements(data.elements)
          setInstructorNotes(data.instructorNotes)
          setSampleQuestions(data.sampleQuestions)

          // Initialize scores and comments
          const initialScores: Record<string, number> = {}
          const initialComments: Record<string, string> = {}
          const initialInstructorMentioned: Record<string, boolean> = {}
          const initialStudentMentioned: Record<string, boolean> = {}

          Object.entries(data.scores).forEach(([elementId, scoreData]) => {
            initialScores[elementId] = scoreData.score
            initialComments[elementId] = scoreData.comment
            initialInstructorMentioned[elementId] = scoreData.instructor_mentioned || false
            initialStudentMentioned[elementId] = scoreData.student_mentioned || false
          })

          setScores(initialScores)
          setComments(initialComments)
          setInstructorMentioned(initialInstructorMentioned)
          setStudentMentioned(initialStudentMentioned)
          
          // Initialize expanded state - only expand the first element
          if (data.elements.length > 0) {
            const initialExpandedState: Record<string, boolean> = {}
            data.elements.forEach((element, index) => {
              initialExpandedState[element.id] = index === 0
            })
            setExpandedElements(initialExpandedState)
          }
        }
      } catch (error) {
        console.error("Error fetching elements:", error)
      } finally {
        setLoading(false)
      }
    }

    if (taskId && sessionId) {
      fetchElements()
    }
  }, [taskId, sessionId, elementType])

  const handleScoreChange = async (elementId: string, score: number) => {
    setScores((prev) => ({ ...prev, [elementId]: score }))
    saveElementData(elementId)
  }

  const handleCommentChange = (elementId: string, comment: string) => {
    setComments((prev) => ({ ...prev, [elementId]: comment }))
  }

  const handleMentionedChange = (elementId: string, type: "instructor" | "student", checked: boolean) => {
    if (type === "instructor") {
      setInstructorMentioned((prev) => ({ ...prev, [elementId]: checked }))
    } else {
      setStudentMentioned((prev) => ({ ...prev, [elementId]: checked }))
    }
    saveElementData(elementId)
  }
  
  const saveElementData = async (elementId: string) => {
    try {
      await saveElementScore(
        sessionId, 
        elementId, 
        scores[elementId] || 0, 
        comments[elementId] || "",
        instructorMentioned[elementId] || false,
        studentMentioned[elementId] || false
      )
    } catch (error) {
      console.error("Error saving element data:", error)
    }
  }

  const getTypeColorClass = () => {
    switch (elementType) {
      case "knowledge":
        return "border-blue-200 bg-blue-50"
      case "risk":
        return "border-amber-200 bg-amber-50"
      case "skill":
        return "border-green-200 bg-green-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }
  
  const getTypeIcon = () => {
    switch (elementType) {
      case "knowledge":
        return <BookOpen className="h-4 w-4 text-blue-600" />
      case "risk":
        return <AlertCircle className="h-4 w-4 text-amber-600" />
      case "skill":
        return <FileText className="h-4 w-4 text-green-600" />
      default:
        return null
    }
  }

  const getElementStatus = (elementId: string) => {
    // Has a score
    const hasScore = !!scores[elementId]
    // Has a comment
    const hasComment = !!comments[elementId] && comments[elementId].trim().length > 0
    // Has been mentioned/prompted
    const hasInteraction = instructorMentioned[elementId] || studentMentioned[elementId]
    
    if (hasScore && (hasComment || hasInteraction)) {
      return "completed"
    } else if (hasScore || hasComment || hasInteraction) {
      return "in-progress"
    }
    return "not-started"
  }
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600 text-white">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-amber-500 text-white">In Progress</Badge>
      case "not-started":
        return <Badge className="bg-gray-400 text-white">Not Started</Badge>
      default:
        return null
    }
  }
  
  const toggleElementExpanded = (elementId: string) => {
    setExpandedElements(prev => ({
      ...prev,
      [elementId]: !prev[elementId]
    }))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-md"></div>
          <div className="h-24 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    )
  }

  if (elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center border rounded-md bg-muted/20">
        <HelpCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No {elementType} elements found for this task.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getTypeIcon()}
          <h3 className="font-medium text-sm capitalize">
            {elementType} Elements ({elements.length})
          </h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            // Toggle all elements to the same state (opposite of first element)
            const firstExpanded = expandedElements[elements[0].id]
            const newState = !firstExpanded
            const newExpandedState: Record<string, boolean> = {}
            elements.forEach(element => {
              newExpandedState[element.id] = newState
            })
            setExpandedElements(newExpandedState)
          }}
          className="text-xs"
        >
          {expandedElements[elements[0]?.id] ? 'Collapse All' : 'Expand All'}
        </Button>
      </div>
      
      {elements.map((element) => {
        const elementStatus = getElementStatus(element.id)
        const isExpanded = expandedElements[element.id] || false
        
        return (
          <Card 
            key={element.id} 
            className={cn(
              "overflow-hidden border-2 transition-all duration-200",
              getTypeColorClass(),
              elementStatus === "completed" ? "border-green-300" : 
              elementStatus === "in-progress" ? "border-amber-300" : ""
            )}
          >
            <div 
              className="p-4 cursor-pointer flex items-center justify-between"
              onClick={() => toggleElementExpanded(element.id)}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <Badge variant="outline" className="font-mono text-xs">
                  {element.code}
                </Badge>
                <h3 className="font-medium">{element.description}</h3>
              </div>
              
              <div className="flex items-center gap-3">
                {getStatusLabel(elementStatus)}
                
                {/* Only show these in collapsed view */}
                {!isExpanded && (
                  <div className="flex items-center gap-2">
                    {instructorMentioned[element.id] && (
                      <Badge variant="secondary" className="text-xs px-2">Prompted</Badge>
                    )}
                    {studentMentioned[element.id] && (
                      <Badge variant="secondary" className="text-xs px-2">Mentioned</Badge>
                    )}
                    {scores[element.id] > 0 && (
                      <Badge variant="secondary" className="text-xs px-2">Score: {scores[element.id]}</Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {isExpanded && (
              <CardContent className="p-0 border-t">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`instructor-${element.id}`}
                                checked={instructorMentioned[element.id] || false}
                                onCheckedChange={(checked) => handleMentionedChange(element.id, "instructor", checked as boolean)}
                              />
                              <Label htmlFor={`instructor-${element.id}`} className="text-xs">
                                Prompted
                              </Label>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Element was prompted by the instructor</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`student-${element.id}`}
                                checked={studentMentioned[element.id] || false}
                                onCheckedChange={(checked) => handleMentionedChange(element.id, "student", checked as boolean)}
                              />
                              <Label htmlFor={`student-${element.id}`} className="text-xs">
                                Mentioned
                              </Label>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Element was mentioned by the student</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="notes" className="border-t border-b-0 px-0">
                    <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>Instructor Notes</span>
                        {instructorNotes[element.id]?.length > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {instructorNotes[element.id].length}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2">
                      <div className="space-y-3">
                        {instructorNotes[element.id]?.length > 0 ? (
                          instructorNotes[element.id].map((note: any) => (
                            <div key={note.id} className="border-l-4 border-blue-400 pl-3 py-1">
                              <p className="text-sm">{note.note_text}</p>
                              {note.source_title && (
                                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                  <span>{note.source_title}</span>
                                  {note.page_reference && <span className="ml-2">p.{note.page_reference}</span>}
                                  {note.source_url && (
                                    <a
                                      href={note.source_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-2 flex items-center text-blue-600 hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      Link
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No instructor notes available.</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="questions" className="border-b-0 border-t-0 px-0">
                    <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span>Sample Questions</span>
                        {sampleQuestions[element.id]?.length > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {sampleQuestions[element.id].length}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-2">
                      <div className="space-y-2">
                        {sampleQuestions[element.id]?.length > 0 ? (
                          sampleQuestions[element.id].map((question: any) => (
                            <div key={question.id} className="p-2 bg-muted/50 rounded-md border text-sm">
                              <p>{question.question_text}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No sample questions available.</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="p-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Performance Rating</h4>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1 max-w-xs">
                                <p className="font-medium">Rating Scale:</p>
                                <p className="text-xs">1 - Rote: Basic recall of information</p>
                                <p className="text-xs">2 - Understanding: Comprehends the concept</p>
                                <p className="text-xs">3 - Application: Can apply the knowledge</p>
                                <p className="text-xs">4 - Correlation: Connects to broader concepts</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <RadioGroup
                        value={scores[element.id]?.toString() || ""}
                        onValueChange={(value) => handleScoreChange(element.id, Number.parseInt(value))}
                        className="flex flex-wrap gap-x-4 gap-y-2"
                      >
                        <div className="flex items-center gap-2 p-2 border rounded-md bg-white">
                          <RadioGroupItem value="1" id={`score-1-${element.id}`} />
                          <Label htmlFor={`score-1-${element.id}`} className="text-xs font-medium">
                            Rote
                          </Label>
                        </div>
                        <div className="flex items-center gap-2 p-2 border rounded-md bg-white">
                          <RadioGroupItem value="2" id={`score-2-${element.id}`} />
                          <Label htmlFor={`score-2-${element.id}`} className="text-xs font-medium">
                            Understanding
                          </Label>
                        </div>
                        <div className="flex items-center gap-2 p-2 border rounded-md bg-white">
                          <RadioGroupItem value="3" id={`score-3-${element.id}`} />
                          <Label htmlFor={`score-3-${element.id}`} className="text-xs font-medium">
                            Application
                          </Label>
                        </div>
                        <div className="flex items-center gap-2 p-2 border rounded-md bg-white">
                          <RadioGroupItem value="4" id={`score-4-${element.id}`} />
                          <Label htmlFor={`score-4-${element.id}`} className="text-xs font-medium">
                            Correlation
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Instructor Comment</h4>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5 h-7"
                          onClick={() => saveElementData(element.id)}
                        >
                          <Save className="h-4 w-4" />
                          <span className="text-xs">Save</span>
                        </Button>
                      </div>
                      <Textarea
                        value={comments[element.id] || ""}
                        onChange={(e) => handleCommentChange(element.id, e.target.value)}
                        placeholder="Add your comments about the student's performance..."
                        className="min-h-[100px] resize-none"
                        onBlur={() => saveElementData(element.id)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
