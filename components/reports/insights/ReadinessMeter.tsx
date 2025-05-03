import React from "react";
import { Award } from "lucide-react";

export function ReadinessMeter({ session, taskScores }: { session: any, taskScores: any[] }) {
  // Simple readiness calculation (example: % of tasks proficient or excellent)
  const totalTasks = taskScores.length;
  const goodTasks = taskScores.filter(task => task.feedback_tag === 'excellent' || task.feedback_tag === 'proficient').length;
  const readinessPercent = totalTasks > 0 ? Math.round((goodTasks / totalTasks) * 100) : 0;

  let readinessLevel = "Needs Review";
  let color = "bg-yellow-500";
  if (readinessPercent >= 85) {
    readinessLevel = "Checkride Ready";
    color = "bg-green-500";
  } else if (readinessPercent >= 70) {
    readinessLevel = "Almost There";
    color = "bg-blue-500";
  }

  return (
    <section className="rounded-xl bg-purple-50 border border-purple-200 shadow-lg p-6 mb-6 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-3">
        <Award className="h-6 w-6 text-purple-500" />
        <h2 className="text-xl font-bold text-purple-700">Checkride Readiness</h2>
      </div>
      <div className="w-full max-w-md">
        <div className="h-4 bg-purple-200 rounded-full overflow-hidden mb-1">
          <div
            className={`h-full ${color} transition-all duration-500 ease-out`}
            style={{ width: `${readinessPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm font-medium text-purple-700">
          <span>{readinessPercent}%</span>
          <span className={`font-semibold ${color.replace('bg', 'text')}`}>{readinessLevel}</span>
        </div>
      </div>
    </section>
  );
} 