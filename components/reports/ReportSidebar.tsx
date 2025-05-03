import React from "react";
import { FileText, BarChart, ListChecks, Layers, Menu } from "lucide-react";

interface ReportSidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const sections = [
  { id: "scenario", label: "Scenario", icon: FileText },
  { id: "summary", label: "Performance Summary", icon: BarChart },
  { id: "tasks", label: "Task Breakdown", icon: ListChecks },
  { id: "elements", label: "Element Details", icon: Layers },
];

export const ReportSidebar: React.FC<ReportSidebarProps> = ({
  activeSection,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}) => {
  return (
    <nav className={`fixed top-0 left-0 h-full z-30 bg-white dark:bg-muted border-r border-border shadow-lg transition-transform duration-300 ${collapsed ? "-translate-x-full" : "translate-x-0"} md:translate-x-0 md:static md:h-auto md:shadow-none md:border-none md:bg-transparent w-64 md:w-56`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-border md:hidden">
        <span className="font-extrabold text-xl tracking-tight text-primary flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" /> Report
        </span>
        <button onClick={onToggleCollapse} className="p-2 rounded-md hover:bg-muted">
          <Menu className="h-6 w-6" />
        </button>
      </div>
      <div className="hidden md:flex items-center px-6 py-6 border-b border-border">
        <span className="font-extrabold text-2xl tracking-tight text-primary flex items-center gap-2">
          <FileText className="h-7 w-7 text-blue-600" /> Report
        </span>
      </div>
      <ul className="flex flex-col gap-2 mt-6 px-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <li key={section.id}>
              <button
                className={`flex items-center w-full px-4 py-3 rounded-lg text-left font-medium transition-colors duration-150 text-base gap-3 hover:bg-blue-100/60 dark:hover:bg-blue-900/30 ${activeSection === section.id ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200" : "text-muted-foreground"}`}
                onClick={() => onNavigate(section.id)}
                aria-current={activeSection === section.id ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                {section.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}; 