import React from "react";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface ElementDetail {
  id: string;
  code: string;
  description: string;
  score?: number | null;
  performanceStatus?: string | null;
  instructorComment?: string | null;
}

const statusColors: Record<string, string> = {
  satisfactory: "bg-green-100 text-green-800",
  unsatisfactory: "bg-red-100 text-red-800",
  "not-observed": "bg-gray-100 text-gray-800",
};

const statusIcons: Record<string, React.ReactNode> = {
  satisfactory: <CheckCircle className="h-4 w-4 mr-1 text-green-500" />,
  unsatisfactory: <XCircle className="h-4 w-4 mr-1 text-red-500" />,
  "not-observed": <HelpCircle className="h-4 w-4 mr-1 text-gray-500" />,
};

function formatStatus(status?: string | null) {
  if (!status) return "Not Observed";
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export const ElementDetailsCard: React.FC<{ elements: ElementDetail[] }> = ({ elements }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border rounded-xl overflow-hidden">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Code</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Description</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Score</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Instructor Comment</th>
          </tr>
        </thead>
        <tbody>
          {elements.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-6 text-muted-foreground">No elements found.</td>
            </tr>
          ) : (
            elements.map((el, idx) => (
              <tr key={el.id} className={idx % 2 === 0 ? "bg-white dark:bg-muted" : "bg-muted/60 dark:bg-muted/80"}>
                <td className="px-4 py-3 text-sm font-mono font-semibold whitespace-nowrap">{el.code}</td>
                <td className="px-4 py-3 text-sm">{el.description}</td>
                <td className="px-4 py-3 text-center text-sm">
                  {el.score != null ? (
                    <span className="font-mono font-semibold text-primary">{el.score}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-sm ${statusColors[el.performanceStatus || "not-observed"]}`}>
                    {statusIcons[el.performanceStatus || "not-observed"]}
                    {formatStatus(el.performanceStatus)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {el.instructorComment || <span className="text-xs text-muted-foreground">-</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}; 