"use client"

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getScenariosForTemplate, createNewSession, prepopulateSessionElements } from '@/lib/supabase/data-fetchers';
import type { User } from "@supabase/supabase-js";

type Scenario = {
  id: string;
  template_id: string;
  title: string;
  scenario_text: string;
  // Add other relevant fields if needed for display
};

function SelectScenarioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null); // null represents "No Scenario"
  const [user, setUser] = useState<User | null>(null);

  const supabase = useRef(createSupabaseBrowserClient()).current

  // Read data passed from the previous step
  const templateId = searchParams.get('templateId');
  const studentId = searchParams.get('studentId');
  const sessionName = searchParams.get('sessionName');
  const notes = searchParams.get('notes');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // 1. Check auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error("Auth Error:", sessionError);
        toast({ title: "Authentication Error", description: "Please log in.", variant: "destructive" });
        router.replace("/login");
        return;
      }
      setUser(session.user);

      // 2. Validate required parameters
      if (!templateId || !studentId || !sessionName) {
        setError("Missing required information from previous step. Please go back and try again.");
        setLoading(false);
        return;
      }

      // 3. Fetch scenarios for the selected template
      try {
        const fetchedScenarios = await getScenariosForTemplate(templateId);
        setScenarios(fetchedScenarios);
      } catch (fetchError: any) {
        console.error("Error fetching scenarios:", fetchError);
        setError(fetchError.message || "Failed to load scenarios.");
        toast({ title: "Error", description: "Could not load scenarios.", variant: "destructive" });
      }
      setLoading(false);
    };

    fetchData();
  }, [templateId, studentId, sessionName, router, toast, supabase]);

  const handleCreateSession = async () => {
    if (creating) return; // Prevent double clicks
    setCreating(true);
    setError(null);

    if (!user?.id) {
        setError("Could not verify instructor identity. Please refresh and try again.");
        setCreating(false);
        return;
    }

    if (!templateId || !studentId || !sessionName) {
        setError("Missing required information. Please go back and start again.");
        setCreating(false);
        return;
    }

    const sessionPayload = {
      session_name: sessionName,
      instructor_id: user.id, // Use instructor_id as required by sessions schema
      template_id: templateId,
      student_id: studentId, // This should be the student's user_id
      scenario_id: selectedScenarioId, // Use the selected ID (null if "No Scenario")
      notes: notes || null, // Pass notes or null
      // Add any other required fields for session creation with default values if needed
    };

    console.log("Creating session with final payload:", sessionPayload);

    try {
      // Step 1: Create the session
      const newSession = await createNewSession(sessionPayload); 

      if (!newSession || !newSession.id) {
          throw new Error("Session creation failed. The function did not return a valid session.");
      }
      
      // Step 2: Pre-populate session elements (await this!)
      const prepResult = await prepopulateSessionElements(newSession.id, sessionPayload.template_id);
      if (!prepResult.success) {
          console.error("Failed to prepopulate session elements:", prepResult.error);
          toast({ title: "Warning", description: "Could not initialize all evaluation elements. Please refresh or contact support.", variant: "destructive" });
      }

      // Step 3: Show success and navigate
      toast({ title: "Success!", description: "Session created successfully.", variant: "default" });
      router.push(`/sessions/${newSession.id}`); // Navigate to the new session

    } catch (createError: any) {
      console.error("Session Creation Error:", createError);
      const errorMsg = createError.message || "An unexpected error occurred while creating the session.";
      setError(errorMsg);
      toast({ title: "Error Creating Session", description: errorMsg, variant: "destructive" });
      setCreating(false); // Ensure button is re-enabled on error
    }
    // Don't reset creating state on success due to redirect
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  // Display error if required parameters are missing
  if (!templateId || !studentId || !sessionName) {
     return (
         <div className="container mx-auto py-10">
             <Card className="max-w-2xl mx-auto">
                 <CardHeader>
                     <CardTitle>Error</CardTitle>
                     <CardDescription>Missing required session information.</CardDescription>
                 </CardHeader>
                 <CardContent>
                     <Alert variant="destructive">
                         <AlertCircle className="h-4 w-4" />
                         <AlertTitle>Missing Information</AlertTitle>
                         <AlertDescription>
                             {error || "Could not load required details (Template, Student, or Session Name) from the previous step. Please go back and try again."}
                         </AlertDescription>
                     </Alert>
                     <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                 </CardContent>
             </Card>
         </div>
     );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Mock Oral Session: Step 2</CardTitle>
          <CardDescription>
            Select a scenario for the session: <span className="font-semibold">{sessionName}</span>
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="px-6 pb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <CardContent className="space-y-6">
          <RadioGroup 
            value={selectedScenarioId ?? "__none__"} // Use a special value for null
            onValueChange={(value) => {
              setSelectedScenarioId(value === "__none__" ? null : value);
            }}
            className="space-y-2"
          >
            {/* "No Scenario" Option */}
            <div className="flex items-center space-x-2 rounded-md border p-4 transition-colors hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary">
              <RadioGroupItem value="__none__" id="scenario-none" />
              <Label htmlFor="scenario-none" className="flex-1 cursor-pointer">
                <p className="font-medium">No Scenario</p>
                <p className="text-sm text-muted-foreground">Proceed without a specific flight scenario.</p>
              </Label>
            </div>

            {/* List Scenarios */}
            {scenarios.length > 0 ? (
              scenarios.map((scenario) => (
                <div key={scenario.id} className="flex items-center space-x-2 rounded-md border p-4 transition-colors hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary">
                  <RadioGroupItem value={scenario.id} id={`scenario-${scenario.id}`} />
                  <Label htmlFor={`scenario-${scenario.id}`} className="flex-1 cursor-pointer">
                     <p className="font-medium">{scenario.title}</p>
                     {scenario.scenario_text && (
                         <p className="text-sm text-muted-foreground line-clamp-2">{scenario.scenario_text}</p>
                     )}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No specific scenarios found for this template.</p>
            )}
          </RadioGroup>
        </CardContent>

        <CardFooter>
          <Button 
            onClick={handleCreateSession} 
            disabled={creating || loading} 
            className="w-full"
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Session...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Create Session
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Wrap the component in Suspense to handle useSearchParams
export default function SelectScenarioPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SelectScenarioContent />
    </Suspense>
  );
} 