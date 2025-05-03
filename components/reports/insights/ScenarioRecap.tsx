import React from "react";
import { Plane, MapPin, CloudSun, FileText } from "lucide-react";

export function ScenarioRecap({ scenario }: { scenario: any }) {
  if (!scenario) {
    return (
      <section className="rounded-xl bg-blue-50 border border-blue-200 shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-2 text-blue-700 flex items-center gap-2"><FileText className="h-5 w-5" /> Scenario Recap</h2>
        <div className="min-h-[60px] flex items-center justify-center text-blue-700/70 italic">
          No scenario details available for this session.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-blue-50 border border-blue-200 shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
        <FileText className="h-5 w-5" /> Scenario Recap: <span className="text-primary">{scenario.title}</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-blue-800">
          <Plane className="h-5 w-5" />
          <span className="font-medium">Aircraft:</span>
          <span>{scenario.aircraft_type || "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-blue-800">
          <MapPin className="h-5 w-5" />
          <span className="font-medium">Departure:</span>
          <span>{scenario.departure_airport || "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-blue-800">
          <MapPin className="h-5 w-5" />
          <span className="font-medium">Arrival:</span>
          <span>{scenario.arrival_airport || "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-blue-800">
          <CloudSun className="h-5 w-5" />
          <span className="font-medium">Conditions:</span>
          <span>{scenario.flight_conditions || "-"}</span>
        </div>
      </div>
      <div className="mt-4 p-4 bg-white/70 rounded-lg border border-blue-100 text-blue-900 shadow-sm">
        <span className="block text-sm font-semibold mb-1 text-blue-700">Scenario Details</span>
        <p className="text-base leading-relaxed">{scenario.scenario_text}</p>
      </div>
    </section>
  );
} 