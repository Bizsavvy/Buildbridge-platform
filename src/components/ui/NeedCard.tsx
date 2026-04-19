import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "./Card"
import { ProgressBar } from "./ProgressBar"
import { Skeleton } from "./Skeleton"
import { Badge } from "./Badge"
import { Button } from "./Button"
import { 
  MapPin, 
  Calendar, 
  Heart, 
  ShieldCheck,
  MoreHorizontal,
  CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type Need, type Profile } from "@/types"
import { TRADE_ICONS_MAP } from "@/lib/constants"

import Link from "next/link"

interface NeedCardProps {
  need: Need & { profile?: Profile & { name?: string } };
  className?: string;
  onClick?: () => void;
}

export function NeedCard({ need, className, onClick }: NeedCardProps) {
  const formattedCost = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(need.item_cost / 100);

  const percentage = (need.funded_amount / need.item_cost) * 100;
  const isCompleted = need.status === 'completed' || percentage >= 100;
  
  const deadlineDate = new Date(need.deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, diffDays);

  const TradeIcon = need.profile?.trade_category ? TRADE_ICONS_MAP[need.profile.trade_category] : MoreHorizontal;

  const badgeLevel = need.profile?.badge_level === 'level_4_platform_verified' ? 4 
    : need.profile?.badge_level === 'level_3_established' ? 3 
    : need.profile?.badge_level === 'level_2_trusted_tradesperson' ? 2 
    : need.profile?.badge_level === 'level_1_community_member' ? 1 : 0;

  return (
    <Card 
      hoverLift 
      onClick={onClick}
      className={cn(
        "overflow-hidden flex flex-col h-full bg-white rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer group transition-all", 
        isCompleted && "ring-2 ring-primary/20 bg-primary/5",
        className
      )}
    >
      {/* Visual Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {need.photo_url ? (
          <img
            src={need.photo_url}
            alt={need.item_name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-variant/30">
            <TradeIcon className="h-16 w-16" style={{ color: 'var(--color-primary)', opacity: 0.15 }} />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest bg-white/90 backdrop-blur-sm border border-white/20 text-on-surface shadow-sm">
          <TradeIcon className="h-3.5 w-3.5 text-primary" />
          {need.profile?.trade_category?.replace("_", " ")}
        </div>

        {/* Status Badge */}
        {isCompleted && (
          <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-primary text-white shadow-xl animate-pulse">
            <CheckCircle2 className="h-3 w-3" />
            Project Completed
          </div>
        )}

        {/* Amount Tooltip-like Badge */}
        <div className="absolute bottom-4 right-4 rounded-2xl px-4 py-2 text-sm font-black bg-yellow-400 text-black shadow-xl">
          {formattedCost}
        </div>
      </div>

      <div className="flex flex-col flex-grow p-6 gap-6">
        {/* Artisan Info */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img 
              src={need.profile?.photo_url || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23e9ddff' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif' font-size='40' font-weight='bold' fill='%236750A4'%3E${(need.profile?.name || 'A').charAt(0)}%3C/text%3E%3C/svg%3E`} 
              alt={need.profile?.name || "Tradesperson"} 
              className="h-12 w-12 rounded-2xl object-cover border-2 border-white shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 rounded-full p-1 bg-green-500 border-2 border-white shadow-lg">
              <ShieldCheck className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-base font-black truncate text-on-surface leading-none mb-1">
              {need.profile?.name || "Verified Artisan"}
            </h3>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant truncate">
                {need.profile?.location_lga}, {need.profile?.location_state}
              </span>
            </div>
          </div>
        </div>

        {/* Need Story */}
        <div className="flex flex-col gap-2">
           <h4 className="text-xl font-black leading-[1.1] text-on-surface group-hover:text-primary transition-colors">
             {need.item_name}
           </h4>
           <p className="text-sm line-clamp-2 leading-relaxed font-medium text-on-surface-variant">
             {need.story}
           </p>
        </div>

        {/* Progress Section */}
        <div className="flex flex-col gap-4 mt-auto">
          <div className="flex justify-between items-end">
             <div className="flex flex-col">
               <span className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">
                  Funded Progress
               </span>
               <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-black text-on-surface">
                    {Math.min(100, Math.floor(percentage))}%
                 </span>
                 <span className="text-xs font-bold text-on-surface-variant">
                   raised
                 </span>
               </div>
             </div>
             
             <div className="text-right">
                <span className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-1 block">
                   Days Left
                </span>
                <span className="text-sm font-black text-on-surface bg-on-surface-variant/10 px-3 py-1 rounded-full">
                   {isCompleted ? "Ended" : daysRemaining}
                </span>
             </div>
          </div>
          
          <div className="relative h-3 w-full bg-surface-variant/20 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               whileInView={{ width: `${Math.min(100, percentage)}%` }}
               viewport={{ once: true }}
               transition={{ duration: 1, ease: "easeOut" }}
               className={cn("h-full rounded-full", isCompleted ? "bg-primary" : "bg-primary")}
            />
          </div>

          <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-on-surface-variant/60">
             <span>₦{new Intl.NumberFormat().format(need.funded_amount / 100)} raised</span>
             <span>Goal: {formattedCost}</span>
          </div>
        </div>

        {/* Divider & Actions */}
        <div className="pt-6 border-t border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Badge level={badgeLevel as 0|1|2|3|4} />
             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error/5 group cursor-pointer transition-colors hover:bg-error/10">
                <Heart className="h-4 w-4 text-error fill-current" />
                <span className="text-xs font-black text-on-surface">{need.profile?.vouch_count || 0}</span>
             </div>
          </div>
          <Button 
            className={cn(
               "rounded-full px-8 font-black text-xs shadow-xl transition-all hover:-translate-y-1",
               isCompleted ? "bg-primary/10 text-primary shadow-none" : "bg-primary text-white shadow-primary/20"
            )}
          >
            {isCompleted ? "View Impact" : "Fund Now"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function NeedCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="flex flex-col p-5 gap-4 flex-grow">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-2 flex-grow">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-3 mt-auto pt-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-2.5 w-full" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
           <Skeleton className="h-6 w-24 rounded-full" />
           <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    </Card>
  );
}