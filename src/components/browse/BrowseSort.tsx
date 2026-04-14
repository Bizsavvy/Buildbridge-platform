"use client"

import * as React from "react"
import { ArrowDownAZ, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export type SortOption = 'urgent' | 'newest' | 'nearly_funded' | 'most_pledged'

interface BrowseSortProps {
  onSortChange: (sort: SortOption) => void;
  activeSort: SortOption;
}

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'urgent', label: 'Most Urgent' },
  { id: 'newest', label: 'Newest Requests' },
  { id: 'nearly_funded', label: 'Nearly Funded' },
  { id: 'most_pledged', label: 'Most Pledged' },
]

export function BrowseSort({ onSortChange, activeSort }: BrowseSortProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="text-label-small uppercase font-bold text-on-surface-variant tracking-widest pl-1 hidden sm:inline">
          Sort By:
        </span>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-outline-variant text-label-large font-bold text-on-surface hover:border-primary transition-all whitespace-nowrap"
        >
          <ArrowDownAZ className="h-4 w-4 text-primary" />
          <span>{SORT_OPTIONS.find(o => o.id === activeSort)?.label}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-[calc(100%+8px)] right-0 min-w-[200px] z-30 bg-surface border border-outline-variant shadow-xl rounded-2xl p-2"
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSortChange(opt.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full text-left p-4 rounded-xl hover:bg-primary/5 text-body-medium transition-colors flex items-center justify-between",
                    activeSort === opt.id && "bg-primary/10 text-primary font-black"
                  )}
                >
                  {opt.label}
                  {activeSort === opt.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
