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
  AreaWithTasksAndElements 
} from "@/lib/supabase/data-fetchers"
import { Loader2 } from "lucide-react"

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

    // Fetch Session, Template, Scenario details
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
                     // TODO: Fetch initial progress data if needed
                     // const progress = await calculateSessionProgress(sessionId);
                     // setProgressValue(progress);
                } else {
                    console.error("Session data not found for ID:", sessionId);
                    setError("Session data not found.");
                    setSession(null);
                    setTemplate(null);
                    setScenario(null);
                }
            })
            .catch(err => {
                console.error("Error fetching session details:", err);
                setError("Failed to load session details.");
                setSession(null);
                setTemplate(null);
                setScenario(null);
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
            let found = false;
            for (const area of newHierarchy) {
                for (const task of area.tasks) {
                    const elementIndex = task.elements.findIndex((el: any) => el.id === elementId);
                    if (elementIndex !== -1) {
                        task.elements[elementIndex].status = newStatus;
                        found = true;
                        break; // Exit inner loop once found
                    }
                }
                if (found) break; // Exit outer loop once found
            }

            if (!found) {
                console.warn("Saved element not found in hierarchy state:", elementId);
                return currentHierarchy; // Return original state if not found
            }

            return newHierarchy;
        });
        // Re-fetch hierarchy and deficiencies to ensure real-time updates
        if (template?.id && sessionId) {
            getFullHierarchy(template.id, sessionId).then(setHierarchy);
        }
        if (sessionId) {
            fetchSessionDeficiencies(sessionId).then(setDeficiencyElements);
        }
    };

    // Combined loading state
    const isLoading = loadingInitialData; // Keep initial load blocking, hierarchy can load after

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
         return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="max-w-md text-center p-6 bg-card rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Session</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <a href="/sessions" className="text-primary hover:underline">
                        Return to Sessions List
                    </a>
                </div>
            </div>
        );
    }
    
    // Need session and template to proceed
    if (!session || !template) {
        // This case should ideally be covered by the error state now
        // but kept as a fallback safeguard
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Session or template data is missing.</p>
            </div>
        );
    }

    // Render the new Command Center Layout
    return (
        <CommandCenterLayout 
            title={session.session_name || "Session"}
            progress={progressMetrics.percentage}
            navigationPanel={
                view !== "focus" && (
                  <NavigationPanel 
                    hierarchy={hierarchy}
                    isLoading={loadingHierarchy}
                    onElementSelect={handleElementSelect}
                    initialSelectedElementId={selectedElementId}
                  />
                )
            }
            contextPanel={
                scenario && view !== "focus" ? (
                  <ContextPanel 
                    scenario={scenario} 
                    sessionNotes={sessionNotes}
                    onSaveSessionNotes={handleSaveSessionNotes}
                    deficiencyElements={deficiencyElements}
                    loadingDeficiencies={loadingDeficiencies}
                    defaultTab={view === "timeline" ? "history" : undefined}
                    onDeficiencyElementSelect={setSelectedElementId}
                  />
                ) : undefined
            }
            statusPanel={
                <StatusPanel 
                    session={session} 
                    template={template} 
                    completed={progressMetrics.completed}
                    total={progressMetrics.total}
                    issues={progressMetrics.issues}
                    percentage={progressMetrics.percentage}
                />
            }
            commandBar={
                <CommandBar 
                    session={session} 
                    template={template} 
                    currentView={view}
                    onViewChange={(v) => setView(v as "standard" | "focus" | "timeline")}
                />
            }
        >
            {/* Main content area (WorkspacePanel is inside CommandCenterLayout) */}
            <div className="h-full min-h-0 flex-1 flex flex-col overflow-hidden">
            {selectedElementId ? (
                <ElementDetailView 
                    key={selectedElementId} // Re-render when element changes
                    elementId={selectedElementId} 
                    sessionId={sessionId} 
                    onSaveSuccess={handleElementSaveSuccess}
                    // Navigation props
                    elementOrder={elementOrder}
                    currentElementIndex={currentElementIndex}
                    onNavigateElement={onNavigateElement}
                />
            ) : (
                <SelectElementPlaceholder />
            )}
            </div>
        </CommandCenterLayout>
    );
}

// Wrap with Suspense for useSearchParams/useParams
export default function SessionPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        }>
            <SessionPageContent />
        </Suspense>
    );
}
