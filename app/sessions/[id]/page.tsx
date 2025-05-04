"use client"

import { useEffect, useState, Suspense, useMemo } from "react"
import { useParams } from "next/navigation"
import { 
  getSessionWithDetails, 
  getFullHierarchy, // Import new fetcher
  getSessionNotes, // Import notes fetcher
  updateSessionNotes, // Import update function
  fetchSessionDeficiencies, // Use new fetcher for deficiencies
  SessionData, // Import types
  TemplateData, 
  ScenarioData, 
  AreaWithTasksAndElements,
  StudentData // Import StudentData type
} from "@/lib/supabase/data-fetchers"
import { Loader2 } from "lucide-react"
import { Menu, X, PanelLeft, PanelRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query" // Import the hook

// Import the new layout and panel components
import { CommandCenterLayout } from "@/components/command-center/layout";
import { NavigationPanel } from "@/components/navigation-panel";
import { ContextPanel } from "@/components/context-panel";
import { StatusPanel } from "@/components/status-panel";
import { CommandBar } from "@/components/command-bar";
import { ElementDetailView } from "@/components/element-detail-view"; // Use the new detail view

// Keep the placeholder for when no element is selected
function SelectElementPlaceholder() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-card border rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-muted-foreground">Select an Element</h3>
            <p className="text-sm text-muted-foreground mt-1">Choose an element from the sidebar to view details and record performance.</p>
        </div>
    );
}

// Main Page Component Content - Refactored for new layout
function SessionPageContent() {
    const params = useParams();
    const sessionId = params.id as string;
    
    // State for fetched data
    const [session, setSession] = useState<SessionData | null>(null);
    const [template, setTemplate] = useState<TemplateData | null>(null);
    const [scenario, setScenario] = useState<ScenarioData | null>(null);
    const [student, setStudent] = useState<StudentData | null>(null); // Add student state
    const [hierarchy, setHierarchy] = useState<AreaWithTasksAndElements[]>([]);
    const [sessionNotes, setSessionNotes] = useState<string>("");
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [deficiencyElements, setDeficiencyElements] = useState<any[]>([]);
    const [loadingDeficiencies, setLoadingDeficiencies] = useState(true);
    
    // State for UI interactions
    const [loadingInitialData, setLoadingInitialData] = useState(true);
    const [loadingHierarchy, setLoadingHierarchy] = useState(true); // Separate loading for hierarchy
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [progressValue, setProgressValue] = useState(0); // Keep placeholder progress state
    const [error, setError] = useState<string | null>(null); // State for error messages
    const [view, setView] = useState<"standard" | "focus" | "timeline">("standard");
    const [isNavOpen, setIsNavOpen] = useState(false); // Closed by default on mobile
    const [isContextOpen, setIsContextOpen] = useState(false); // Closed by default on mobile

    // Add media query hook for responsive logic
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    // Progress calculation from hierarchy
    const progressMetrics = useMemo(() => {
        let completed = 0;
        let total = 0;
        let issues = 0;
        hierarchy.forEach(area => {
            area.tasks.forEach(task => {
                task.elements.forEach(el => {
                    total++;
                    if (el.status === "completed") completed++;
                    if (el.status === "issue") issues++;
                });
            });
        });
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, issues, percentage };
    }, [hierarchy]);

    // Compute flat, ordered array of element objects for navigation
    const elementOrder = useMemo(() => {
        const elements: { id: string; code: string; description: string }[] = [];
        hierarchy.forEach(area => {
            area.tasks.forEach(task => {
                task.elements.forEach(el => {
                    elements.push({ id: el.id, code: el.code, description: el.description });
                });
            });
        });
        return elements;
    }, [hierarchy]);

    // Find the current element index
    const currentElementIndex = useMemo(() => {
        if (!selectedElementId) return -1;
        return elementOrder.findIndex(el => el.id === selectedElementId);
    }, [elementOrder, selectedElementId]);

    // Navigation callback
    const onNavigateElement = (direction: 'next' | 'prev') => {
        if (currentElementIndex === -1) return;
        let newIndex = direction === 'next' ? currentElementIndex + 1 : currentElementIndex - 1;
        if (newIndex < 0 || newIndex >= elementOrder.length) return;
        setSelectedElementId(elementOrder[newIndex].id);
    };

    // Fetch Session, Template, Scenario, Student details
    useEffect(() => {
        if (!sessionId) return;
        setLoadingInitialData(true);
        setError(null);
        getSessionWithDetails(sessionId)
            .then(data => {
                if (data) {
                    setSession(data.session);
                    setTemplate(data.template);
                    setScenario(data.scenario);
                    setStudent(data.student); // Set student state
                     // TODO: Fetch initial progress data if needed
                     // const progress = await calculateSessionProgress(sessionId);
                     // setProgressValue(progress);
                } else {
                    console.error("Session data not found for ID:", sessionId);
                    setError("Session data not found.");
                    setSession(null);
                    setTemplate(null);
                    setScenario(null);
                    setStudent(null); // Reset student state on error
                }
            })
            .catch(err => {
                console.error("Error fetching session details:", err);
                setError("Failed to load session details.");
                setSession(null);
                setTemplate(null);
                setScenario(null);
                setStudent(null); // Reset student state on error
            })
            .finally(() => {
                setLoadingInitialData(false);
            });
    }, [sessionId]);

    // Fetch Hierarchy once template and session IDs are available
    useEffect(() => {
        if (!template?.id || !sessionId) return;
        setLoadingHierarchy(true);
        setError(null);
        getFullHierarchy(template.id, sessionId)
            .then(data => {
                setHierarchy(data);
            })
            .catch(err => {
                console.error("Error fetching hierarchy:", err);
                setError("Failed to load evaluation hierarchy.");
                setHierarchy([]); // Set to empty on error
            })
            .finally(() => {
                setLoadingHierarchy(false);
            });
    }, [template?.id, sessionId]); // Depend on template ID and sessionId

    // Fetch session notes
    useEffect(() => {
        if (!sessionId) return;
        setLoadingNotes(true);
        getSessionNotes(sessionId)
            .then(notes => setSessionNotes(notes || ""))
            .finally(() => setLoadingNotes(false));
    }, [sessionId]);

    // Fetch deficiency elements
    useEffect(() => {
        if (!sessionId) return;
        setLoadingDeficiencies(true);
        fetchSessionDeficiencies(sessionId)
            .then(defs => setDeficiencyElements(defs))
            .finally(() => setLoadingDeficiencies(false));
    }, [sessionId]);

    // Save handler for notes
    const handleSaveSessionNotes = async (notes: string) => {
        const success = await updateSessionNotes(sessionId, notes);
        if (success) setSessionNotes(notes);
        // Optionally show a toast or error
    };

    // Handler passed to the NavigationPanel
    const handleElementSelect = (elementId: string) => {
        setSelectedElementId(elementId);
    };

    // Callback for when an element is saved successfully in ElementDetailView
    const handleElementSaveSuccess = (
        elementId: string, 
        newStatus: 'completed' | 'in-progress' | 'issue'
    ) => {
        setHierarchy(currentHierarchy => {
            // Create a deep copy to avoid mutating the original state directly
            const newHierarchy = JSON.parse(JSON.stringify(currentHierarchy));
            
            // Find and update the element status
            for (const area of newHierarchy) {
                for (const task of area.tasks) {
                    // Explicitly type 'el' here based on the structure in hierarchy
                    const elementIndex = task.elements.findIndex((el: { id: string; status: string }) => el.id === elementId);
                    if (elementIndex !== -1) {
                        task.elements[elementIndex].status = newStatus;
                        // No need to break here if element IDs are unique across tasks, 
                        // but assuming they are, we can optimize by returning early.
                        // However, the deep copy approach requires returning the whole new hierarchy.
                    }
                }
            }
            return newHierarchy; // Return the updated hierarchy
        });
    };

    // Find the selected element's data (needs full hierarchy and selected ID)
    const selectedElementData = useMemo(() => {
        if (!selectedElementId || !hierarchy) return null;
        for (const area of hierarchy) {
            for (const task of area.tasks) {
                const foundElement = task.elements.find(el => el.id === selectedElementId);
                if (foundElement) {
                    // Find the parent task and area for context if needed
                    const parentTask = task;
                    const parentArea = area;
                    // You might need to fetch more details here if ElementBasic isn't enough
                    // For now, return the basic data found + potentially parent info
                    return { ...foundElement, parentTask, parentArea }; 
                }
            }
        }
        return null;
    }, [selectedElementId, hierarchy]);
    
    if (loadingInitialData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading Session...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen text-red-600">
                <p>{error}</p>
                {/* Optionally add a retry button */}
            </div>
        );
    }

    if (!session) {
         return (
            <div className="flex items-center justify-center h-screen">
                <p>Session not found or failed to load.</p>
            </div>
        );
    }
    
    return (
        <CommandCenterLayout
            commandBar={(
                <CommandBar
                    session={session}
                    template={template}
                    currentView={view}
                    onViewChange={setView}
                />
            )}
            leftPanel={(
                <>
                    {/* Mobile Nav Trigger & Sheet */}
                    <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
                        <SheetTrigger asChild className="lg:hidden fixed top-4 left-4 z-[60]">
                           <Button variant="outline" size="icon">
                                <PanelLeft className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 sm:w-80">
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle>Navigation</SheetTitle>
                                <SheetDescription className="sr-only">Navigate session elements</SheetDescription>
                            </SheetHeader>
                            <NavigationPanel
                                hierarchy={hierarchy}
                                onElementSelect={(id) => {
                                    handleElementSelect(id);
                                    setIsNavOpen(false);
                                }}
                                initialSelectedElementId={selectedElementId}
                                isLoading={loadingHierarchy}
                            />
                        </SheetContent>
                    </Sheet>

                    {/* Desktop Nav (always visible) - Add fixed width */}
                    <div className="hidden lg:block h-full w-80 flex-shrink-0 border-r bg-background">
                         <NavigationPanel
                            hierarchy={hierarchy}
                            onElementSelect={handleElementSelect}
                            initialSelectedElementId={selectedElementId}
                            isLoading={loadingHierarchy}
                        />
                    </div>
                </>
            )}
            mainPanel={(
                selectedElementId ? (
                    <ElementDetailView
                        key={selectedElementId}
                        elementId={selectedElementId}
                        sessionId={sessionId}
                        elementOrder={elementOrder}
                        currentElementIndex={currentElementIndex}
                        onNavigateElement={onNavigateElement}
                        onSaveSuccess={handleElementSaveSuccess}
                    />
                ) : (
                    <SelectElementPlaceholder />
                )
            )}
            rightPanel={(
                 <>
                    {/* Mobile Context Trigger & Sheet */}
                    <Sheet open={isContextOpen} onOpenChange={setIsContextOpen}>
                         <SheetTrigger asChild className="lg:hidden fixed top-4 right-4 z-[60]">
                            <Button variant="outline" size="icon">
                                <PanelRight className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="p-0 w-72 sm:w-80">
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle>Context</SheetTitle>
                                <SheetDescription className="sr-only">View session context and status</SheetDescription>
                            </SheetHeader>
                           <ContextPanel 
                                scenario={scenario}
                                session={session}
                                sessionNotes={sessionNotes}
                                onSaveSessionNotes={handleSaveSessionNotes}
                                deficiencyElements={deficiencyElements}
                                loadingDeficiencies={loadingDeficiencies}
                                showGenerateReportButton={!isDesktop}
                           />
                        </SheetContent>
                    </Sheet>

                    {/* Desktop Context (always visible) - Add fixed width */}
                    <div className="hidden lg:block h-full w-80 flex-shrink-0 border-l bg-background">
                         <ContextPanel 
                            scenario={scenario}
                            session={session}
                            sessionNotes={sessionNotes}
                            onSaveSessionNotes={handleSaveSessionNotes}
                            deficiencyElements={deficiencyElements}
                            loadingDeficiencies={loadingDeficiencies}
                            showGenerateReportButton={false}
                         />
                    </div>
                </>
            )}
            statusBar={(
                 <StatusPanel 
                    session={session}
                    template={template}
                    completed={progressMetrics.completed}
                    total={progressMetrics.total}
                    issues={progressMetrics.issues}
                    percentage={progressMetrics.percentage}
                />
            )}
        />
    );
}

// Wrap the main content in Suspense for useSearchParams/useParams
export default function SessionPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading Session...</p>
            </div>
        }>
            <SessionPageContent />
        </Suspense>
    );
}
