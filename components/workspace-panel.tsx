"use client"

import type React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"

/**
 * WorkspacePanel - The main content area for the command center
 *
 * This component provides:
 * - Scrollable container for the main content
 * - Proper padding and spacing for content
 *
 * The workspace panel is designed to display the primary content
 * (typically the ElementDetailView) with appropriate spacing and scrolling.
 */
interface WorkspacePanelProps {
  children: React.ReactNode
}

export function WorkspacePanel({ children }: WorkspacePanelProps) {
  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4">{children}</div>
    </ScrollArea>
  )
}
