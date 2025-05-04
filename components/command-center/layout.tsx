"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { WorkspacePanel } from "@/components/workspace-panel" // Assuming WorkspacePanel just provides padding/structure

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
  leftPanel?: React.ReactNode
  mainPanel: React.ReactNode
  rightPanel?: React.ReactNode
  statusBar?: React.ReactNode
  commandBar?: React.ReactNode
}

export function CommandCenterLayout({
  leftPanel,
  mainPanel,
  rightPanel,
  statusBar,
  commandBar,
}: CommandCenterLayoutProps) {
  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Command Bar */}
      {commandBar && <div className="flex-shrink-0 border-b bg-card/80 backdrop-blur-sm z-10">{commandBar}</div>}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel Slot - Render whatever is passed */}
        {leftPanel}
        
        {/* Main Panel Slot - Takes available space */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Status Panel Slot - Render if passed */}
          {statusBar && <div className="flex-shrink-0 border-b bg-muted/30">{statusBar}</div>}
          
          {/* Main Content Area - Render mainPanel passed in */}
          <div className="flex-1 overflow-hidden">
             {mainPanel} {/* Render the main panel content directly */}
          </div>
        </div>

        {/* Right Panel Slot - Render whatever is passed */}
        {rightPanel}
      </div>
    </div>
  )
}
