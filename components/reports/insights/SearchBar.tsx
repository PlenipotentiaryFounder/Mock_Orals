import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function SearchBar({ searchTerm, setSearchTerm }: SearchBarProps) {
  return (
    <section className="rounded-xl bg-white shadow-lg p-4 mb-6 flex items-center gap-3 sticky top-4 z-20 border border-gray-200">
      <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      <input
        className="flex-1 border-none outline-none focus:ring-0 text-lg placeholder-gray-400"
        placeholder="Search tasks, elements, or comments..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </section>
  );
} 