"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { getFullHierarchy, AreaWithTasksAndElements, TaskWithElements, ElementBasic } from "@/lib/supabase/data-fetchers";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, FileText, Folder, Layers } from "lucide-react";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SessionSidebarProps {
  templateId: string;
  onElementSelect: (elementId: string) => void;
  initialSelectedElementId?: string | null; // Optional initial selection
}

export function SessionSidebar({ templateId, onElementSelect, initialSelectedElementId }: SessionSidebarProps) {
  const [hierarchy, setHierarchy] = useState<AreaWithTasksAndElements[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(initialSelectedElementId || null);

  useEffect(() => {
    const loadHierarchy = async () => {
      setLoading(true);
      const data = await getFullHierarchy(templateId);
      setHierarchy(data);
      setLoading(false);
    };
    if (templateId) {
      loadHierarchy();
    }
  }, [templateId]);
  
  // Effect to handle initial selection if passed as prop
  useEffect(() => {
      setSelectedElementId(initialSelectedElementId || null);
  }, [initialSelectedElementId]);

  const handleElementClick = (elementId: string) => {
      setSelectedElementId(elementId);
      onElementSelect(elementId);
  }

  const filteredHierarchy = useMemo(() => {
    if (!searchTerm) {
      return hierarchy; // No filter applied
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return hierarchy.map(area => {
        // Filter tasks within the area
        const filteredTasks = area.tasks.map(task => {
            // Filter elements within the task
            const filteredElements = task.elements.filter(element => 
                element.code.toLowerCase().includes(lowerSearchTerm) || 
                element.description.toLowerCase().includes(lowerSearchTerm)
            );

            // Include task if it matches or has matching elements
            const taskMatches = task.title.toLowerCase().includes(lowerSearchTerm) || task.order_letter.toLowerCase().includes(lowerSearchTerm);
            if (taskMatches || filteredElements.length > 0) {
                return { ...task, elements: filteredElements };
            }
            return null; // Task doesn't match and has no matching elements
        }).filter((task): task is TaskWithElements => task !== null); // Remove null tasks

        // Include area if it matches or has matching tasks
        const areaMatches = area.title.toLowerCase().includes(lowerSearchTerm);
         if (areaMatches || filteredTasks.length > 0) {
             return { ...area, tasks: filteredTasks };
         }
         return null; // Area doesn't match and has no matching tasks
    }).filter((area): area is AreaWithTasksAndElements => area !== null); // Remove null areas

  }, [hierarchy, searchTerm]);

  // Determine default open accordions based on search or initial selection
  const defaultAccordionValues = useMemo(() => {
      if (searchTerm) { // If searching, expand all matching areas/tasks
          const openItems: string[] = [];
          filteredHierarchy.forEach(area => {
              openItems.push(`area-${area.id}`);
              area.tasks.forEach(task => {
                  openItems.push(`task-${task.id}`);
              });
          });
          return openItems;
      }
      // If not searching, find the area/task of the initially selected element
      if (selectedElementId) {
           for (const area of hierarchy) {
               for (const task of area.tasks) {
                   if (task.elements.some(el => el.id === selectedElementId)) {
                       return [`area-${area.id}`, `task-${task.id}`];
                   }
               }
           }
      }
      return []; // Default to none open
  }, [filteredHierarchy, hierarchy, searchTerm, selectedElementId]);

  return (
    <Card className="h-full flex flex-col border-r rounded-none">
      <CardHeader className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Tasks & Elements..."
            className="pl-8 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredHierarchy.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchTerm ? "No matching results found." : "No areas found for this template."}
            </div>
          ) : (
            <Accordion 
                type="multiple" 
                className="w-full" 
                key={defaultAccordionValues.join('-')} // Force re-render when defaults change
                defaultValue={defaultAccordionValues}
             >
              {filteredHierarchy.map((area) => (
                <AccordionItem value={`area-${area.id}`} key={area.id} className="border-b-0">
                  <AccordionTrigger className="px-3 py-2 text-sm hover:bg-muted/50 hover:no-underline">
                    <div className="flex items-center gap-2 font-medium">
                        <Layers className="h-4 w-4 text-primary"/>
                        <span>{area.order_number}. {area.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-0 pb-1 pl-3">
                    {area.tasks.length > 0 ? (
                      <Accordion type="multiple" className="w-full" defaultValue={defaultAccordionValues}> 
                        {area.tasks.map((task) => (
                          <AccordionItem value={`task-${task.id}`} key={task.id} className="border-b-0">
                            <AccordionTrigger className="pl-4 pr-3 py-1.5 text-xs hover:bg-muted/50 hover:no-underline [&[data-state=open]>div>svg]:rotate-90">
                               <div className="flex items-center gap-2">
                                  <Folder className="h-3.5 w-3.5 text-secondary-foreground transition-transform duration-200"/>
                                  <span>{task.order_letter}. {task.title}</span>
                               </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-0 pb-1 pl-8 pr-2">
                              {task.elements.length > 0 ? (
                                <div className="space-y-1 mt-1">
                                  {task.elements.map((element) => (
                                    <Button
                                      key={element.id}
                                      variant="ghost"
                                      className={cn(
                                          "w-full h-auto justify-start text-left py-1 px-2 text-xs font-normal leading-snug",
                                          selectedElementId === element.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/80"
                                          )}
                                      onClick={() => handleElementClick(element.id)}
                                      title={element.description}
                                    >
                                      <FileText className="h-3.5 w-3.5 mr-1.5 flex-shrink-0"/>
                                      <span className="flex-1 truncate">{element.code}: {element.description}</span>
                                    </Button>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground py-1 px-2">No elements</p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <p className="text-xs text-muted-foreground py-1 px-4">No tasks in this area</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
} 