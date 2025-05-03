import React from "react";
import { Printer, Download, Share2 } from "lucide-react";

export function ShareBar({ session }: { session: any }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="rounded-xl bg-white shadow-lg p-4 mb-6 flex items-center gap-3 justify-end border border-gray-200">
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-150"
      >
        <Printer className="h-5 w-5" /> Print Report
      </button>
      <button
        disabled
        title="Download PDF (Coming Soon)"
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow transition-colors duration-150 opacity-50 cursor-not-allowed"
      >
        <Download className="h-5 w-5" /> Download PDF
      </button>
      <button
        disabled
        title="Share Report (Coming Soon)"
        className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg shadow transition-colors duration-150 opacity-50 cursor-not-allowed"
      >
        <Share2 className="h-5 w-5" /> Share
      </button>
    </section>
  );
} 