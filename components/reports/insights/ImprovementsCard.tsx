import React from "react";
import { AlertTriangle } from "lucide-react";

export function ImprovementsCard({ taskScores }: { taskScores: any[] }) {
  const improvements = taskScores
    .filter((task: any) => task.feedback_tag === "needs_review" || task.feedback_tag === "weak")
    .slice(0, 3) // Limit to top 3
    .map((task: any) => ({
      id: task.id,
      areaTitle: task.task?.area?.title,
      orderLetter: task.task?.order_letter,
      title: task.task?.title,
    }));

  return (
    <section className="flex-1 rounded-xl bg-yellow-50 border border-yellow-200 shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-yellow-700">Needs Improvement</h2>
      </div>
      <div className="min-h-[60px] space-y-2">
        {improvements.length === 0 ? (
          <div className="flex items-center justify-center h-full text-yellow-700/70 italic">No major areas for improvement identified.</div>
        ) : (
          improvements.map((i) => (
            <div key={i.id} className="bg-yellow-100/70 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
              {i.areaTitle ? `${i.areaTitle}: ` : ""} {i.orderLetter} {i.title}
            </div>
          ))
        )}
      </div>
    </section>
  );
} 