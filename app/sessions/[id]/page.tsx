"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams } from "next/navigation"
import { getSessionWithDetails, getFullHierarchy } from "@/lib/supabase/data-fetchers"
import { SessionHeader } from "@/components/SessionHeader"
import { ScenarioDetails } from "@/components/ScenarioDetails"
import { SessionSidebar } from "@/components/SessionSidebar"
import { ElementDetailView } from "@/components/ElementDetailView"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"

// Placeholder for when no element is selected
function SelectElementPlaceholder() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-card border rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-muted-foreground">Select an Element</h3>
            <p className="text-sm text-muted-foreground mt-1">Choose an element from the sidebar to view details and record performance.</p>
        </div>
    );
}

// Main Page Component Content
function SessionPageContent() {
    const { id: sessionId } = useParams();
    const [session, setSession] = useState<any>(null);
    const [template, setTemplate] = useState<any>(null);
    const [scenario, setScenario] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    // Add state for progress calculation if needed later
    const [progressValue, setProgressValue] = useState(0);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!sessionId) return;
            setLoading(true);
            try {
                // Fetch session, template, scenario details
                const sessionData = await getSessionWithDetails(sessionId as string);
                if (sessionData) {
                    setSession(sessionData.session);
                    setTemplate(sessionData.template);
                    setScenario(sessionData.scenario);
                    // TODO: Fetch initial progress data if needed
                    // const progress = await calculateSessionProgress(sessionId);
                    // setProgressValue(progress);
                } else {
                    console.error("Session data not found for ID:", sessionId);
                    setSession(null);
                    setTemplate(null);
                    setScenario(null);
                }
            } catch (error) {
                console.error("Error fetching session details:", error);
                setSession(null);
                setTemplate(null);
                setScenario(null);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [sessionId]);

    // Handler passed to the Sidebar
    const handleElementSelect = (elementId: string) => {
        setSelectedElementId(elementId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!session || !template) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="max-w-md text-center p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Session Not Found</h2>
                    <p className="text-muted-foreground mb-4">
                        The requested session could not be found or the associated template is missing.
                    </p>
                    <a href="/sessions" className="text-blue-600 hover:underline">
                        Return to Sessions List
                    </a>
                </div>
            </div>
        );
    }

    // Command Center Layout
    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
            {/* Top Section: Header, Scenario. Progress is now in Header */}
            {/* Removed container mx-auto and padding here to allow header content to span width if needed */}
            {/* Added border-b */}
            <div className="px-4 pt-4 pb-3 border-b bg-card">
                {/* Pass progressValue to the header */}
                <SessionHeader session={session} template={template} progressValue={progressValue} /> 
                {scenario && (
                    <div className="mt-3"> {/* Add some margin top to scenario if it exists */} 
                       <ScenarioDetails scenario={scenario} />
                    </div>
                )} 
                 {/* Progress Bar Section Removed */}
                 {/* 
                 <div className="mt-3">
                     <Label className="text-xs font-medium text-muted-foreground">Overall Progress</Label>
                     <Progress value={progressValue} className="h-2 mt-1" />
                 </div> 
                 */}
            </div>

            {/* Main Content: Sidebar + Element View */}
            {/* Removed container/mx-auto. Use flex-1 and overflow-hidden. Added gap */}
            {/* Removed py-4, padding added internally or via gap */}
            <div className="flex flex-1 overflow-hidden px-4 gap-4 pt-4 pb-4"> 
                {/* Sidebar (Fixed Width, ensure h-full works within flex parent) */}
                 {/* Removed explicit h-full and overflow-y-auto here, handled by parent flex and internal ScrollArea */}
                <aside className="w-80 flex-shrink-0">
                    <SessionSidebar 
                        templateId={template.id} 
                        onElementSelect={handleElementSelect}
                        initialSelectedElementId={selectedElementId}
                    /> 
                </aside>

                {/* Main Element View (Takes remaining space) */}
                 {/* Removed explicit h-full and overflow-y-hidden here, handled by parent flex */}
                <main className="flex-1"> 
                    {selectedElementId ? (
                        <ElementDetailView 
                            key={selectedElementId} // Add key to force re-render on element change
                            elementId={selectedElementId} 
                            sessionId={sessionId as string} 
                        />
                    ) : (
                        <SelectElementPlaceholder />
                    )}
                </main>
            </div>
        </div>
    );
}

// Wrap with Suspense for useSearchParams/useParams if needed by children
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
