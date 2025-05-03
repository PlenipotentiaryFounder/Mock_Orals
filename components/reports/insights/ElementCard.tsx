import React, { useState } from "react";

export function ElementCard({ elementScores }: { elementScores: any[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!elementScores || elementScores.length === 0) {
    return (
      <section className="rounded-xl bg-white shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-2 text-primary">Element Details</h2>
        <div className="min-h-[60px] flex items-center justify-center text-muted-foreground">
          No elements found.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-primary">Element Details</h2>
      <div className="space-y-3">
        {elementScores.map((el: any) => {
          const isOpen = expanded === el.id;
          return (
            <div
              key={el.id}
              className={`transition-all duration-200 border rounded-lg overflow-hidden shadow-sm bg-gradient-to-r from-yellow-50 to-indigo-50 ${isOpen ? 'ring-2 ring-yellow-400' : ''}`}
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 focus:outline-none hover:bg-yellow-100/40"
                onClick={() => setExpanded(isOpen ? null : el.id)}
                aria-expanded={isOpen}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1 text-left">
                  <span className="font-mono font-semibold text-yellow-700">{el.code}</span>
                  <span className="font-semibold ml-2">{el.description}</span>
                  <span className="ml-4 text-sm text-primary font-bold">{el.score != null ? el.score : '-'}</span>
                  <span className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(el.performanceStatus)}`}>{formatStatus(el.performanceStatus)}</span>
                </div>
                <span className="ml-2 text-xl text-yellow-500">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="px-6 py-4 bg-white border-t animate-fade-in">
                  <div className="mb-2">
                    <span className="font-semibold text-sm text-yellow-700">Instructor Comment:</span>
                    <div className="mt-1 text-gray-700 text-base">{el.instructorComment || <span className="italic text-gray-400">No comment provided.</span>}</div>
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

function getStatusColor(status: string) {
  switch (status) {
    case "satisfactory": return "bg-green-100 text-green-800";
    case "unsatisfactory": return "bg-red-100 text-red-800";
    case "not-observed": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function formatStatus(status: string) {
  if (!status) return "Not Observed";
  return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
} 