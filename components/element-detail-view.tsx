"use client"

import { useState, useEffect, useCallback } from "react"
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
  Edit,
  X,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useHotkeys } from "react-hotkeys-hook"
import { Input } from "@/components/ui/input"
import { 
    fetchElementDetails,
    saveElementEvaluation,
    ElementFullData,
    ElementBasic
} from "@/lib/supabase/data-fetchers"
import { debounce } from "lodash-es"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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
interface QuickNote {
  id: string
  text: string
  createdAt: number
}

type ElementEvaluationStatus = 'completed' | 'in-progress' | 'issue';

interface ElementDetailViewProps {
  elementId: string
  sessionId: string
  onSaveSuccess?: (elementId: string, status: ElementEvaluationStatus) => void;
  // Navigation props
  elementOrder?: { id: string; code: string; description: string }[];
  currentElementIndex?: number;
  onNavigateElement?: (direction: 'next' | 'prev') => void;
}

// Updated preset quick notes with color, icon, and description
const PRESET_NOTES = [
  {
    icon: "🚫",
    color: "bg-red-100 border-red-400 text-red-700",
    title: "Rote Recall Only",
    text: "Student recites memorized definitions with no evident understanding or ability to explain further. Cannot apply knowledge to scenario-based questions. Feedback: 'Let's work on building understanding beyond memorized facts.'"
  },
  {
    icon: "🟡",
    color: "bg-yellow-100 border-yellow-400 text-yellow-800",
    title: "Basic Understanding (Comprehension)",
    text: "Student explains concepts in their own words but struggles to apply them outside of a textbook context. Some confusion when faced with nuanced questions or real-world relevance. Feedback: 'You're grasping the basics — now let's work on applying it practically.'"
  },
  {
    icon: "🟢",
    color: "bg-green-100 border-green-400 text-green-800",
    title: "Practical Application",
    text: "Student applies knowledge accurately to simple real-world scenarios. Begins making safety-based decisions and connecting ACS elements to actual procedures. Feedback: 'You're applying this well. Let's build fluency with more complex examples.'"
  },
  {
    icon: "🔵",
    color: "bg-blue-100 border-blue-400 text-blue-800",
    title: "Correlation Level (Proficiency)",
    text: "Student connects multiple knowledge areas across the ACS. Demonstrates strong judgment, integrates risk management, and can teach/explain to others. Feedback: 'Excellent — you're thinking like a PIC. Keep reinforcing these connections.'"
  },
  {
    icon: "🟣",
    color: "bg-purple-100 border-purple-400 text-purple-800",
    title: "Adaptive Mastery",
    text: "Student thinks critically, anticipates errors, and explains 'why' behind procedures. Adapts knowledge to unfamiliar or unexpected scenarios with confidence. Feedback: 'You're operating at a checkride-ready level. Very few gaps in understanding.'"
  },
  {
    icon: "⚠️",
    color: "bg-orange-100 border-orange-400 text-orange-800",
    title: "Misunderstood / Incorrect Foundation",
    text: "Student appears confident but has misunderstood a key concept. Misconceptions could lead to safety risks if not corrected. Feedback: 'Let's go back and rebuild this from the core to ensure clarity.'"
  }
];

// Grouped quick notes for menu-style UI
const QUICK_NOTE_GROUPS = [
  {
    icon: "🚫",
    color: "text-red-700",
    title: "Rote Recall Only",
    notes: [
      "Recites memorized definitions with no evident understanding.",
      "Cannot apply knowledge to scenario-based questions.",
      "Let's work on building understanding beyond memorized facts."
    ]
  },
  {
    icon: "🟡",
    color: "text-yellow-800",
    title: "Basic Understanding (Comprehension)",
    notes: [
      "Explains concepts in own words but struggles to apply them.",
      "Some confusion with nuanced or real-world questions.",
      "You're grasping the basics — now let's work on applying it practically."
    ]
  },
  {
    icon: "🟢",
    color: "text-green-800",
    title: "Practical Application",
    notes: [
      "Applies knowledge accurately to simple real-world scenarios.",
      "Begins making safety-based decisions.",
      "You're applying this well. Let's build fluency with more complex examples."
    ]
  },
  {
    icon: "🔵",
    color: "text-blue-800",
    title: "Correlation Level (Proficiency)",
    notes: [
      "Connects multiple knowledge areas across the ACS.",
      "Demonstrates strong judgment and can teach/explain to others.",
      "Excellent — you're thinking like a PIC. Keep reinforcing these connections."
    ]
  },
  {
    icon: "🟣",
    color: "text-purple-800",
    title: "Adaptive Mastery",
    notes: [
      "Thinks critically, anticipates errors, and explains 'why'.",
      "Adapts knowledge to unfamiliar scenarios with confidence.",
      "You're operating at a checkride-ready level. Very few gaps in understanding."
    ]
  },
  {
    icon: "⚠️",
    color: "text-orange-800",
    title: "Misunderstood / Incorrect Foundation",
    notes: [
      "Appears confident but has misunderstood a key concept.",
      "Misconceptions could lead to safety risks if not corrected.",
      "Let's go back and rebuild this from the core to ensure clarity."
    ]
  }
];

// Utility to detect tablet/iPad
function isTablet() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 1024px) and (min-width: 600px), (device-width: 768px)').matches;
}

export function ElementDetailView({ elementId, sessionId, onSaveSuccess, elementOrder, currentElementIndex, onNavigateElement }: ElementDetailViewProps) {
  const [element, setElement] = useState<ElementFullData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [performance, setPerformance] = useState<"satisfactory" | "unsatisfactory" | "not-observed">("not-observed")
  const [activeTab, setActiveTab] = useState("evaluation")
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true); // For navigation
  const [rightPanelOpen, setRightPanelOpen] = useState(true); // For quick notes/context
  const [isTabletDevice, setIsTabletDevice] = useState(false);

  const storageKey = `quickNotes_${sessionId}_${elementId}`

  // Keyboard shortcuts for quick evaluation
  useHotkeys("alt+s", () => setPerformance("satisfactory"), [])
  useHotkeys("alt+u", () => setPerformance("unsatisfactory"), [])
  useHotkeys("alt+n", () => setPerformance("not-observed"), [])
  // Navigation hotkeys for switching elements
  useHotkeys("alt+left", () => { if (onNavigateElement) onNavigateElement('prev') }, [onNavigateElement])
  useHotkeys("alt+right", () => { if (onNavigateElement) onNavigateElement('next') }, [onNavigateElement])
  // Alt+C for GetCodi (placeholder)
  useHotkeys("alt+c", () => { /* TODO: Implement GetCodi */ alert('GetCodi shortcut triggered (to be implemented)') }, [])

  // Detect tablet on mount
  useEffect(() => {
    setIsTabletDevice(isTablet());
    const handleResize = () => setIsTabletDevice(isTablet());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Load notes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      setQuickNotes(JSON.parse(stored))
    } else {
      setQuickNotes([])
    }
  }, [storageKey])

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(quickNotes))
  }, [quickNotes, storageKey])

  // Debounced save function specifically for notes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveNotes = useCallback(
    debounce(async (newNotes: string) => {
      if (!element) return;
      setIsSaving(true);
      setSaveError(null);
      const result = await saveElementEvaluation(
        sessionId,
        elementId,
        performance, // Use the current performance state
        newNotes
      );
      setIsSaving(false);
      if (result.success) {
        console.log("Notes auto-saved successfully.");
        // Update local state - ensure performance_status is correctly maintained
        setElement(prev => prev ? ({ 
            ...prev, 
            performanceData: { 
                // Spread existing data BUT ensure required fields are present
                ...(prev.performanceData || {}),
                performance_status: performance, // Use current performance state 
                comment: newNotes
            }
        }) : null);
        // Determine status and call callback
        const newStatus = determineStatus(performance); // Use the current performance
        if (onSaveSuccess) {
            onSaveSuccess(elementId, newStatus);
        }
      } else {
        const actualError = result.error;
        console.error("Failed to auto-save notes evaluation:", actualError);
        // Log detailed error
        if (actualError && actualError.message) console.error("Supabase Error Message:", actualError.message);
        if (actualError && actualError.details) console.error("Supabase Error Details:", actualError.details);
        if (actualError && actualError.hint) console.error("Supabase Error Hint:", actualError.hint);
        if (actualError && actualError.code) console.error("Supabase Error Code:", actualError.code);
        setSaveError("Failed to save notes. Check console."); 
      }
    }, 1000), // Debounce time: 1 second
    [element, sessionId, elementId, performance, onSaveSuccess] // Include dependencies
  );

  // Effect to auto-save when performance changes
  useEffect(() => {
    // Don't save on initial load when element is null or performance hasn't changed from initial fetch
    if (!element || !element.performanceData || performance === element.performanceData.performance_status) {
        return;
    }
    
    const savePerformanceChange = async () => {
        setIsSaving(true);
        setSaveError(null);
        console.log(`Auto-saving performance change to: ${performance}`);
        const result = await saveElementEvaluation(
            sessionId,
            elementId,
            performance,
            notes // Use current notes state
        );
        setIsSaving(false);
        if (result.success) {
            console.log("Performance auto-saved successfully.");
            // Update local element state
            setElement(prev => prev ? ({ 
                ...prev, 
                performanceData: { 
                    ...(prev.performanceData || {}), 
                    performance_status: performance,
                    comment: notes // Ensure comment is also updated if changed simultaneously
                }
            }) : null);
            // Determine status and call callback
            const newStatus = determineStatus(performance);
             if (onSaveSuccess) {
                onSaveSuccess(elementId, newStatus);
             }
        } else {
            const actualError = result.error;
            console.error("Failed to auto-save performance evaluation:", actualError);
             // Log detailed error
            if (actualError && actualError.message) console.error("Supabase Error Message:", actualError.message);
            if (actualError && actualError.details) console.error("Supabase Error Details:", actualError.details);
            if (actualError && actualError.hint) console.error("Supabase Error Hint:", actualError.hint);
            if (actualError && actualError.code) console.error("Supabase Error Code:", actualError.code);
            setSaveError("Failed to save performance. Check console."); 
        }
    };

    savePerformanceChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performance]); // Trigger only when performance changes

  // Effect to trigger debounced save when notes change
  useEffect(() => {
    // Don't save on initial load or if notes haven't changed
    if (!element || !element.performanceData || notes === element.performanceData.comment) {
        return;
    }
    console.log("Notes changed, debouncing save...");
    debouncedSaveNotes(notes);

    // Cleanup function to cancel debounce if component unmounts or notes change again quickly
    return () => {
      debouncedSaveNotes.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]); // Trigger only when notes change

  // Helper to determine status based on performance
  const determineStatus = (perf: 'satisfactory' | 'unsatisfactory' | 'not-observed'): ElementEvaluationStatus => {
      switch (perf) {
          case 'satisfactory': return 'completed';
          case 'unsatisfactory': return 'issue';
          case 'not-observed': return 'in-progress';
          default: return 'in-progress';
      }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return
    setQuickNotes([
      ...quickNotes,
      { id: crypto.randomUUID(), text: newNote.trim(), createdAt: Date.now() }
    ])
    setNewNote("")
  }

  const handleDeleteNote = (id: string) => {
    setQuickNotes(quickNotes.filter(n => n.id !== id))
  }

  const handleEditNote = (id: string, text: string) => {
    setEditingId(id)
    setEditingText(text)
  }

  const handleSaveEdit = () => {
    setQuickNotes(quickNotes.map(n => n.id === editingId ? { ...n, text: editingText } : n))
    setEditingId(null)
    setEditingText("")
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
        <div className="flex items-center justify-center h-full min-h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    );
  }

  if (!element) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6 bg-card border rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-muted-foreground">Element Not Found</h3>
            <p className="text-sm text-muted-foreground mt-1">The details for this element could not be loaded.</p>
        </div>
    );
  }

  // Main Render Logic using fetched `element` state
  return (
    <Card className="h-full min-h-0 flex-1 flex flex-col overflow-hidden shadow-md relative">
      {/* Collapsible Left Panel (Navigation) for Tablet */}
      {isTabletDevice && (
        <button
          className="absolute left-0 top-1/2 z-40 bg-muted rounded-r-full p-2 shadow-md"
          style={{ transform: 'translateY(-50%)' }}
          onClick={() => setLeftPanelOpen((v) => !v)}
        >
          {leftPanelOpen ? <span>&#x25C0;</span> : <span>&#x25B6;</span>}
        </button>
      )}
      {/* Collapsible Right Panel (Quick Notes/Context) for Tablet */}
      {isTabletDevice && (
        <button
          className="absolute right-0 top-1/2 z-40 bg-muted rounded-l-full p-2 shadow-md"
          style={{ transform: 'translateY(-50%)' }}
          onClick={() => setRightPanelOpen((v) => !v)}
        >
          {rightPanelOpen ? <span>&#x25B6;</span> : <span>&#x25C0;</span>}
        </button>
      )}
      {/* Header */}
      <CardHeader className="border-b p-4 flex-shrink-0 sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <h2 className="text-base md:text-lg font-semibold leading-none tracking-tight flex flex-wrap items-center w-full break-words whitespace-normal">
              {element.code}
              {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
              {!isSaving && getStatusBadge()}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1 w-full break-words whitespace-normal">{element.description}</p>
          </div>
          {/* Sidebar toggle for mobile/tablet */}
          <div className="block md:hidden ml-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" onClick={() => setSidebarOpen(true)} aria-label="Open Quick Notes">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-11/12 max-w-xs p-0">
                <aside className="h-full flex flex-col bg-muted/30 overflow-hidden p-4 space-y-4 min-h-0 max-h-full">
                  <h3 className="text-sm font-semibold mb-2">Quick Notes</h3>
                  <div className="flex-1 min-h-0 max-h-[70vh] overflow-y-auto pr-1">
                    {QUICK_NOTE_GROUPS.map((group, idx) => (
                      <div key={idx} className="mb-3">
                        <div className={`sticky top-0 z-20 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-1 bg-white dark:bg-muted/30 py-1 ${group.color} shadow-sm`}>
                          <span className="text-lg select-none">{group.icon}</span>
                          <span>{group.title}</span>
                        </div>
                        <ul className="space-y-1 ml-6">
                          {group.notes.map((note, nidx) => (
                            <li key={nidx}>
                              <button
                                className="w-full text-left text-xs rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground transition"
                                onClick={() => {
                                  setNotes(n => n ? n + (n.endsWith('\n') ? '' : '\n') + group.icon + ' ' + note + '\n' : group.icon + ' ' + note + '\n');
                                  setSidebarOpen(false);
                                }}
                              >
                                {group.icon} {note}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <ScrollArea className="flex-1 min-h-0 -mr-4 pr-3 max-h-full">
                    <div className="space-y-2">
                      {quickNotes.map((note, index) => (
                        <Card key={index} className="relative group bg-card text-xs shadow-sm">
                          <CardContent className="p-2 flex justify-between items-center">
                            <p className="flex-1 mr-2 break-words">{note.text}</p>
                            <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditNote(note.id, note.text)} title="Edit Note">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteNote(note.id)} title="Remove Quick Note">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                  <div>
                    {editingId ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Enter new quick note..."
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="text-xs min-h-[60px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={handleSaveEdit}>Save</Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </aside>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {saveError && (
          <p className="text-xs text-red-600 mt-2 flex items-center">
            <AlertCircle className="mr-1 h-3 w-3" /> {saveError}
          </p>
        )}
      </CardHeader>
      {/* Main Scrollable Content (Tabs, etc.) */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Main Content (conditionally full width on tablet if panels are closed) */}
        <div className={`flex-1 min-h-0 flex flex-col border-r overflow-y-auto ${isTabletDevice && (!leftPanelOpen || !rightPanelOpen) ? 'w-full' : ''}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
            <div className="px-2 md:px-4 pt-2 md:pt-3 border-b flex-shrink-0">
              <TabsList className="grid w-full grid-cols-3 h-9">
                <TabsTrigger value="evaluation" className="text-xs h-8"> <Clipboard className="mr-1.5 h-4 w-4" /> Evaluation </TabsTrigger>
                <TabsTrigger value="notes" className="text-xs h-8"> <BookOpen className="mr-1.5 h-4 w-4" /> Instructor Notes </TabsTrigger>
                <TabsTrigger value="questions" className="text-xs h-8"> <HelpCircle className="mr-1.5 h-4 w-4" /> Questions </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="evaluation" className="flex-1 min-h-0 overflow-y-auto px-2 md:px-4 pb-24 md:pb-20 pt-3 md:pt-4">
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
                   onValueChange={(value) => setPerformance(value as 'satisfactory' | 'unsatisfactory' | 'not-observed')}
                   className="mt-2 grid grid-cols-3 gap-4"
                   disabled={isSaving}
                 >
                   <div>
                    <RadioGroupItem value="satisfactory" id="perf-sat" className="peer sr-only" disabled={isSaving}/>
                    <Label htmlFor="perf-sat" className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600 ${isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                       <CheckCircle2 className="mb-2 h-5 w-5 text-green-600" />
                       <span className="text-xs font-medium">Satisfactory</span>
                       <span className="text-[10px] text-muted-foreground">(Alt+S)</span>
                    </Label>
                   </div>
                   <div>
                    <RadioGroupItem value="unsatisfactory" id="perf-unsat" className="peer sr-only" disabled={isSaving}/>
                    <Label htmlFor="perf-unsat" className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-600 [&:has([data-state=checked])]:border-red-600 ${isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                      <XCircle className="mb-2 h-5 w-5 text-red-600" />
                      <span className="text-xs font-medium">Unsatisfactory</span>
                      <span className="text-[10px] text-muted-foreground">(Alt+U)</span>
                    </Label>
                   </div>
                   <div>
                    <RadioGroupItem value="not-observed" id="perf-notobs" className="peer sr-only" disabled={isSaving}/>
                    <Label htmlFor="perf-notobs" className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary ${isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
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
                    placeholder="Enter evaluation notes here... (auto-saves)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 min-h-[150px] text-sm"
                    disabled={isSaving}
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
            <TabsContent value="notes" className="flex-1 min-h-0 overflow-y-auto px-2 md:px-4 pb-24 md:pb-20 pt-3 md:pt-4 text-sm max-h-[40vh]">
              {/* Instructor Notes Tab Content */}
              {element.instructorNotes && element.instructorNotes.length > 0 ? (
                <ul className="space-y-3">
                  {element.instructorNotes.map((note, idx) => (
                    <li key={note.id} className="bg-muted rounded p-2 border text-xs">
                      <div className="font-medium mb-1">{note.note_text}</div>
                      <div className="text-[11px] text-muted-foreground flex flex-wrap gap-2">
                        {note.source_title && (
                          <span>Source: {note.source_title}</span>
                        )}
                        {note.page_reference && (
                          <span>Page: {note.page_reference}</span>
                        )}
                        {note.source_url && (
                          <a href={note.source_url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 flex items-center gap-1"><ExternalLink className="h-3 w-3 inline" />Link</a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-muted-foreground">No instructor notes for this element.</div>
              )}
            </TabsContent>
            <TabsContent value="questions" className="flex-1 min-h-0 overflow-y-auto px-2 md:px-4 pb-24 md:pb-20 pt-3 md:pt-4 text-sm max-h-[40vh]">
              {/* Questions Tab Content */}
              {element.sampleQuestions && element.sampleQuestions.length > 0 ? (
                <ul className="space-y-3">
                  {element.sampleQuestions.map((q, idx) => (
                    <li key={q.id} className="bg-muted rounded p-2 border text-xs">
                      {q.question_text}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-muted-foreground">No sample questions for this element.</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        {/* Right Side: Quick Notes Panel (hidden/collapsible on tablet, visible on md+) */}
        {(!isTabletDevice || rightPanelOpen) && (
          <aside className="hidden md:flex w-72 flex-shrink-0 flex-col border-l bg-muted/30 overflow-hidden p-4 space-y-4 min-h-0 max-h-full">
            <h3 className="text-sm font-semibold mb-2">Quick Notes</h3>
            <div className="flex-1 min-h-0 max-h-[70vh] overflow-y-auto pr-1">
              {QUICK_NOTE_GROUPS.map((group, idx) => (
                <div key={idx} className="mb-3">
                  <div className={`sticky top-0 z-20 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-1 bg-white dark:bg-muted/30 py-1 ${group.color} shadow-sm`}>
                    <span className="text-lg select-none">{group.icon}</span>
                    <span>{group.title}</span>
                  </div>
                  <ul className="space-y-1 ml-6">
                    {group.notes.map((note, nidx) => (
                      <li key={nidx}>
                        <button
                          className="w-full text-left text-xs rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground transition"
                          onClick={() => {
                            setNotes(n => n ? n + (n.endsWith('\n') ? '' : '\n') + group.icon + ' ' + note + '\n' : group.icon + ' ' + note + '\n');
                          }}
                        >
                          {group.icon} {note}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <ScrollArea className="flex-1 min-h-0 -mr-4 pr-3 max-h-full">
              <div className="space-y-2">
                {quickNotes.map((note, index) => (
                  <Card key={index} className="relative group bg-card text-xs shadow-sm">
                    <CardContent className="p-2 flex justify-between items-center">
                      <p className="flex-1 mr-2 break-words">{note.text}</p>
                      <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditNote(note.id, note.text)} title="Edit Note">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteNote(note.id)} title="Remove Quick Note">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            <div>
              {editingId ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter new quick note..."
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="text-xs min-h-[60px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={handleSaveEdit}>Save</Button>
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        )}
      </div>
      {/* Sticky Bottom Navigation always inside the Card, never outside */}
      {elementOrder && typeof currentElementIndex === 'number' && onNavigateElement && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-muted border-t px-2 md:px-4 py-2 md:py-3 gap-2 flex items-center justify-between shadow-md"
          style={{ minHeight: '56px', maxHeight: '72px' }}>
          {/* Previous Element Preview */}
          <div className="flex-1 flex items-center min-w-0">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => onNavigateElement('prev')}
              disabled={currentElementIndex <= 0}
              aria-label="Previous Element"
              className="flex items-center gap-2 px-2 md:px-3 py-2"
            >
              <ArrowLeft className="h-7 w-7" />
              {currentElementIndex > 0 && (
                <span className="ml-2 truncate text-left">
                  <span className="block font-semibold text-xs md:text-sm text-muted-foreground">{elementOrder[currentElementIndex - 1].code}</span>
                  <span className="block text-[10px] md:text-xs text-muted-foreground truncate max-w-[80px] md:max-w-[120px]">{elementOrder[currentElementIndex - 1].description}</span>
                </span>
              )}
            </Button>
          </div>
          {/* Center: Current Index */}
          <div className="flex-shrink-0 px-1 md:px-2">
            <span className="inline-block rounded-full bg-background border px-2 md:px-4 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              {currentElementIndex + 1} <span className="opacity-60">of</span> {elementOrder.length}
            </span>
          </div>
          {/* Next Element Preview */}
          <div className="flex-1 flex items-center justify-end min-w-0">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => onNavigateElement('next')}
              disabled={currentElementIndex >= elementOrder.length - 1}
              aria-label="Next Element"
              className="flex flex-row-reverse items-center gap-2 px-2 md:px-3 py-2"
            >
              <ArrowRight className="h-7 w-7" />
              {currentElementIndex < elementOrder.length - 1 && (
                <span className="mr-2 truncate text-right">
                  <span className="block font-semibold text-xs md:text-sm text-muted-foreground">{elementOrder[currentElementIndex + 1].code}</span>
                  <span className="block text-[10px] md:text-xs text-muted-foreground truncate max-w-[80px] md:max-w-[120px]">{elementOrder[currentElementIndex + 1].description}</span>
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default ElementDetailView
