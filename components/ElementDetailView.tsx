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
import { getElementDetails, saveElementScore, ElementFullData } from "@/lib/supabase/data-fetchers";
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

  // Local state for interactive elements, initialized from fetched data
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [currentComment, setCurrentComment] = useState<string>("");
  const [instructorMentioned, setInstructorMentioned] = useState<boolean>(false);
  const [studentMentioned, setStudentMentioned] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getElementDetails(elementId, sessionId);
      if (data) {
        setElementData(data);
        // Initialize local state from fetched data
        setCurrentScore(data.scoreData?.score ?? null);
        setCurrentComment(data.scoreData?.comment ?? "");
        setInstructorMentioned(data.scoreData?.instructor_mentioned ?? false);
        setStudentMentioned(data.scoreData?.student_mentioned ?? false);
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
  }, [fetchData]); // Rerun when elementId or sessionId changes

  const handleSave = useCallback(async () => {
    if (!elementData) return;
    setSaving(true);
    try {
      const success = await saveElementScore(
        sessionId,
        elementId,
        currentScore,
        currentComment,
        instructorMentioned,
        studentMentioned
      );
      if (success) {
        toast({ title: "Saved", description: `Score for ${elementData.code} updated.`, variant: "success" });
      } else {
        throw new Error("Failed to save score to database.");
      }
    } catch (err: any) {
      console.error("Error saving element data:", err);
      toast({ title: "Error", description: err.message || "Could not save element data.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [sessionId, elementId, currentScore, currentComment, instructorMentioned, studentMentioned, elementData, toast]);

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
                                    value={currentScore?.toString() ?? ""} // Use local state
                                    onValueChange={(value) => setCurrentScore(value ? Number.parseInt(value) : null)}
                                    className="flex flex-wrap gap-2"
                                >
                                    {scoreOptions.map(option => (
                                        <Label 
                                            key={option.value}
                                            htmlFor={`score-${option.value}-${elementId}`}
                                            className={cn(
                                                "flex items-center gap-2 p-2 border rounded-md cursor-pointer transition-colors text-xs font-medium",
                                                "hover:bg-accent hover:text-accent-foreground",
                                                currentScore === option.value ? "bg-primary text-primary-foreground border-primary" : "bg-background"
                                            )}
                                        >
                                            <RadioGroupItem value={option.value.toString()} id={`score-${option.value}-${elementId}`} className="sr-only"/>
                                            {option.label}
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* Mentions */}
                             <div>
                                <Label className="text-sm font-medium mb-2 block">Interaction</Label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox 
                                            id={`instructor-${elementId}`} 
                                            checked={instructorMentioned} // Use local state
                                            onCheckedChange={(checked) => setInstructorMentioned(checked as boolean)}
                                        />
                                        <Label htmlFor={`instructor-${elementId}`} className="text-xs font-normal cursor-pointer flex items-center gap-1.5">
                                            <ThumbsDown className="h-4 w-4 text-red-600"/> Prompted by Instructor
                                        </Label>
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <Checkbox 
                                            id={`student-${elementId}`} 
                                            checked={studentMentioned} // Use local state
                                            onCheckedChange={(checked) => setStudentMentioned(checked as boolean)}
                                        />
                                        <Label htmlFor={`student-${elementId}`} className="text-xs font-normal cursor-pointer flex items-center gap-1.5">
                                            <ThumbsUp className="h-4 w-4 text-green-600"/> Mentioned by Student
                                        </Label>
                                    </div>
                                </div>
                            </div>

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