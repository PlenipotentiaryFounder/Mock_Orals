import React from "react";
import { Plane, MapPin, CloudSun } from "lucide-react";

interface ScenarioDetails {
  title: string;
  aircraftType?: string | null;
  departureAirport?: string | null;
  arrivalAirport?: string | null;
  flightConditions?: string | null;
  scenarioText: string;
}

interface ScenarioDetailsCardProps {
  scenario?: ScenarioDetails | null;
}

export const ScenarioDetailsCard: React.FC<ScenarioDetailsCardProps> = ({ scenario }) => {
  if (!scenario) return null;
  return (
    <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-xl p-6 shadow-md space-y-4">
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-200">
        <Plane className="h-6 w-6 text-blue-500" />
        {scenario.title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
          <Plane className="h-5 w-5" />
          <span className="font-medium">Aircraft:</span>
          <span>{scenario.aircraftType || "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
          <MapPin className="h-5 w-5" />
          <span className="font-medium">Departure:</span>
          <span>{scenario.departureAirport || "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
          <MapPin className="h-5 w-5" />
          <span className="font-medium">Arrival:</span>
          <span>{scenario.arrivalAirport || "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
          <CloudSun className="h-5 w-5" />
          <span className="font-medium">Conditions:</span>
          <span>{scenario.flightConditions || "-"}</span>
        </div>
      </div>
      <div className="mt-4 p-4 bg-white dark:bg-muted rounded-lg border border-blue-100 dark:border-blue-900 text-blue-900 dark:text-blue-100 shadow-sm">
        <span className="block text-sm font-semibold mb-1 text-blue-700 dark:text-blue-300">Scenario</span>
        <span className="text-base">{scenario.scenarioText}</span>
      </div>
    </div>
  );
}; 