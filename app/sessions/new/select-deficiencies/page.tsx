"use client"

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAllElementsForTemplate } from "@/lib/supabase/data-fetchers";

function LoadingComponent() {
  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export function SelectDeficienciesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const templateId = searchParams.get("templateId");
  const studentId = searchParams.get("studentId");
  const sessionName = searchParams.get("sessionName");
  const notes = searchParams.get("notes");

  const [elements, setElements] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchElements() {
      setLoading(true);
      setError(null);
      if (!templateId) {
        setError("Missing template ID.");
        setLoading(false);
        return;
      }
      try {
        const els = await getAllElementsForTemplate(templateId);
        setElements(els);
      } catch (err: any) {
        setError(err?.message || "Failed to load elements.");
      }
      setLoading(false);
    }
    fetchElements();
  }, [templateId]);

  const handleToggle = (elementId: string) => {
    setSelected((prev) =>
      prev.includes(elementId) ? prev.filter((id) => id !== elementId) : [...prev, elementId]
    );
  };

  const handleNext = () => {
    const params = new URLSearchParams({
      templateId: templateId || "",
      studentId: studentId || "",
      sessionName: sessionName || "",
      notes: notes || "",
      deficiencies: selected.join(","),
    });
    router.push(`/sessions/new/select-scenario?${params.toString()}`);
  };

  if (loading) {
    return (
      <LoadingComponent />
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Could not load ACS elements.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
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
            Select any ACS codes (elements) that appeared as written test deficiencies for this session: <span className="font-semibold">{sessionName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {elements.length === 0 ? (
            <div className="text-muted-foreground">No elements found for this template.</div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {elements.map((el) => (
                <div key={el.id} className="flex items-center space-x-2 border rounded p-2 hover:bg-accent transition-colors">
                  <Checkbox id={el.id} checked={selected.includes(el.id)} onCheckedChange={() => handleToggle(el.id)} />
                  <Label htmlFor={el.id} className="flex-1 cursor-pointer">
                    <span className="font-mono font-semibold mr-2">{el.code}</span>
                    <span>{el.description}</span>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleNext} disabled={loading} className="w-full">
            Next: Select Scenario <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SelectDeficienciesPageWithSuspense() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <SelectDeficienciesPage />
    </Suspense>
  );
} 