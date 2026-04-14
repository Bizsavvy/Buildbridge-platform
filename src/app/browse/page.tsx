"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { NeedCard, NeedCardSkeleton } from "@/components/ui/NeedCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { BrowseFilters } from "@/components/browse/BrowseFilters"
import { BrowseSort, type SortOption } from "@/components/browse/BrowseSort"
import { type Need, type Profile } from "@/types"
import { Search } from "lucide-react"

export default function BrowsePage() {
  const supabase = createClient()
  
  // State for needs
  const [needs, setNeeds] = React.useState<(Need & { profile?: Profile })[]>([])
  const [loading, setLoading] = React.useState(true)
  
  // State for filters
  const [filters, setFilters] = React.useState({
    category: null as string | null,
    state: null as string | null,
    badgeLevel: null as number | null,
    search: ""
  })
  
  // State for sorting
  const [sort, setSort] = React.useState<SortOption>('urgent')

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(filters.search)
    }, 500)
    return () => clearTimeout(timer)
  }, [filters.search])

  // Fetch logic
  const fetchNeeds = React.useCallback(async () => {
    setLoading(true)
    try {
      // Base select
      let selectStr = '*, profile:profiles(*)'
      
      // If we have filters that target the profile, we need an inner join to filter correctly
      const hasProfileFilters = filters.category || filters.state || filters.badgeLevel !== null
      if (hasProfileFilters) {
         selectStr = '*, profile:profiles!inner(*)'
      }

      let query = supabase
        .from('needs')
        .select(selectStr)
        .eq('status', 'active')

      // Apply Filters
      if (filters.category) {
        query = query.eq('profile.trade_category', filters.category)
      }
      
      if (filters.state) {
        query = query.eq('profile.location_state', filters.state.toLowerCase())
      }
      
      if (filters.badgeLevel !== null) {
        const levels = ['level_1_community_member', 'level_2_trusted_tradesperson', 'level_3_established', 'level_4_platform_verified']
        query = query.eq('profile.badge_level', levels[filters.badgeLevel - 1])
      }

      if (debouncedSearch) {
        // Complex OR across joins is restricted in simple client-side queries
        // Scaling search usually requires a dedicated RPC or view, but for MVP:
        query = query.or(`item_name.ilike.%${debouncedSearch}%,story.ilike.%${debouncedSearch}%`)
      }

      // Apply Sorting
      switch (sort) {
        case 'urgent':
          query = query.order('deadline', { ascending: true })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'nearly_funded':
          query = query.order('funding_percentage', { ascending: false })
          break
        case 'most_pledged':
          query = query.order('funded_amount', { ascending: false })
          break
      }

      const { data, error } = await query.limit(50)
      
      if (error) throw error
      setNeeds((data as any) || [])
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [filters.category, filters.state, filters.badgeLevel, debouncedSearch, sort])

  React.useEffect(() => {
    fetchNeeds()
  }, [fetchNeeds])

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col gap-10">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4">
           <h1 className="text-display-small sm:text-display-medium font-black text-on-surface">
              Discover <span className="text-primary italic">Needs.</span>
           </h1>
           <p className="text-body-large text-on-surface-variant max-w-2xl">
              Back verified tradespeople building their futures. Every pledge is held in escrow and only deployed once goals are reached.
           </p>
        </div>

        {/* Filters & Sort Interface */}
        <div className="flex flex-col gap-6 p-6 rounded-3xl bg-surface-variant/30 border border-outline-variant shadow-none">
           <BrowseFilters onFilterChange={setFilters} activeFilters={filters} />
           
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-outline-variant/30">
              <div className="text-body-medium font-bold text-on-surface-variant">
                 Showing <span className="text-on-surface">{needs.length}</span> active needs
              </div>
              <BrowseSort onSortChange={setSort} activeSort={sort} />
           </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
           {loading ? (
             Array.from({ length: 6 }).map((_, i) => (
                <NeedCardSkeleton key={i} />
             ))
           ) : needs.length > 0 ? (
             needs.map((need) => (
                <NeedCard key={need.id} need={need} onBack={() => {}} />
             ))
           ) : (
             <div className="col-span-full py-20 px-4">
                <EmptyState 
                   icon={Search}
                   title="No matches found"
                   description="We couldn't find any needs matching these filters. Try expanding your search or clearing the selection."
                   actionLabel="Clear All Filters"
                   onAction={() => setFilters({ category: null, state: null, badgeLevel: null, search: "" })}
                   className="bg-transparent border-none"
                />
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
