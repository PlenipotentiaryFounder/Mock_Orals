"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fetchElementDetails, saveElementEvaluation, ElementFullData } from "@/lib/supabase/data-fetchers";
import { 
    Loader2, 
    BookOpen, 
    MessageSquare, 
    Save, 
    AlertCircle, 
    FileText, 
    ExternalLink, 
    HelpCircle, 
    ThumbsUp, 
    ThumbsDown 
} from "lucide-react";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ElementDetailViewProps {
  elementId: string;
  sessionId: string;
}

const scoreOptions = [
    { value: 1, label: 'Rote' },
    { value: 2, label: 'Understanding' },
    { value: 3, label: 'Application' },
    { value: 4, label: 'Correlation' },
];

export function ElementDetailView({ elementId, sessionId }: ElementDetailViewProps) {
  const [elementData, setElementData] = useState<ElementFullData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Remove state related to old score/mention logic
  // const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [currentComment, setCurrentComment] = useState<string>("");
  // const [instructorMentioned, setInstructorMentioned] = useState<boolean>(false);
  // const [studentMentioned, setStudentMentioned] = useState<boolean>(false);
  
  // Keep performance state (satisfactory, unsatisfactory, not-observed)
  const [performance, setPerformance] = useState<"satisfactory" | "unsatisfactory" | "not-observed">("not-observed");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchElementDetails(elementId, sessionId);
      if (data) {
        setElementData(data);
        // Initialize local state from performanceData
        setCurrentComment(data.performanceData?.comment ?? "");
        setPerformance(data.performanceData?.performance_status || "not-observed");
      } else {
        setError("Element details not found.");
        setElementData(null);
      }
    } catch (err: any) {
      console.error("Error in fetchData:", err);
      setError(err.message || "Failed to load element details.");
      setElementData(null);
    } finally {
      setLoading(false);
    }
  }, [elementId, sessionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = useCallback(async () => {
    if (!elementData) return;
    setSaving(true);
    try {
      // Pass performance and comment to save function
      const success = await saveElementEvaluation(
        sessionId,
        elementId,
        performance, // Use performance state
        currentComment,
        // instructorMentioned, // Removed
        // studentMentioned // Removed
      );
      if (success) {
        toast({ title: "Saved", description: `Evaluation for ${elementData.code} updated.`, variant: "default" });
        // Update local state to reflect saved data
        setElementData(prev => prev ? ({ 
            ...prev, 
            performanceData: { 
                performance_status: performance, 
                comment: currentComment 
            }
        }) : null);
      } else {
        throw new Error("Failed to save evaluation to database.");
      }
    } catch (err: any) {
      console.error("Error saving element data:", err);
      toast({ title: "Error", description: err.message || "Could not save element data.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  // Depend on performance and comment state
  }, [sessionId, elementId, performance, currentComment, elementData, toast]); 

  // --- UI Rendering --- 

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchData} className="mt-4">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!elementData) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select an element from the sidebar to view its details.
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "knowledge": return <BookOpen className="h-5 w-5 text-blue-600" />;
      case "risk": return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case "skill": return <FileText className="h-5 w-5 text-green-600" />;
      default: return null;
    }
  };

  return (
    // Fixed height container with internal scrolling
    <div className="h-full flex flex-col bg-card border rounded-lg shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                    {getTypeIcon(elementData.type)}
                    <Badge variant="outline" className="font-mono text-sm">{elementData.code}</Badge>
                    <span className="text-sm font-medium capitalize">({elementData.type})</span>
                </div>
                <Button onClick={handleSave} size="sm" disabled={saving} className="gap-1.5">
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Save
                </Button>
            </div>
            <h2 className="text-lg font-semibold">{elementData.description}</h2>
            {elementData.label && <p className="text-xs text-muted-foreground">{elementData.label}</p>}
        </div>

        {/* Main Content Area with Scrolling */}
        <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">

                 {/* Scoring and Interaction */}
                 <section>
                    <h3 className="text-base font-semibold mb-3">Evaluation</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Side: Score & Mentions */}
                        <div className="space-y-4">
                            {/* Performance Rating */}
                            <div>
                                <Label className="text-sm font-medium flex items-center justify-between mb-2">
                                    <span>Performance Rating</span>
                                     <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="left" className="max-w-xs">
                                                <div className="space-y-1 p-1">
                                                    <p className="font-medium">Rating Scale:</p>
                                                    <p className="text-xs">1 - Rote: Basic recall</p>
                                                    <p className="text-xs">2 - Understanding: Comprehends</p>
                                                    <p className="text-xs">3 - Application: Applies knowledge</p>
                                                    <p className="text-xs">4 - Correlation: Connects concepts</p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <RadioGroup
                                    value={performance} // Bind to performance state
                                    onValueChange={(value) => setPerformance(value as any)}
                                    className="flex flex-wrap gap-2"
                                >
                                    {/* Remove old score options */}
                                    {/* Map performance options if needed, but current setup uses explicit items */}
                                </RadioGroup>
                            </div>

                            {/* Remove Mentions section */}
                            {/* 
                             <div>
                                <Label className="text-sm font-medium mb-2 block">Interaction</Label>
                                ... checkboxes ...
                            </div> 
                            */}

                        </div>
                        
                        {/* Right Side: Comments */}
                        <div>
                            <Label htmlFor={`comment-${elementId}`} className="text-sm font-medium mb-2 block">Instructor Comment</Label>
                            <Textarea
                                id={`comment-${elementId}`}
                                value={currentComment} // Use local state
                                onChange={(e) => setCurrentComment(e.target.value)}
                                placeholder="Add comments on student performance for this element..."
                                className="min-h-[140px] resize-none"
                            />
                        </div>
                    </div>
                 </section>

                <Separator />

                {/* Instructor Notes */}
                <section>
                    <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-muted-foreground"/> Instructor Notes
                    </h3>
                    <div className="space-y-3 pl-2">
                        {elementData.instructorNotes.length > 0 ? (
                          elementData.instructorNotes.map((note) => (
                            <div key={note.id} className="border-l-4 border-blue-400 pl-3 py-1 text-sm">
                              <p>{note.note_text}</p>
                              {note.source_title && (
                                <div className="flex items-center flex-wrap mt-1 text-xs text-muted-foreground gap-x-2">
                                  <span>Source: {note.source_title}</span>
                                  {note.page_reference && <span>(p.{note.page_reference})</span>}
                                  {note.source_url && (
                                    <a
                                      href={note.source_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-blue-600 hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      Link
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No instructor notes available for this element.</p>
                        )}
                      </div>
                </section>

                <Separator />

                {/* Sample Questions */}
                <section>
                     <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-muted-foreground"/> Sample Questions
                    </h3>
                     <div className="space-y-2 pl-2">
                        {elementData.sampleQuestions.length > 0 ? (
                          elementData.sampleQuestions.map((question) => (
                            <div key={question.id} className="p-2 bg-muted/50 rounded-md border text-sm">
                              <p>{question.question_text}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No sample questions available for this element.</p>
                        )}
                      </div>
                </section>
                
            </div>{/* End p-4 container */}
        </ScrollArea>
    </div>
  );
} 