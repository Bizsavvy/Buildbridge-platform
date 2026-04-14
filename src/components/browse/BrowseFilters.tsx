"use client"

import * as React from "react"
import { Search, X, ChevronDown, Filter } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { TRADE_CATEGORIES, NIGERIAN_STATES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface BrowseFiltersProps {
  onFilterChange: (filters: any) => void;
  activeFilters: {
    category: string | null;
    state: string | null;
    badgeLevel: number | null;
    search: string;
  };
}

export function BrowseFilters({ onFilterChange, activeFilters }: BrowseFiltersProps) {
  const [isStatesOpen, setIsStatesOpen] = React.useState(false)

  const handleCategoryToggle = (id: string) => {
    onFilterChange({ 
      ...activeFilters, 
      category: activeFilters.category === id ? null : id 
    })
  }

  const handleStateSelect = (state: string) => {
    onFilterChange({ 
      ...activeFilters, 
      state: activeFilters.state === state ? null : state 
    })
    setIsStatesOpen(false)
  }

  const handleBadgeToggle = (level: number) => {
    onFilterChange({ 
      ...activeFilters, 
      badgeLevel: activeFilters.badgeLevel === level ? null : level 
    })
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Search & State Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant opacity-50" />
          <input 
            type="text"
            placeholder="Search tradespeople, items, or locations..."
            value={activeFilters.search}
            onChange={(e) => onFilterChange({ ...activeFilters, search: e.target.value })}
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-large shadow-sm"
          />
        </div>

        <div className="relative min-w-[200px]">
          <button 
            onClick={() => setIsStatesOpen(!isStatesOpen)}
            className="w-full h-14 flex items-center justify-between px-4 rounded-2xl bg-surface border border-outline-variant text-body-large text-on-surface hover:border-primary transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <span>{activeFilters.state || "Everywhere"}</span>
            </div>
            <div className="flex items-center gap-2">
               {activeFilters.state && (
                  <button 
                     onClick={(e) => {
                        e.stopPropagation();
                        handleStateSelect("");
                     }}
                     className="p-1 hover:bg-on-surface/10 rounded-full transition-colors"
                  >
                     <X className="h-4 w-4 text-error" />
                  </button>
               )}
               <ChevronDown className={cn("h-4 w-4 transition-transform", isStatesOpen && "rotate-180")} />
            </div>
          </button>
          
          {isStatesOpen && (
             <div className="absolute top-[calc(100%+8px)] left-0 w-full max-h-64 overflow-y-auto z-30 bg-surface border border-outline-variant shadow-lg rounded-xl p-2 animate-in fade-in zoom-in-95">
                <button 
                  onClick={() => handleStateSelect("")}
                  className="w-full text-left p-3 rounded-lg hover:bg-primary/5 text-body-medium"
                >
                  All Nigeria
                </button>
                {NIGERIAN_STATES.map((state) => (
                  <button 
                    key={state}
                    onClick={() => handleStateSelect(state)}
                    className={cn(
                        "w-full text-left p-3 rounded-lg hover:bg-primary/5 text-body-medium",
                        activeFilters.state === state && "bg-primary/10 text-primary font-bold"
                    )}
                  >
                    {state}
                  </button>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Trade Categories Scroll */}
      <div className="flex flex-col gap-3">
        <p className="text-label-small uppercase font-bold text-on-surface-variant tracking-widest pl-1">
          Specialization
        </p>
        <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar scroll-smooth">
          {TRADE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeFilters.category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryToggle(cat.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full border-2 transition-all whitespace-nowrap",
                  isActive
                    ? "bg-primary border-primary text-on-primary shadow-md"
                    : "bg-surface border-outline-variant text-on-surface hover:border-primary/50"
                )}
              >
                <Icon className={cn("h-4 w-4", !isActive && "text-primary")} />
                <span className="text-label-large font-bold">{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Trust Levels */}
      <div className="flex flex-col gap-3">
        <p className="text-label-small uppercase font-bold text-on-surface-variant tracking-widest pl-1">
          Verification Level
        </p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((level) => (
            <button key={level} onClick={() => handleBadgeToggle(level)}>
               <Badge 
                  level={level as any} 
                  className={cn(
                      "cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all",
                      activeFilters.badgeLevel === level ? "ring-2 ring-primary scale-105" : "opacity-60 grayscale-[0.5]"
                  )} 
               />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
