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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

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
  scenario: any
  sessionNotes: string
  onSaveSessionNotes: (notes: string) => void
  sessionHistory?: any
  loadingHistory?: boolean
  defaultTab?: string
}

export function ContextPanel({ scenario, sessionNotes, onSaveSessionNotes, sessionHistory, loadingHistory, defaultTab }: ContextPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || "scenario")
  const [notesValue, setNotesValue] = useState(sessionNotes)
  const [saving, setSaving] = useState(false)

  // Keep notesValue in sync with prop
  useEffect(() => {
    setNotesValue(sessionNotes)
  }, [sessionNotes])

  // Update activeTab if defaultTab changes
  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab)
  }, [defaultTab])

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
            <TabsTrigger value="history" className="flex-1 text-xs">
              <History className="h-3.5 w-3.5 mr-1.5" />
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="scenario" className="p-4 space-y-4 m-0">
            <div>
              <h3 className="text-sm font-medium mb-2">{scenario.title}</h3>

              {/* Scenario details card */}
              <Card className="bg-muted/30">
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

            <div>
              <h4 className="text-xs font-medium mb-2">Scenario Briefing:</h4>
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-xs whitespace-pre-wrap">{scenario.scenario_text}</p>
              </div>
            </div>

            {/* Additional scenario resources */}
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
              <div className="flex justify-end mt-2">
                <Button onClick={handleSave} disabled={saving || notesValue === sessionNotes} size="sm">
                  {saving ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-4 space-y-4 m-0">
            <h3 className="text-sm font-medium">Session History</h3>
            {loadingHistory ? (
              <div className="text-xs text-muted-foreground">Loading history...</div>
            ) : sessionHistory && (
              <div className="space-y-3">
                {/* Session lifecycle events */}
                {sessionHistory.session && (
                  <div className="text-xs p-2 border-l-2 border-muted pl-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Session Created</span>
                      <span className="text-muted-foreground">{new Date(sessionHistory.session.created_at).toLocaleString()}</span>
                    </div>
                    {sessionHistory.session.date_started && (
                      <div className="flex justify-between">
                        <span className="font-medium">Session Started</span>
                        <span className="text-muted-foreground">{new Date(sessionHistory.session.date_started).toLocaleString()}</span>
                      </div>
                    )}
                    {sessionHistory.session.date_completed && (
                      <div className="flex justify-between">
                        <span className="font-medium">Session Completed</span>
                        <span className="text-muted-foreground">{new Date(sessionHistory.session.date_completed).toLocaleString()}</span>
                      </div>
                    )}
                    {sessionHistory.session.updated_at && (
                      <div className="flex justify-between">
                        <span className="font-medium">Notes Last Updated</span>
                        <span className="text-muted-foreground">{new Date(sessionHistory.session.updated_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Element evaluations */}
                {sessionHistory.elementEvaluations && sessionHistory.elementEvaluations.length > 0 ? (
                  sessionHistory.elementEvaluations.map((ev: any, idx: number) => (
                    <div key={idx} className="text-xs p-2 border-l-2 border-blue-200 pl-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Element Evaluated</span>
                        <span className="text-muted-foreground">{new Date(ev.updated_at).toLocaleString()}</span>
                      </div>
                      <div>Status: <span className="font-mono">{ev.performance_status}</span></div>
                      {ev.instructor_comment && <div>Comment: <span className="italic">{ev.instructor_comment}</span></div>}
                      <div>Element ID: <span className="font-mono">{ev.element_id}</span></div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">No element evaluations yet.</div>
                )}
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
