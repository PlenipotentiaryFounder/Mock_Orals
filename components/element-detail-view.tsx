"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Clipboard,
  PlusCircle,
  Trash2,
  BookOpen,
  HelpCircle,
  ExternalLink,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useHotkeys } from "react-hotkeys-hook"
import { Input } from "@/components/ui/input"

/**
 * ElementDetailView - The primary workspace for evaluating individual elements
 *
 * This component provides:
 * - Detailed information about the selected element
 * - Performance assessment tools (satisfactory, unsatisfactory, not observed)
 * - Note-taking capabilities with quick templates
 * - Instructor notes with regulatory references
 * - Questions for student assessment
 *
 * The detail view is designed to streamline the evaluation process,
 * allowing instructors to quickly assess performance and document
 * observations with minimal friction.
 */
interface ElementDetailViewProps {
  elementId: string
  sessionId: string
}

export function ElementDetailView({ elementId, sessionId }: ElementDetailViewProps) {
  const [element, setElement] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState("")
  const [performance, setPerformance] = useState<"satisfactory" | "unsatisfactory" | "not-observed">("not-observed")
  const [activeTab, setActiveTab] = useState("evaluation")
  const [quickNotes, setQuickNotes] = useState<string[]>([
    "Demonstrated proficiency in all required areas.",
    "Needs improvement in communication and clarity.",
    "Excellent situational awareness throughout the exercise.",
    "Failed to follow proper procedures for this task.",
  ])
  const [newQuickNote, setNewQuickNote] = useState("")
  const [showQuickNoteInput, setShowQuickNoteInput] = useState(false)

  // Keyboard shortcuts for quick evaluation
  useHotkeys("alt+s", () => setPerformance("satisfactory"), [])
  useHotkeys("alt+u", () => setPerformance("unsatisfactory"), [])
  useHotkeys("alt+n", () => setPerformance("not-observed"), [])
  useHotkeys("alt+left", () => console.log("Navigate to previous element"))
  useHotkeys("alt+right", () => console.log("Navigate to next element"))

  // Sample instructor notes (regulatory references)
  const instructorNotes = [
    {
      text: "The applicant must be able to read, speak, write, and understand the English language.",
      source: "14 CFR § 61.123(b)",
      link: "#",
    },
    {
      text: "To be eligible for a commercial pilot certificate, an applicant must be at least 18 years of age.",
      source: "14 CFR § 61.123(a)",
      link: "#",
    },
    {
      text: "The applicant must receive and log ground training from an authorized instructor, or complete a home-study course, covering the aeronautical knowledge areas of § 61.125.",
      source: "14 CFR § 61.125",
      link: "#",
    },
    {
      text: "The applicant must receive and log flight training in the areas of operation listed in § 61.127 that apply to the aircraft category and class.",
      source: "14 CFR § 61.127",
      link: "#",
    },
    {
      text: "The applicant must receive endorsements in their logbook from an instructor certifying completion of training and readiness for the practical test.",
      source: "14 CFR § 61.123(c,d)",
      link: "#",
    },
    {
      text: "The applicant must hold at least a private pilot certificate before applying for a commercial certificate.",
      source: "14 CFR § 61.123(g)",
      link: "#",
    },
    {
      text: "The applicant must log at least 250 hours of flight time as a pilot, including specific PIC, solo, cross-country, and training requirements.",
      source: "14 CFR § 61.129(a)",
      link: "#",
    },
    {
      text: "A Second-Class Medical Certificate is required to exercise the privileges of a commercial pilot certificate.",
      source: "14 CFR § 61.23(a)(2)",
      link: "#",
    },
    {
      text: "The applicant must pass a knowledge test and a practical test covering areas of operation from § 61.127.",
      source: "14 CFR § 61.123(e,f)",
      link: "#",
    },
  ]

  // Sample questions
  const sampleQuestions = [
    "Walk me through everything you'd need to legally qualify for a Commercial Pilot Certificate under Part 61.",
    "Can you explain the difference between receiving training under Part 61 vs. Part 141, and how that affects certification?",
    "What are the medical certificate requirements for a commercial pilot, and how long is each class valid?",
    "Describe the aeronautical experience requirements for a commercial pilot certificate in an airplane single-engine land.",
    "What endorsements are required before you can take the commercial pilot practical test?",
    "Explain the difference between the privileges of a private pilot and a commercial pilot.",
    "What are the recency of experience requirements to carry passengers as a commercial pilot?",
    "How would you determine if you're eligible to apply for a commercial pilot certificate?",
  ]

  // Mock function to fetch element details
  const fetchElementDetails = async (elementId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock data
    return {
      id: elementId,
      code: "CPL.1.2",
      description: "Commercial Pilot Eligibility Requirements",
      details:
        "The applicant should demonstrate knowledge of the eligibility requirements for a commercial pilot certificate, including age, language, medical, and experience requirements.",
      performance_criteria: [
        "Correctly states the age requirement",
        "Explains language proficiency requirements",
        "Describes medical certificate requirements",
        "Details aeronautical experience requirements",
        "Explains knowledge and practical test requirements",
      ],
      common_errors: [
        "Confusion between Part 61 and Part 141 requirements",
        "Incomplete knowledge of required flight experience",
        "Misunderstanding of medical certificate requirements",
        "Unfamiliarity with endorsement requirements",
      ],
      references: ["14 CFR § 61.123", "14 CFR § 61.125", "14 CFR § 61.127", "14 CFR § 61.129"],
      status: "in-progress",
      notes: "",
      performance: "not-observed",
    }
  }

  // Mock function to save element evaluation
  const saveElementEvaluation = async () => {
    setSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update local state
    setElement((prev) => ({
      ...prev,
      notes,
      performance,
      status: performance === "not-observed" ? "in-progress" : performance === "satisfactory" ? "completed" : "issue",
    }))

    setSaving(false)

    // Return success
    return true
  }

  useEffect(() => {
    const loadElementDetails = async () => {
      setLoading(true)
      try {
        const data = await fetchElementDetails(elementId)
        setElement(data)
        setNotes(data.notes || "")
        setPerformance(data.performance || "not-observed")
      } catch (error) {
        console.error("Error loading element details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (elementId) {
      loadElementDetails()
    }
  }, [elementId])

  const handleSave = async () => {
    await saveElementEvaluation()
  }

  const handleAddQuickNote = () => {
    if (newQuickNote.trim()) {
      setQuickNotes([...quickNotes, newQuickNote.trim()])
      setNewQuickNote("")
      setShowQuickNoteInput(false)
    }
  }

  const handleInsertQuickNote = (note: string) => {
    setNotes((prev) => {
      if (prev.trim()) {
        return `${prev}\n\n${note}`
      }
      return note
    })
  }

  const handleRemoveQuickNote = (index: number) => {
    setQuickNotes(quickNotes.filter((_, i) => i !== index))
  }

  const getStatusBadge = () => {
    switch (element?.status) {
      case "completed":
        return (
          <Badge variant="success" className="ml-2">
            Completed
          </Badge>
        )
      case "issue":
        return (
          <Badge variant="destructive" className="ml-2">
            Issue
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="secondary" className="ml-2">
            In Progress
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="ml-2">
            Not Started
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (!element) {
    return (
      <Card className="w-full h-full flex flex-col items-center justify-center p-6">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Element Not Found</h3>
        <p className="text-sm text-muted-foreground mt-1">The requested element could not be found.</p>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
        <div>
          <div className="flex items-center">
            <CardTitle className="text-base">
              {element.code}: {element.description}
            </CardTitle>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Session ID: {sessionId}</p>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Previous Element (Alt+←)">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Next Element (Alt+→)">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full h-9 mb-2 mx-6">
          <TabsTrigger value="evaluation" className="flex-1">
            Evaluation
          </TabsTrigger>
          <TabsTrigger value="instructorNotes" className="flex-1">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Instructor Notes
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex-1">
            <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
            Questions
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="evaluation" className="p-6 space-y-4 m-0">
            <div className="space-y-4">
              {/* Performance Assessment with keyboard shortcuts */}
              <div>
                <h3 className="text-sm font-medium mb-2">Performance Assessment</h3>
                <RadioGroup
                  value={performance}
                  onValueChange={(value) => setPerformance(value as any)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="satisfactory"
                      id="satisfactory"
                      className="text-green-500 border-green-500 focus:ring-green-500"
                    />
                    <Label htmlFor="satisfactory" className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
                      Satisfactory
                      <kbd className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-muted rounded">Alt+S</kbd>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="unsatisfactory"
                      id="unsatisfactory"
                      className="text-red-500 border-red-500 focus:ring-red-500"
                    />
                    <Label htmlFor="unsatisfactory" className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-1.5" />
                      Unsatisfactory
                      <kbd className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-muted rounded">Alt+U</kbd>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="not-observed"
                      id="not-observed"
                      className="text-amber-500 border-amber-500 focus:ring-amber-500"
                    />
                    <Label htmlFor="not-observed" className="flex items-center">
                      <Clock className="h-4 w-4 text-amber-500 mr-1.5" />
                      Not Observed
                      <kbd className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-muted rounded">Alt+N</kbd>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Notes section with quick notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Notes</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => navigator.clipboard.writeText(notes)}
                      title="Copy notes to clipboard"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setNotes("")}
                      title="Clear notes"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear
                    </Button>
                  </div>
                </div>
                <Textarea
                  placeholder="Enter evaluation notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px] mb-2"
                />

                {/* Quick Notes Section */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Quick Notes</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setShowQuickNoteInput(!showQuickNoteInput)}
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />
                      Add Template
                    </Button>
                  </div>

                  {showQuickNoteInput && (
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newQuickNote}
                        onChange={(e) => setNewQuickNote(e.target.value)}
                        placeholder="Enter a new quick note template..."
                        className="text-xs h-8"
                      />
                      <Button size="sm" className="h-8" onClick={handleAddQuickNote}>
                        Add
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {quickNotes.map((note, index) => (
                      <div key={index} className="group relative">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs h-auto py-1.5 pr-8 text-left"
                          onClick={() => handleInsertQuickNote(note)}
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                          <span className="truncate">{note}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveQuickNote(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="instructorNotes" className="p-6 space-y-6 m-0">
            <div>
              <h3 className="text-sm font-medium mb-4">Regulatory References</h3>
              <div className="space-y-4">
                {instructorNotes.map((note, index) => (
                  <div key={index} className="border-l-2 border-primary/20 pl-4 py-1">
                    <p className="text-sm mb-1">{note.text}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {note.source}
                      </Badge>
                      <a
                        href={note.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center hover:underline"
                      >
                        Link <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Performance Criteria</h3>
              <ul className="list-disc pl-5 space-y-1">
                {element.performance_criteria.map((criterion, index) => (
                  <li key={index} className="text-sm">
                    {criterion}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Common Errors</h3>
              <ul className="list-disc pl-5 space-y-1">
                {element.common_errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="p-6 m-0">
            <div>
              <h3 className="text-sm font-medium mb-4">Sample Questions</h3>
              <div className="space-y-3">
                {sampleQuestions.map((question, index) => (
                  <div key={index} className="border rounded-md p-3 bg-muted/20">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{question}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <CardFooter className="border-t p-4 flex justify-between">
        <Button variant="outline" size="sm" className="gap-1">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>

        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Evaluation
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
