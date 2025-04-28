"use client"

import { useState } from "react"
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
  notes?: string[]
  history?: any[]
}

export function ContextPanel({ scenario, notes = [], history = [] }: ContextPanelProps) {
  const [activeTab, setActiveTab] = useState("scenario")
  const [newNote, setNewNote] = useState("")
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null)
  const [editedNoteText, setEditedNoteText] = useState("")

  // Sample notes data to retain dynamic structure
  const sampleNotes = [
    "Pilot demonstrated excellent radio communication skills throughout the flight.",
    "Need to work on maintaining proper altitude during approach phase.",
    "Good situational awareness in challenging weather conditions.",
  ]

  // Sample history data
  const sampleHistory = [
    { action: "Element Completed", time: "10:23 AM", description: "ATC.3.2 marked as Satisfactory" },
    { action: "Note Added", time: "10:15 AM", description: "Added note about radio communications" },
    { action: "Session Started", time: "10:00 AM", description: "Evaluation session initiated" },
  ]

  // Use provided data or sample data
  const displayNotes = notes.length > 0 ? notes : sampleNotes
  const displayHistory = history.length > 0 ? history : sampleHistory

  // Handle adding a new note
  const handleAddNote = () => {
    if (newNote.trim()) {
      // In a real implementation, this would call an API to save the note
      console.log("Adding note:", newNote)
      setNewNote("")
    }
  }

  // Handle editing a note
  const startEditingNote = (index: number, text: string) => {
    setEditingNoteIndex(index)
    setEditedNoteText(text)
  }

  // Save edited note
  const saveEditedNote = () => {
    if (editedNoteText.trim() && editingNoteIndex !== null) {
      // In a real implementation, this would call an API to update the note
      console.log("Saving edited note:", editedNoteText)
      setEditingNoteIndex(null)
    }
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingNoteIndex(null)
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
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Session Notes</h3>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add Note</span>
              </Button>
            </div>

            {/* New note input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Enter a new note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[80px] text-xs"
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                  Add Note
                </Button>
              </div>
            </div>

            <Separator />

            {displayNotes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No notes added yet</p>
                <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">
                  Add your first note
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {displayNotes.map((note, index) => (
                  <div key={index} className="relative group">
                    {editingNoteIndex === index ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editedNoteText}
                          onChange={(e) => setEditedNoteText(e.target.value)}
                          className="min-h-[60px] text-xs"
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={saveEditedNote}>
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Card className="overflow-hidden">
                        <CardContent className="p-3">
                          <p className="text-xs">{note}</p>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => startEditingNote(index, note)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="p-4 space-y-4 m-0">
            <h3 className="text-sm font-medium">Session History</h3>

            {displayHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No history available</p>
            ) : (
              <div className="space-y-3">
                {displayHistory.map((item, index) => (
                  <div key={index} className="text-xs p-2 border-l-2 border-muted pl-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.action}</span>
                      <span className="text-muted-foreground">{item.time}</span>
                    </div>
                    <p className="text-muted-foreground mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
