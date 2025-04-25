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
import { ExternalLink } from "lucide-react"

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

          Object.entries(data.scores).forEach(([elementId, scoreData]) => {
            initialScores[elementId] = scoreData.score
            initialComments[elementId] = scoreData.comment
          })

          setScores(initialScores)
          setComments(initialComments)
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

    try {
      await saveElementScore(sessionId, elementId, score, comments[elementId] || "")
    } catch (error) {
      console.error("Error saving score:", error)
    }
  }

  const handleCommentChange = (elementId: string, comment: string) => {
    setComments((prev) => ({ ...prev, [elementId]: comment }))
  }

  const handleCommentSave = async (elementId: string) => {
    try {
      await saveElementScore(sessionId, elementId, scores[elementId] || 0, comments[elementId] || "")
    } catch (error) {
      console.error("Error saving comment:", error)
    }
  }

  const handleMentionedChange = (elementId: string, type: "instructor" | "student", checked: boolean) => {
    if (type === "instructor") {
      setInstructorMentioned((prev) => ({ ...prev, [elementId]: checked }))
    } else {
      setStudentMentioned((prev) => ({ ...prev, [elementId]: checked }))
    }
  }

  if (loading) {
    return <div>Loading elements...</div>
  }

  if (elements.length === 0) {
    return <div>No {elementType} elements found for this task.</div>
  }

  return (
    <div className="space-y-4">
      {elements.map((element) => (
        <Card key={element.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-muted/50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{element.code}</span>
                    <h3 className="font-medium">{element.description}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`instructor-${element.id}`}
                      checked={instructorMentioned[element.id] || false}
                      onCheckedChange={(checked) => handleMentionedChange(element.id, "instructor", checked as boolean)}
                    />
                    <Label htmlFor={`instructor-${element.id}`} className="text-xs">
                      Instructor Prompted
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`student-${element.id}`}
                      checked={studentMentioned[element.id] || false}
                      onCheckedChange={(checked) => handleMentionedChange(element.id, "student", checked as boolean)}
                    />
                    <Label htmlFor={`student-${element.id}`} className="text-xs">
                      Student Mentioned
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="notes">
                <AccordionTrigger className="px-4">Instructor Notes</AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-4">
                    {instructorNotes[element.id]?.length > 0 ? (
                      instructorNotes[element.id].map((note: any) => (
                        <div key={note.id} className="border-l-2 border-primary pl-4 py-2">
                          <p>{note.note_text}</p>
                          {note.source_title && (
                            <div className="flex items-center mt-2 text-sm text-muted-foreground">
                              <span>{note.source_title}</span>
                              {note.page_reference && <span className="ml-2">{note.page_reference}</span>}
                              {note.source_url && (
                                <a
                                  href={note.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 flex items-center text-primary hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Source
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No instructor notes available.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="questions">
                <AccordionTrigger className="px-4">Sample Questions</AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="space-y-2">
                    {sampleQuestions[element.id]?.length > 0 ? (
                      sampleQuestions[element.id].map((question: any) => (
                        <div key={question.id} className="p-2 bg-muted rounded-md">
                          <p>{question.question_text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No sample questions available.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="p-4 border-t">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Performance Rating</h4>
                  <RadioGroup
                    value={scores[element.id]?.toString() || ""}
                    onValueChange={(value) => handleScoreChange(element.id, Number.parseInt(value))}
                    className="flex space-x-2"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="1" id={`score-1-${element.id}`} />
                      <Label htmlFor={`score-1-${element.id}`} className="text-xs">
                        Rote
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="2" id={`score-2-${element.id}`} />
                      <Label htmlFor={`score-2-${element.id}`} className="text-xs">
                        Understanding
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="3" id={`score-3-${element.id}`} />
                      <Label htmlFor={`score-3-${element.id}`} className="text-xs">
                        Application
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="4" id={`score-4-${element.id}`} />
                      <Label htmlFor={`score-4-${element.id}`} className="text-xs">
                        Correlation
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Instructor Comment</h4>
                    <Button variant="outline" size="sm" onClick={() => handleCommentSave(element.id)}>
                      Save
                    </Button>
                  </div>
                  <Textarea
                    value={comments[element.id] || ""}
                    onChange={(e) => handleCommentChange(element.id, e.target.value)}
                    placeholder="Add your comments about the student's performance..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
