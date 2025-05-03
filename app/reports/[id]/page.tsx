"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSessionWithDetails, getTaskScoresForSession, getElementScoresWithDetailsForSession, SessionData, TemplateData, ScenarioData } from "@/lib/supabase/data-fetchers";
// import { motion, AnimatePresence } from "framer-motion"; // Temporarily comment out animation
import { HeroSection } from "@/components/reports/insights/HeroSection";
// import { ProgressChart } from "@/components/reports/insights/ProgressChart"; // Temporarily comment out chart
import { StrengthsCard } from "@/components/reports/insights/StrengthsCard";
import { ImprovementsCard } from "@/components/reports/insights/ImprovementsCard";
import { ReadinessMeter } from "@/components/reports/insights/ReadinessMeter";
import { SearchBar } from "@/components/reports/insights/SearchBar";
import { TaskCard } from "@/components/reports/insights/TaskCard";
import { ElementCard } from "@/components/reports/insights/ElementCard";
import { ScenarioRecap } from "@/components/reports/insights/ScenarioRecap";
import { ShareBar } from "@/components/reports/insights/ShareBar";
import { Celebration } from "@/components/reports/insights/Celebration";

const TABS = [
  { key: "insights", label: "Insights" },
  { key: "tasks", label: "Tasks" },
  { key: "elements", label: "Elements" },
  { key: "scenario", label: "Scenario" },
];

export default function ReportPage() {
  const { id } = useParams();
  const [session, setSession] = useState<SessionData | null>(null);
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [taskScores, setTaskScores] = useState<any[]>([]);
  const [elementScores, setElementScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("insights");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const sessionData = await getSessionWithDetails(id as string);
        if (!sessionData) return;
        setSession(sessionData.session);
        setTemplate(sessionData.template);
        setScenario(sessionData.scenario);
        setTaskScores(await getTaskScoresForSession(id as string));
        setElementScores(await getElementScoresWithDetailsForSession(id as string));
      } catch (error) {
        console.error("Error fetching report:", error);
        // Optionally set an error state here to display to the user
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReport();
  }, [id]);

  const filteredTaskScores = taskScores.filter((task) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      task.task?.area?.title?.toLowerCase().includes(searchTermLower) ||
      task.task?.title?.toLowerCase().includes(searchTermLower) ||
      task.instructor_feedback?.toLowerCase().includes(searchTermLower) ||
      task.feedback_tag?.toLowerCase().includes(searchTermLower)
    );
  });

  const filteredElementScores = elementScores.filter((el) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      el.code?.toLowerCase().includes(searchTermLower) ||
      el.description?.toLowerCase().includes(searchTermLower) ||
      el.instructorComment?.toLowerCase().includes(searchTermLower) ||
      el.performanceStatus?.toLowerCase().includes(searchTermLower)
    );
  });

  if (loading) return <div className="flex items-center justify-center h-screen text-2xl font-bold text-primary">Loading your awesome report...</div>;
  if (!session) return <div className="flex items-center justify-center h-screen text-2xl font-bold text-primary">Report not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-2 md:px-0">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        <HeroSection session={session} template={template} />
        {/* Tab Bar */}
        <div className="flex justify-center mb-6">
          <nav className="flex rounded-xl overflow-hidden shadow border border-blue-200 bg-white">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`px-6 py-3 font-semibold text-lg transition-colors duration-150 focus:outline-none ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-100'}`}
                onClick={() => setActiveTab(tab.key)}
                aria-current={activeTab === tab.key ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        {/* Tab Content - Temporarily remove animation wrapper */}
        {/* <AnimatePresence mode="wait"> */}
          {/* <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          > */}
            {activeTab === "insights" && (
              <div className="space-y-8">
                <Celebration session={session} />
                <ReadinessMeter session={session} taskScores={taskScores} />
                {/* <ProgressChart taskScores={taskScores} /> */}
                <div className="text-center text-muted-foreground p-4 border rounded-lg bg-white">Chart temporarily disabled</div>
                <div className="flex flex-col md:flex-row gap-6">
                  <StrengthsCard taskScores={taskScores} />
                  <ImprovementsCard taskScores={taskScores} />
                </div>
                <ShareBar session={session} />
              </div>
            )}
            {activeTab === "tasks" && (
              <div className="space-y-8">
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <TaskCard taskScores={filteredTaskScores} />
              </div>
            )}
            {activeTab === "elements" && (
              <div className="space-y-8">
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <ElementCard elementScores={filteredElementScores} />
              </div>
            )}
            {activeTab === "scenario" && (
              <ScenarioRecap scenario={scenario} />
            )}
          {/* </motion.div> */}
        {/* </AnimatePresence> */}
      </div>
    </div>
  );
}
