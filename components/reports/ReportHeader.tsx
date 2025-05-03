import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import React from "react";

interface ReportHeaderProps {
  sessionName: string;
  templateName?: string;
  onPrint?: () => void;
  onDownload?: () => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  sessionName,
  templateName,
  onPrint,
  onDownload,
}) => {
  return (
    <header className="relative rounded-2xl overflow-hidden mb-10 shadow-lg bg-gradient-to-r from-blue-600/80 to-indigo-500/80 text-white p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 drop-shadow-lg">
          {sessionName}
        </h1>
        {templateName && (
          <div className="text-lg font-semibold opacity-90 mb-1">
            Template: <span className="font-bold">{templateName}</span>
          </div>
        )}
      </div>
      <div className="flex gap-3 items-center bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 shadow-md">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/30" onClick={onPrint}>
          <Printer className="h-5 w-5 mr-2" /> Print
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/30" onClick={onDownload}>
          <Download className="h-5 w-5 mr-2" /> Download
        </Button>
      </div>
    </header>
  );
}; 