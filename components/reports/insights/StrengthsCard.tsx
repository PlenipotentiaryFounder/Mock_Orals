import React from "react";
import { CheckCircle } from "lucide-react";

export function StrengthsCard({ taskScores }: { taskScores: any[] }) {
  const strengths = taskScores
    .filter((task: any) => task.feedback_tag === "excellent" || task.feedback_tag === "proficient")
    .slice(0, 3) // Limit to top 3
    .map((task: any) => ({
      id: task.id,
      areaTitle: task.task?.area?.title,
      orderLetter: task.task?.order_letter,
      title: task.task?.title,
    }));

  return (
    <section className="flex-1 rounded-xl bg-green-50 border border-green-200 shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="h-6 w-6 text-green-500" />
        <h2 className="text-xl font-bold text-green-700">Top Strengths</h2>
      </div>
      <div className="min-h-[60px] space-y-2">
        {strengths.length === 0 ? (
          <div className="flex items-center justify-center h-full text-green-700/70 italic">No major strengths identified.</div>
        ) : (
          strengths.map((s) => (
            <div key={s.id} className="bg-green-100/70 text-green-800 px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
              {s.areaTitle ? `${s.areaTitle}: ` : ""} {s.orderLetter} {s.title}
            </div>
          ))
        )}
      </div>
    </section>
  );
} 