"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  PlaneTakeoff,
  PlaneLanding,
  Cloud,
  Plane,
  ClipboardList,
  Info,
  History,
  PlusCircle,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  Maximize2,
  AlertTriangle,
  Check,
  FileText,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { SessionData, ScenarioData } from "@/lib/supabase/data-fetchers"

/**
 * ContextPanel - Provides contextual information and note-taking capabilities
 *
 * This component offers:
 * - Scenario details for reference during evaluation
 * - Session notes for documenting overall observations
 * - Session history for tracking changes over time
 *
 * The context panel helps instructors maintain awareness of the broader
 * evaluation context while focusing on individual elements.
 */
interface ContextPanelProps {
  scenario: ScenarioData | null
  session: SessionData | null
  sessionNotes: string
  onSaveSessionNotes: (notes: string) => void
  deficiencyElements?: any[]
  loadingDeficiencies?: boolean
  defaultTab?: string
  onDeficiencyElementSelect?: (elementId: string) => void;
  showGenerateReportButton?: boolean
}

export function ContextPanel({
  scenario,
  session,
  sessionNotes,
  onSaveSessionNotes,
  deficiencyElements = [],
  loadingDeficiencies = false,
  defaultTab,
  onDeficiencyElementSelect,
  showGenerateReportButton = false
}: ContextPanelProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(defaultTab || "scenario")
  const [notesValue, setNotesValue] = useState(sessionNotes)
  const [saving, setSaving] = useState(false)
  const [briefingOpen, setBriefingOpen] = useState(true)
  const [popoutOpen, setPopoutOpen] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  useEffect(() => {
    setNotesValue(sessionNotes)
  }, [sessionNotes])

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab)
  }, [defaultTab])

  const handleGenerateReport = () => {
    if (session?.id) {
      router.push(`/reports/${session.id}`)
    } else {
      console.error("Cannot generate report: session ID is missing.")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    await onSaveSessionNotes(notesValue)
    setSaving(false)
  }

  if (!scenario) return null

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="p-3 border-b">
          <TabsList className="w-full h-8">
            <TabsTrigger value="scenario" className="flex-1 text-xs">
              <Info className="h-3.5 w-3.5 mr-1.5" />
              Scenario
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex-1 text-xs">
              <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="deficiencies" className="flex-1 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
              Deficiencies
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="scenario" className="p-4 space-y-4 m-0">
            {scenario ? (
              <>
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
                    {scenario.title}
                    <span className="flex gap-2">
                      <button
                        className="inline-flex items-center px-2 py-1 rounded hover:bg-muted transition"
                        onClick={() => setBriefingOpen((v) => !v)}
                        aria-label={briefingOpen ? "Collapse Briefing" : "Expand Briefing"}
                      >
                        {briefingOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <Dialog open={popoutOpen} onOpenChange={setPopoutOpen}>
                        <DialogTrigger asChild>
                          <button
                            className="inline-flex items-center px-2 py-1 rounded hover:bg-muted transition"
                            aria-label="Pop Out Briefing"
                          >
                            <Maximize2 className="h-4 w-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl w-full">
                          <DialogHeader>
                            <DialogTitle>Scenario Briefing</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-2 text-xs">
                              {scenario.aircraft_type && (
                                <div className="flex items-center gap-1.5">
                                  <Plane className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Aircraft:</span>
                                  <Badge variant="outline" className="ml-auto">
                                    {scenario.aircraft_type}
                                  </Badge>
                                </div>
                              )}
                              {scenario.departure_airport && (
                                <div className="flex items-center gap-1.5">
                                  <PlaneTakeoff className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Departure:</span>
                                  <Badge variant="outline" className="ml-auto">
                                    {scenario.departure_airport}
                                  </Badge>
                                </div>
                              )}
                              {scenario.arrival_airport && (
                                <div className="flex items-center gap-1.5">
                                  <PlaneLanding className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Arrival:</span>
                                  <Badge variant="outline" className="ml-auto">
                                    {scenario.arrival_airport}
                                  </Badge>
                                </div>
                              )}
                              {scenario.flight_conditions && (
                                <div className="flex items-center gap-1.5">
                                  <Cloud className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Conditions:</span>
                                  <Badge variant="outline" className="ml-auto">
                                    {scenario.flight_conditions}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <Separator />
                            <ScrollArea className="max-h-80 rounded-md border bg-muted/30 p-3">
                              <p className="text-xs whitespace-pre-wrap">{scenario.scenario_text}</p>
                            </ScrollArea>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </span>
                  </h3>
                  <Card className="bg-muted/30 shadow-lg border border-primary/20">
                    <CardContent className="p-3">
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        {scenario.aircraft_type && (
                          <div className="flex items-center gap-1.5">
                            <Plane className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Aircraft:</span>
                            <Badge variant="outline" className="ml-auto">
                              {scenario.aircraft_type}
                            </Badge>
                          </div>
                        )}
                        {scenario.departure_airport && (
                          <div className="flex items-center gap-1.5">
                            <PlaneTakeoff className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Departure:</span>
                            <Badge variant="outline" className="ml-auto">
                              {scenario.departure_airport}
                            </Badge>
                          </div>
                        )}
                        {scenario.arrival_airport && (
                          <div className="flex items-center gap-1.5">
                            <PlaneLanding className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Arrival:</span>
                            <Badge variant="outline" className="ml-auto">
                              {scenario.arrival_airport}
                            </Badge>
                          </div>
                        )}
                        {scenario.flight_conditions && (
                          <div className="flex items-center gap-1.5">
                            <Cloud className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Conditions:</span>
                            <Badge variant="outline" className="ml-auto">
                              {scenario.flight_conditions}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Separator />
                {briefingOpen && (
                  <div>
                    <h4 className="text-xs font-medium mb-2 flex items-center justify-between">
                      Scenario Briefing
                      <button
                        className="inline-flex items-center px-2 py-1 rounded hover:bg-muted transition text-xs"
                        onClick={() => setPopoutOpen(true)}
                        aria-label="Pop Out Briefing"
                      >
                        <Maximize2 className="h-3 w-3" />
                        <span className="ml-1">Pop Out</span>
                      </button>
                    </h4>
                    <ScrollArea className="max-h-80 rounded-md border bg-muted/30 p-3">
                      <p className="text-xs whitespace-pre-wrap">{scenario.scenario_text}</p>
                    </ScrollArea>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-medium mb-2">Resources:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="text-xs justify-start">
                      <Info className="h-3.5 w-3.5 mr-1.5" />
                      Checklist
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs justify-start">
                      <Info className="h-3.5 w-3.5 mr-1.5" />
                      Airport Diagram
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs justify-start">
                      <Info className="h-3.5 w-3.5 mr-1.5" />
                      Weather Briefing
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs justify-start">
                      <Info className="h-3.5 w-3.5 mr-1.5" />
                      Route Map
                    </Button>
                  </div>
                </div>

                {showGenerateReportButton && (
                    <div className="pt-4 mt-auto">
                        <Button 
                            size="sm" 
                            onClick={handleGenerateReport} 
                            disabled={isGeneratingReport || !session?.id} 
                            className="w-full h-9 gap-1 text-xs"
                        >
                          {isGeneratingReport ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <FileText className="h-3.5 w-3.5" />
                              <span>Generate Report</span>
                            </>
                          )}
                        </Button>
                    </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No scenario selected for this session.</p>
            )}
          </TabsContent>

          <TabsContent value="notes" className="p-4 space-y-4 m-0">
            <div>
              <h3 className="text-sm font-semibold mb-2">Session Notes</h3>
              <Textarea
                value={notesValue}
                onChange={e => setNotesValue(e.target.value)}
                placeholder="Add general notes about this session..."
                className="min-h-[120px]"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleSave} disabled={saving || notesValue === sessionNotes}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Notes"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deficiencies" className="p-4 space-y-4 m-0">
            <h3 className="text-sm font-medium">Written Test Deficiencies</h3>
            {loadingDeficiencies ? (
              <div className="text-xs text-muted-foreground">Loading deficiencies...</div>
            ) : deficiencyElements && deficiencyElements.length > 0 ? (
              <ScrollArea className="max-h-56 rounded-md border bg-muted/30 p-1 pr-2">
                <div className="space-y-1">
                  {deficiencyElements.map((ev: any, idx: number) => (
                    <button
                      key={idx}
                      className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded bg-yellow-50 border-l-2 border-yellow-400 hover:bg-yellow-100 transition text-xs"
                      onClick={() => onDeficiencyElementSelect?.(ev.element_id)}
                      title={ev.description}
                      type="button"
                    >
                      {ev.performance_status === "satisfactory" ? (
                        <AlertTriangle className="h-3 w-3 text-green-600" />
                      ) : ev.performance_status === "unsatisfactory" ? (
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      )}
                      <span className="font-mono font-semibold truncate max-w-[5.5rem]">{ev.code}</span>
                      <span className="truncate text-xs text-muted-foreground max-w-[10rem]">{ev.description}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-xs text-muted-foreground">No written test deficiencies flagged for this session.</div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
