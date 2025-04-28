"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PlaneTakeoff, PlaneLanding, Cloud, Plane } from "lucide-react";

// Define the expected structure for the scenario prop
interface ScenarioDetailsProps {
  scenario: {
    id: string;
    title: string;
    aircraft_type: string | null;
    departure_airport: string | null;
    arrival_airport: string | null;
    flight_conditions: string | null;
    scenario_text: string;
    // Add other fields if needed
  };
}

export function ScenarioDetails({ scenario }: ScenarioDetailsProps) {
  if (!scenario) {
    return null; // Don't render anything if no scenario data is provided
  }

  return (
    <Accordion type="single" collapsible className="w-full border rounded-md bg-card shadow-sm">
      <AccordionItem value="scenario-details" className="border-b-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <span className="font-medium">Scenario: {scenario.title}</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <div className="space-y-3">
            {/* Key Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {scenario.aircraft_type && (
                <div className="flex items-center gap-1.5">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Aircraft:</span>
                  <Badge variant="outline">{scenario.aircraft_type}</Badge>
                </div>
              )}
              {scenario.departure_airport && (
                <div className="flex items-center gap-1.5">
                  <PlaneTakeoff className="h-4 w-4 text-muted-foreground" />
                   <span className="text-muted-foreground">Departure:</span>
                   <Badge variant="outline">{scenario.departure_airport}</Badge>
                </div>
              )}
              {scenario.arrival_airport && (
                <div className="flex items-center gap-1.5">
                  <PlaneLanding className="h-4 w-4 text-muted-foreground" />
                   <span className="text-muted-foreground">Arrival:</span>
                   <Badge variant="outline">{scenario.arrival_airport}</Badge>
                </div>
              )}
              {scenario.flight_conditions && (
                <div className="flex items-center gap-1.5">
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                   <span className="text-muted-foreground">Conditions:</span>
                   <Badge variant="outline">{scenario.flight_conditions}</Badge>
                </div>
              )}
            </div>
            
            <Separator />

            {/* Full Scenario Text */}
            <div>
              <h4 className="text-sm font-medium mb-1.5">Scenario Briefing:</h4>
              <ScrollArea className="h-32 w-full rounded-md border bg-muted/30 p-3">
                <p className="text-sm whitespace-pre-wrap">
                  {scenario.scenario_text}
                </p>
              </ScrollArea>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 