import React from "react";
import { CheckCircle, AlertTriangle, Star, XCircle, HelpCircle } from "lucide-react";

interface TaskBreakdown {
  id: string;
  areaTitle?: string;
  orderLetter?: string;
  title: string;
  scoreEarned?: number | null;
  scoreTotal?: number | null;
  feedbackTag?: string | null;
  instructorFeedback?: string | null;
}

const tagColors: Record<string, string> = {
  excellent: "bg-green-100 text-green-800",
  proficient: "bg-blue-100 text-blue-800",
  needs_review: "bg-yellow-100 text-yellow-800",
  weak: "bg-red-100 text-red-800",
  ready_for_checkride: "bg-purple-100 text-purple-800",
  oral_only: "bg-gray-100 text-gray-800",
  did_not_cover: "bg-muted text-muted-foreground",
};

const tagIcons: Record<string, React.ReactNode> = {
  excellent: <Star className="h-4 w-4 mr-1 text-green-500" />,
  proficient: <CheckCircle className="h-4 w-4 mr-1 text-blue-500" />,
  needs_review: <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />,
  weak: <XCircle className="h-4 w-4 mr-1 text-red-500" />,
  ready_for_checkride: <Star className="h-4 w-4 mr-1 text-purple-500" />,
  oral_only: <HelpCircle className="h-4 w-4 mr-1 text-gray-500" />,
  did_not_cover: <HelpCircle className="h-4 w-4 mr-1 text-muted-foreground" />,
};

export const TaskBreakdownCard: React.FC<{ tasks: TaskBreakdown[] }> = ({ tasks }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border rounded-xl overflow-hidden">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Area</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Task</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Score</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Feedback</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Instructor Feedback</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-6 text-muted-foreground">No tasks found.</td>
            </tr>
          ) : (
            tasks.map((task, idx) => (
              <tr key={task.id} className={idx % 2 === 0 ? "bg-white dark:bg-muted" : "bg-muted/60 dark:bg-muted/80"}>
                <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">{task.areaTitle || "-"}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="font-semibold mr-1">{task.orderLetter}</span>
                  {task.title}
                </td>
                <td className="px-4 py-3 text-center text-sm">
                  {task.scoreEarned != null && task.scoreTotal != null ? (
                    <span className="font-mono font-semibold text-primary">
                      {task.scoreEarned} / {task.scoreTotal}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {task.feedbackTag ? (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-sm ${tagColors[task.feedbackTag] || "bg-muted text-muted-foreground"}`}>
                      {tagIcons[task.feedbackTag] || null}
                      {task.feedbackTag.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {task.instructorFeedback || <span className="text-xs text-muted-foreground">-</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}; 