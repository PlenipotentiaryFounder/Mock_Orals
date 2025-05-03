import React from "react";
import { Trophy, CheckCircle, AlertTriangle } from "lucide-react";

export function Celebration({ session }: { session: any }) {
  // Placeholder logic: Determine if session looks "good" (e.g., high readiness or few weak points)
  // This should be replaced with a more robust check later, possibly using the readinessPercent
  const isGoodSession = Math.random() > 0.5; // Example: Randomly celebrate for now

  let Icon = AlertTriangle;
  let text = "Keep pushing forward!";
  let color = "text-yellow-600";

  if (isGoodSession) {
    Icon = Trophy;
    text = "Fantastic work! Checkride ready!";
    color = "text-green-600";
  } else if (Math.random() > 0.2) { // Example: Sometimes just show neutral
     Icon = CheckCircle;
     text = "Solid progress made!";
     color = "text-blue-600";
  }

  return (
    <section className="w-full flex items-center justify-center mb-6 bg-white/50 p-4 rounded-xl shadow-inner border border-indigo-100 animate-pulse-slow">
      <div className={`flex items-center gap-3 text-2xl font-bold ${color}`}>
        <Icon className="h-8 w-8 drop-shadow-md" />
        <span>{text}</span>
      </div>
    </section>
  );
} 