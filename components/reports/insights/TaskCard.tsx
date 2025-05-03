import React, { useState } from "react";

export function TaskCard({ taskScores }: { taskScores: any[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!taskScores || taskScores.length === 0) {
    return (
      <section className="rounded-xl bg-white shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-2 text-primary">Task Breakdown</h2>
        <div className="min-h-[60px] flex items-center justify-center text-muted-foreground">
          No tasks found.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-primary">Task Breakdown</h2>
      <div className="space-y-3">
        {taskScores.map((task: any) => {
          const isOpen = expanded === task.id;
          return (
            <div
              key={task.id}
              className={`transition-all duration-200 border rounded-lg overflow-hidden shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 ${isOpen ? 'ring-2 ring-blue-400' : ''}`}
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 focus:outline-none hover:bg-blue-100/40"
                onClick={() => setExpanded(isOpen ? null : task.id)}
                aria-expanded={isOpen}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1 text-left">
                  <span className="font-mono font-semibold text-blue-700">{task.task?.area?.title || '-'}</span>
                  <span className="font-semibold ml-2">{task.task?.order_letter} {task.task?.title}</span>
                  <span className="ml-4 text-sm text-primary font-bold">{task.task_score_earned} / {task.task_score_total}</span>
                  <span className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${getTagColor(task.feedback_tag)}`}>{formatTag(task.feedback_tag)}</span>
                </div>
                <span className="ml-2 text-xl text-blue-500">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="px-6 py-4 bg-white border-t animate-fade-in">
                  <div className="mb-2">
                    <span className="font-semibold text-sm text-blue-700">Instructor Feedback:</span>
                    <div className="mt-1 text-gray-700 text-base">{task.instructor_feedback || <span className="italic text-gray-400">No feedback provided.</span>}</div>
                  </div>
                  {/* Add more details here if needed */}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function getTagColor(tag: string) {
  switch (tag) {
    case "excellent": return "bg-green-100 text-green-800";
    case "proficient": return "bg-blue-100 text-blue-800";
    case "needs_review": return "bg-yellow-100 text-yellow-800";
    case "weak": return "bg-red-100 text-red-800";
    case "ready_for_checkride": return "bg-purple-100 text-purple-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function formatTag(tag: string) {
  if (!tag) return "-";
  return tag.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
} 