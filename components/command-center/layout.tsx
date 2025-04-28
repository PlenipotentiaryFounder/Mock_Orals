"use client"

import type React from "react"

import { useState } from "react"
import { WorkspacePanel } from "./workspace-panel"
import { cn } from "@/lib/utils"
import { useHotkeys } from "react-hotkeys-hook"
import { Keyboard, Maximize2, Minimize2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * CommandCenterLayout - The main layout component for the instructor command center
 *
 * This component provides the overall structure for the instructor interface, including:
 * - Flexible panel layout with collapsible navigation and context panels
 * - Progress indicator to show overall session completion
 * - Keyboard shortcuts for efficient navigation
 * - Focus mode for distraction-free evaluation
 *
 * The layout is designed to maximize screen real estate for evaluation while
 * keeping important context and navigation accessible.
 */
interface CommandCenterLayoutProps {
  children: React.ReactNode
  navigationPanel: React.ReactNode
  contextPanel?: React.ReactNode
  statusPanel?: React.ReactNode
  commandBar?: React.ReactNode
  title: string
  progress: number
}

export function CommandCenterLayout({
  children,
  navigationPanel,
  contextPanel,
  statusPanel,
  commandBar,
  title,
  progress,
}: CommandCenterLayoutProps) {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [navigationCollapsed, setNavigationCollapsed] = useState(false)
  const [contextCollapsed, setContextCollapsed] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  // Toggle navigation panel with Ctrl+B (common shortcut in IDEs)
  useHotkeys("ctrl+b", () => setNavigationCollapsed(!navigationCollapsed), [navigationCollapsed])

  // Toggle context panel with Ctrl+J
  useHotkeys("ctrl+j", () => setContextCollapsed(!contextCollapsed), [contextCollapsed])

  // Toggle focus mode with Ctrl+Shift+F
  useHotkeys("ctrl+shift+f", () => setFocusMode(!focusMode), [focusMode])

  // Toggle keyboard shortcuts help with ? key
  useHotkeys(
    "?",
    (e) => {
      e.preventDefault()
      setShowKeyboardShortcuts(!showKeyboardShortcuts)
    },
    [showKeyboardShortcuts],
  )

  // Quick navigation between elements with Alt+Up/Down
  useHotkeys("alt+up", () => console.log("Navigate to previous element"))
  useHotkeys("alt+down", () => console.log("Navigate to next element"))

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Command Bar - Always visible at top unless in focus mode */}
      {!focusMode && <div className="flex-shrink-0 border-b bg-card/80 backdrop-blur-sm z-10">{commandBar}</div>}

      {/* Progress Indicator - Thin line showing overall session progress */}
      <div className="h-1 bg-muted w-full relative">
        <div
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Panel - Left side, collapsible */}
        <div
          className={cn(
            "flex-shrink-0 border-r bg-card/50 transition-all duration-300 ease-in-out",
            navigationCollapsed || focusMode ? "w-0 opacity-0" : "w-72 opacity-100",
          )}
        >
          {!navigationCollapsed && !focusMode && navigationPanel}
        </div>

        {/* Workspace - Center, takes available space */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Status Panel - Optional top area for session status info */}
          {statusPanel && !focusMode && <div className="flex-shrink-0 border-b bg-muted/30">{statusPanel}</div>}

          {/* Main Workspace - Where the evaluation happens */}
          <div className="flex-1 overflow-hidden">
            <WorkspacePanel>{children}</WorkspacePanel>
          </div>
        </div>

        {/* Context Panel - Right side, collapsible */}
        {contextPanel && (
          <div
            className={cn(
              "flex-shrink-0 border-l bg-card/50 transition-all duration-300 ease-in-out",
              contextCollapsed || focusMode ? "w-0 opacity-0" : "w-80 opacity-100",
            )}
          >
            {!contextCollapsed && !focusMode && contextPanel}
          </div>
        )}
      </div>

      {/* Focus Mode Toggle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="absolute bottom-16 right-4 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
              onClick={() => setFocusMode(!focusMode)}
            >
              {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{focusMode ? "Exit focus mode" : "Enter focus mode"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Keyboard Shortcuts Indicator */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            >
              <Keyboard className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Press ? for keyboard shortcuts</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowKeyboardShortcuts(false)}
        >
          <div className="bg-card rounded-lg shadow-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Toggle Navigation Panel</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+B</kbd>
              </div>
              <div className="flex justify-between">
                <span>Toggle Context Panel</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+J</kbd>
              </div>
              <div className="flex justify-between">
                <span>Toggle Focus Mode</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Shift+F</kbd>
              </div>
              <div className="flex justify-between">
                <span>Show Keyboard Shortcuts</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd>
              </div>
              <div className="flex justify-between">
                <span>Previous Element</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+↑</kbd>
              </div>
              <div className="flex justify-between">
                <span>Next Element</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+↓</kbd>
              </div>
              <div className="flex justify-between">
                <span>Quick Search</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+K</kbd>
              </div>
              <div className="flex justify-between">
                <span>Mark Satisfactory</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+S</kbd>
              </div>
              <div className="flex justify-between">
                <span>Mark Unsatisfactory</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+U</kbd>
              </div>
              <div className="flex justify-between">
                <span>Mark Not Observed</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+N</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
