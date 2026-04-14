import * as React from "react"
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
  MoreHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type Need, type Profile } from "@/types"
import { TRADE_ICONS_MAP } from "@/lib/constants"

interface NeedCardProps {
  need: Need & { profile?: Profile & { name?: string } };
  className?: string;
  onBack?: () => void;
}

export function NeedCard({ need, className, onBack }: NeedCardProps) {
  const formattedCost = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(need.item_cost / 100);

  const percentage = (need.funded_amount / need.item_cost) * 100;
  
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
      className={cn("overflow-hidden flex flex-col h-full", className)}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden" style={{ background: 'var(--color-surface-variant)' }}>
        {need.photo_url ? (
          <img
            src={need.photo_url}
            alt={need.item_name}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <TradeIcon className="h-16 w-16" style={{ color: 'var(--color-primary)', opacity: 0.3 }} />
          </div>
        )}
        
        <div 
          className="absolute top-4 left-4 flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold capitalize"
          style={{ background: 'var(--color-surface)', color: 'var(--color-on-surface)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <TradeIcon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          {need.profile?.trade_category?.replace("_", " ")}
        </div>

        <div 
          className="absolute bottom-4 right-4 rounded-xl px-4 py-2 text-sm font-bold shadow-lg"
          style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        >
          {formattedCost}
        </div>
      </div>

      <div className="flex flex-col flex-grow p-6 gap-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={need.profile?.photo_url || "/api/placeholder/48/48"} 
              alt={need.profile?.name || "Tradesperson"} 
              className="h-12 w-12 rounded-2xl object-cover border-2 shadow-md"
              style={{ borderColor: 'var(--color-surface)' }}
            />
            <div 
              className="absolute -bottom-1 -right-1 rounded-full p-1 shadow-lg"
              style={{ background: 'var(--color-primary)', border: '2px solid var(--color-surface)' }}
            >
              <ShieldCheck className="h-3 w-3" style={{ color: 'var(--color-on-primary)' }} />
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-base font-bold truncate" style={{ color: 'var(--color-on-surface)' }}>
              {need.profile?.name || "Anonymous Tradesperson"}
            </h3>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider truncate" style={{ color: 'var(--color-on-surface-variant)' }}>
                {need.profile?.location_lga}, {need.profile?.location_state}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
           <h4 className="text-lg font-bold leading-tight" style={{ color: 'var(--color-on-surface)' }}>
             {need.item_name}
           </h4>
           <p className="text-sm line-clamp-2 leading-relaxed italic" style={{ color: 'var(--color-on-surface-variant)' }}>
             "{need.story}"
           </p>
        </div>

        <div className="flex flex-col gap-3 mt-auto pt-2">
          <div className="flex justify-between items-end">
             <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: 'var(--color-primary)' }}>
                  Funding Progress
               </span>
               <span className="text-2xl font-bold leading-none" style={{ color: 'var(--color-on-surface)' }}>
                  {Math.min(100, Math.floor(percentage))}<span className="text-sm opacity-50 ml-0.5">%</span>
               </span>
             </div>
             <div className="flex flex-col items-end gap-1">
               <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Time Left
               </span>
               <div 
                className="px-2 py-1 rounded-lg flex items-center gap-1.5"
                style={{ background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}
               >
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-sm font-bold">{daysRemaining} Days</span>
               </div>
             </div>
           </div>
           <ProgressBar percentage={percentage} className="h-3 rounded-full" />
        </div>

        <div className="flex items-center justify-between pt-5 border-t" style={{ borderColor: 'var(--color-outline-variant)' }}>
          <div className="flex items-center gap-4">
             <Badge level={badgeLevel as 0|1|2|3|4} />
             <div className="flex items-center gap-1.5 px-2 py-1 rounded-full cursor-pointer transition-colors hover:opacity-80">
                <Heart className="h-4 w-4" style={{ color: 'var(--color-error)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--color-on-surface)' }}>{need.profile?.vouch_count || 0}</span>
             </div>
          </div>
          <Button 
            onClick={(e) => { e.stopPropagation(); onBack?.(); }} 
            variant="secondary" 
            className="rounded-2xl px-6 font-semibold transition-all duration-300"
          >
            Pledge
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