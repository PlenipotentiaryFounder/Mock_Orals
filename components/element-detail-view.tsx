"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
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
import { 
    fetchElementDetails,
    saveElementEvaluation,
    ElementFullData
} from "@/lib/supabase/data-fetchers"

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
  const [element, setElement] = useState<ElementFullData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
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
  // Navigation hotkeys need implementation context (e.g., parent component callback)
  // useHotkeys("alt+left", () => console.log("Navigate to previous element"))
  // useHotkeys("alt+right", () => console.log("Navigate to next element"))

  useEffect(() => {
    const loadElementDetails = async () => {
      if (!elementId || !sessionId) return; // Ensure IDs are present
      setLoading(true);
      setSaveError(null); // Clear previous errors on load
      try {
        // Use the REAL fetcher function
        const data = await fetchElementDetails(elementId, sessionId);
        setElement(data);
        if (data) {
            // Set initial state from fetched data, using defaults if necessary
            setNotes(data.performanceData?.comment || "");
            setPerformance(data.performanceData?.performance_status || "not-observed");
        } else {
            // Handle case where element details couldn't be fetched
            setElement(null);
            setNotes("");
            setPerformance("not-observed");
            console.error("Element data not found or failed to load.");
            // Maybe set an error state to show to the user
        }
      } catch (error) {
        console.error("Error loading element details:", error);
        setElement(null); // Clear potentially stale data on error
      } finally {
        setLoading(false);
      }
    };

    loadElementDetails();
  }, [elementId, sessionId]); // Re-run effect if elementId or sessionId changes

  const handleSave = async () => {
    if (!element) return; // Don't save if element data isn't loaded
    setSaving(true);
    setSaveError(null); // Clear previous save error

    // Use the REAL saver function
    const result = await saveElementEvaluation(
        sessionId,
        elementId,
        performance,
        notes
    );

    setSaving(false);

    if (result.success) {
        console.log("Evaluation saved successfully.");
        // Optionally, update the local element state if the save function doesn't return the updated record
        // Or re-fetch, although that might be too slow
        setElement(prev => prev ? ({ 
            ...prev, 
            performanceData: { 
                ...(prev.performanceData || {}), // Keep potential other fields
                performance_status: performance, 
                comment: notes 
            }
        }) : null);
    } else {
        console.error("Failed to save evaluation:", result.error);
        setSaveError("Failed to save evaluation. Please try again.");
    }
  };

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
    const currentPerformance = performance;

    switch (currentPerformance) {
      case "satisfactory":
        return <Badge variant="default" className="ml-2">Satisfactory</Badge>; 
      case "unsatisfactory":
        return <Badge variant="destructive" className="ml-2">Unsatisfactory</Badge>;
      case "not-observed":
        return <Badge variant="outline" className="ml-2">Not Observed</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    );
  }

  if (!element) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-card border rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-muted-foreground">Element Not Found</h3>
            <p className="text-sm text-muted-foreground mt-1">The details for this element could not be loaded.</p>
        </div>
    );
  }

  // Main Render Logic using fetched `element` state
  return (
    <Card className="h-full flex flex-col overflow-hidden shadow-md">
      {/* Header */} 
      <CardHeader className="border-b p-4">
        <div className="flex justify-between items-start">
          <div>
             {/* Use data from element state */}
            <h2 className="text-base font-semibold leading-none tracking-tight flex items-center">
                {element.code}
                {getStatusBadge()} 
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{element.description}</p>
          </div>
           {/* Save Button */}
           <Button 
             onClick={handleSave} 
             disabled={saving || loading}
             size="sm"
             className="ml-4 flex-shrink-0"
           >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
         {/* Show save error message */}
         {saveError && (
            <p className="text-xs text-red-600 mt-2">{saveError}</p>
         )}
      </CardHeader>

      {/* Content */} 
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Tabs (Evaluation, Instructor Notes, Questions) */}
        <div className="flex-1 flex flex-col border-r overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
             {/* Tab Triggers */}
             <div className="px-4 pt-3 border-b">
               <TabsList className="grid w-full grid-cols-3 h-9">
                 <TabsTrigger value="evaluation" className="text-xs h-8">
                   <Clipboard className="mr-1.5 h-4 w-4" /> Evaluation
                 </TabsTrigger>
                 <TabsTrigger value="notes" className="text-xs h-8">
                    <BookOpen className="mr-1.5 h-4 w-4" /> Instructor Notes
                 </TabsTrigger>
                 <TabsTrigger value="questions" className="text-xs h-8">
                    <HelpCircle className="mr-1.5 h-4 w-4" /> Questions
                 </TabsTrigger>
               </TabsList>
             </div>

            <ScrollArea className="flex-1">
              {/* Evaluation Tab Content */}
              <TabsContent value="evaluation" className="p-4 space-y-4 m-0">
                  {/* Performance Criteria - Use data from element state */}
                  {element.performance_criteria && element.performance_criteria.length > 0 && (
                    <div>
                      <Label className="text-xs font-medium">Performance Criteria</Label>
                      <ul className="mt-1 list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {element.performance_criteria.map((criterion: string, index: number) => (
                          <li key={index}>{criterion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Performance Assessment Radio Group */}
                  <div>
                     <Label className="text-sm font-medium">Performance Assessment</Label>
                     <RadioGroup 
                       value={performance}
                       onValueChange={(value) => setPerformance(value as any)}
                       className="mt-2 grid grid-cols-3 gap-4"
                     >
                       {/* ... Radio items for Satisfactory, Unsatisfactory, Not Observed ... */}
                       {/* ... (Example for Satisfactory) ... */}
                       <div>
                        <RadioGroupItem value="satisfactory" id="perf-sat" className="peer sr-only" />
                        <Label htmlFor="perf-sat" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600 cursor-pointer">
                           <CheckCircle2 className="mb-2 h-5 w-5 text-green-600" />
                           <span className="text-xs font-medium">Satisfactory</span>
                           <span className="text-[10px] text-muted-foreground">(Alt+S)</span>
                        </Label>
                       </div>
                       {/* ... (Similar for Unsatisfactory with XCircle/Red) ... */}
                       <div>
                        <RadioGroupItem value="unsatisfactory" id="perf-unsat" className="peer sr-only" />
                        <Label htmlFor="perf-unsat" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-600 [&:has([data-state=checked])]:border-red-600 cursor-pointer">
                          <XCircle className="mb-2 h-5 w-5 text-red-600" />
                          <span className="text-xs font-medium">Unsatisfactory</span>
                          <span className="text-[10px] text-muted-foreground">(Alt+U)</span>
                        </Label>
                       </div>
                       {/* ... (Similar for Not Observed with Clock/Muted) ... */}
                       <div>
                        <RadioGroupItem value="not-observed" id="perf-notobs" className="peer sr-only" />
                        <Label htmlFor="perf-notobs" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                          <Clock className="mb-2 h-5 w-5 text-muted-foreground" />
                          <span className="text-xs font-medium">Not Observed</span>
                          <span className="text-[10px] text-muted-foreground">(Alt+N)</span>
                        </Label>
                       </div>
                     </RadioGroup>
                  </div>

                  {/* Notes Textarea */}
                  <div>
                     <Label htmlFor="notes" className="text-sm font-medium">Evaluation Notes</Label>
                     <Textarea 
                        id="notes"
                        placeholder="Enter evaluation notes here..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 min-h-[150px] text-sm"
                     />
                  </div>

                  {/* Common Errors - Use data from element state */}
                  {element.common_errors && element.common_errors.length > 0 && (
                    <div>
                      <Label className="text-xs font-medium">Common Errors / Points of Failure</Label>
                      <ul className="mt-1 list-disc list-inside space-y-1 text-sm text-muted-foreground">
                         {element.common_errors.map((error: string, index: number) => (
                           <li key={index}>{error}</li>
                         ))}
                       </ul>
                    </div>
                  )}
                  
                  {/* References - Use data from element state */}
                  {element.references && element.references.length > 0 && (
                    <div>
                        <Label className="text-xs font-medium">References</Label>
                        <div className="mt-1 space-x-1">
                            {element.references.map((ref: string, index: number) => (
                                <Badge key={index} variant="secondary">{ref}</Badge>
                            ))}
                        </div>
                    </div>
                  )}

              </TabsContent>

              {/* Instructor Notes Tab Content - Use data from element state */}
              <TabsContent value="notes" className="p-4 m-0">
                 <h3 className="text-sm font-semibold mb-3">Instructor Notes & References</h3>
                 {element.instructorNotes && element.instructorNotes.length > 0 ? (
                    <div className="space-y-3">
                        {element.instructorNotes.map((note) => (
                           <Card key={note.id} className="bg-muted/50">
                               <CardContent className="p-3 text-sm">
                                   <p>{note.note_text}</p>
                                   {(note.source_title || note.source_url) && (
                                       <div className="mt-2 text-xs text-muted-foreground flex items-center">
                                           <span>Source:</span>
                                           {note.source_url ? (
                                               <a href={note.source_url} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline flex items-center">
                                                   {note.source_title || note.source_url}
                                                   <ExternalLink className="ml-1 h-3 w-3" />
                                               </a>
                                           ) : (
                                               <span className="ml-1">{note.source_title}</span>
                                           )}
                                           {note.page_reference && <span className="ml-2">(Page: {note.page_reference})</span>}
                                       </div>
                                   )}
                               </CardContent>
                           </Card>
                        ))}
                    </div>
                 ) : (
                    <p className="text-sm text-muted-foreground">No instructor notes available for this element.</p>
                 )}
              </TabsContent>

              {/* Questions Tab Content - Use data from element state */}
               <TabsContent value="questions" className="p-4 m-0">
                  <h3 className="text-sm font-semibold mb-3">Sample Questions</h3>
                  {element.sampleQuestions && element.sampleQuestions.length > 0 ? (
                    <ul className="space-y-2 list-decimal list-inside">
                        {element.sampleQuestions.map((q) => (
                           <li key={q.id} className="text-sm text-muted-foreground">{q.question_text}</li>
                        ))}
                    </ul>
                  ) : (
                     <p className="text-sm text-muted-foreground">No sample questions available for this element.</p>
                  )}
               </TabsContent>

            </ScrollArea>
          </Tabs>
        </div>

        {/* Right Side: Quick Notes Panel */}
        <aside className="w-64 flex-shrink-0 flex flex-col border-l bg-muted/30 overflow-hidden p-4 space-y-4">
           <h3 className="text-sm font-semibold">Quick Notes</h3>
           <ScrollArea className="flex-1 -mr-4 pr-3">
              <div className="space-y-2">
                {quickNotes.map((note, index) => (
                   <Card key={index} className="relative group bg-card text-xs shadow-sm">
                      <CardContent className="p-2 flex justify-between items-center">
                         <p className="flex-1 mr-2 break-words">{note}</p>
                         <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleInsertQuickNote(note)} title="Insert Note">
                               <MessageSquare className="h-3.5 w-3.5" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveQuickNote(index)} title="Remove Quick Note">
                                <Trash2 className="h-3.5 w-3.5" />
                             </Button>
                         </div>
                      </CardContent>
                   </Card>
                ))}
              </div>
           </ScrollArea>
           {/* Add new quick note section */} 
           <div>
                {showQuickNoteInput ? (
                    <div className="space-y-2">
                        <Textarea 
                           placeholder="Enter new quick note..."
                           value={newQuickNote}
                           onChange={(e) => setNewQuickNote(e.target.value)}
                           className="text-xs min-h-[60px]"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowQuickNoteInput(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleAddQuickNote} disabled={!newQuickNote.trim()}>Add</Button>
                        </div>
                    </div>
                ) : (
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowQuickNoteInput(true)}>
                       <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add New Quick Note
                    </Button>
                )}
           </div>
        </aside>
      </div>
      
      {/* Removed CardFooter */}
    </Card>
  )
}
