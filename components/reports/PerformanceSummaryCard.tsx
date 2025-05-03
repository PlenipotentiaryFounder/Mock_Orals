import React from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface TaskSummary {
  id: string;
  areaTitle?: string;
  orderLetter?: string;
  title: string;
}

interface PerformanceSummaryCardProps {
  sessionDate: string;
  completionDate?: string | null;
  notes?: string | null;
  strengths: TaskSummary[];
  improvements: TaskSummary[];
}

export const PerformanceSummaryCard: React.FC<PerformanceSummaryCardProps> = ({
  sessionDate,
  completionDate,
  notes,
  strengths,
  improvements,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Summary Info */}
      <div className="space-y-4">
        <div>
          <span className="block text-sm font-medium text-muted-foreground mb-1">Session Date</span>
          <span className="text-lg font-semibold text-primary">{sessionDate}</span>
        </div>
        {completionDate && (
          <div>
            <span className="block text-sm font-medium text-muted-foreground mb-1">Completed</span>
            <span className="text-lg font-semibold text-green-700 dark:text-green-400">{completionDate}</span>
          </div>
        )}
        {notes && (
          <div>
            <span className="block text-sm font-medium text-muted-foreground mb-1">Instructor Notes</span>
            <div className="bg-muted rounded-lg p-3 text-base text-muted-foreground border border-border mt-1">
              {notes}
            </div>
          </div>
        )}
      </div>
      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-semibold text-green-700 dark:text-green-400">Areas of Strength</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {strengths.length === 0 ? (
              <span className="text-muted-foreground text-sm">None listed</span>
            ) : (
              strengths.map((s) => (
                <span key={s.id} className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                  {s.areaTitle ? `${s.areaTitle}: ` : ""}{s.title}
                </span>
              ))
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold text-yellow-700 dark:text-yellow-400">Needs Improvement</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {improvements.length === 0 ? (
              <span className="text-muted-foreground text-sm">None listed</span>
            ) : (
              improvements.map((i) => (
                <span key={i.id} className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                  {i.areaTitle ? `${i.areaTitle}: ` : ""}{i.title}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 