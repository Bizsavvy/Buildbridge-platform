"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Play, Share2, Eye, Quote, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { type ImpactWallSubmission, type Profile } from "@/types"
import { cn } from "@/lib/utils"

interface ImpactCardProps {
  submission: ImpactWallSubmission & { profile: Profile }
}

export function ImpactCard({ submission }: ImpactCardProps) {
  const { profile, caption, photo_url, video_url } = submission

  const badgeLevel = profile.badge_level === 'level_4_platform_verified' ? 4 
    : profile.badge_level === 'level_3_established' ? 3 
    : profile.badge_level === 'level_2_trusted_tradesperson' ? 2 
    : profile.badge_level === 'level_1_community_member' ? 1 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group relative aspect-[4/5] sm:aspect-square overflow-hidden rounded-[2.5rem] bg-surface-variant/20 border border-outline-variant shadow-lg"
    >
      {/* Background Media */}
      <div className="absolute inset-0">
        <img 
          src={photo_url || "/placeholder-impact.jpg"} 
          alt={caption} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Semi-transparent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Video Indicator */}
      {video_url && (
        <div className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
          <Play className="h-5 w-5 fill-current" />
        </div>
      )}

      {/* Profile & Badge */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
         <div className="h-10 w-10 rounded-full border-2 border-white/50 overflow-hidden bg-surface shadow-md">
            <img src={profile.photo_url || ""} alt={profile.user_id} className="h-full w-full object-cover" />
         </div>
         <Badge level={badgeLevel as any} className="scale-75 origin-left shadow-sm" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col gap-4">
        
        <div className="flex flex-col gap-1">
           <p className="text-label-small uppercase font-black text-primary tracking-widest flex items-center gap-2">
              <Quote className="h-3 w-3" />
              Impact Story
           </p>
           <h3 className="text-display-small text-white font-black leading-tight line-clamp-2">
              {caption}
           </h3>
        </div>

        <div className="flex items-center justify-between mt-2 pt-6 border-t border-white/10">
           <div className="flex flex-col">
              <span className="text-label-small text-white/60 font-medium">Tradesperson</span>
              <span className="text-body-medium text-white font-black uppercase tracking-wide">
                 {profile.trade_category.replace('_', ' ')}
              </span>
           </div>
           
           <div className="flex gap-2">
              <button className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all">
                 <Share2 className="h-4 w-4" />
              </button>
              <button className="h-10 px-4 rounded-xl bg-white text-on-surface font-black text-label-large flex items-center gap-2 hover:bg-primary hover:text-white transition-all">
                 View Journey
                 <ExternalLink className="h-4 w-4" />
              </button>
           </div>
        </div>

      </div>

      {/* View/Stats Overlay (Hover Only) */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
         {/* We can add stats here if needed later */}
      </div>

    </motion.div>
  )
}
