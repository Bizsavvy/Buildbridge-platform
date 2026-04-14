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
  
  // Calculate days remaining
  const deadlineDate = new Date(need.deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, diffDays);

  const TradeIcon = need.profile?.trade_category ? TRADE_ICONS_MAP[need.profile.trade_category] : MoreHorizontal;

  return (
    <Card 
      hoverLift 
      className={cn(
        "overflow-hidden flex flex-col h-full glass-card-hover cursor-pointer", 
        className
      )}
    >
      {/* Visual Header: Image + Trade Badge */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-variant/30">
        {need.photo_url ? (
          <img
            src={need.photo_url}
            alt={need.item_name}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
             <TradeIcon className="h-16 w-16 text-primary/10" />
          </div>
        )}
        
        {/* Floating Category Tag */}
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-xl bg-white/90 backdrop-blur-md px-3 py-1.5 text-label-small font-black text-on-surface shadow-sm border border-white/50 capitalize">
          <TradeIcon className="h-4 w-4 text-primary" />
          {need.profile?.trade_category?.replace("_", " ")}
        </div>

        {/* Cost Overlay */}
        <div className="absolute bottom-4 right-4 rounded-xl bg-primary px-4 py-2 text-label-medium font-black text-on-primary shadow-2xl">
          {formattedCost}
        </div>
      </div>

      <div className="flex flex-col flex-grow p-6 gap-5">
        {/* Profile Info */}
        <div className="flex items-center gap-4">
          <div className="relative group/avatar">
             <img 
               src={need.profile?.photo_url || "/api/placeholder/48/48"} 
               alt={need.profile?.name || "Tradesperson"} 
               className="h-12 w-12 rounded-2xl object-cover border-2 border-white shadow-md transition-transform group-hover/avatar:scale-105"
             />
             <div className="absolute -bottom-1 -right-1 bg-badge-2 rounded-full p-1 border-2 border-white shadow-lg">
                <ShieldCheck className="h-3 w-3 text-white" />
             </div>
          </div>
          <div className="flex flex-col min-w-0">
             <h3 className="text-title-medium font-black text-on-surface truncate tracking-tight">
                {need.profile?.name || "Anonymous Tradesperson"}
             </h3>
             <div className="flex items-center gap-1.5 text-on-surface-variant/80">
                <MapPin className="h-3.5 w-3.5 text-primary/60" />
                <span className="text-label-small truncate font-bold uppercase tracking-wider">
                  {need.profile?.location_lga}, {need.profile?.location_state}
                </span>
             </div>
          </div>
        </div>

        {/* Item & Story Teaser */}
        <div className="flex flex-col gap-2">
           <h4 className="text-headline-small font-black text-on-surface leading-tight tracking-tight">
             {need.item_name}
           </h4>
           <div className="relative">
             <p className="text-body-medium text-on-surface-variant/90 line-clamp-2 leading-relaxed italic pr-4">
               "{need.story}"
             </p>
             <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white to-transparent" />
           </div>
        </div>

        {/* Progress Section */}
        <div className="flex flex-col gap-3 mt-auto pt-2">
          <div className="flex justify-between items-end">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-black text-primary tracking-[0.2em]">
                   Funding Progress
                </span>
                <span className="text-display-small font-black text-on-surface leading-none">
                   {Math.min(100, Math.floor(percentage))}<span className="text-body-medium opacity-50 ml-0.5">%</span>
                </span>
             </div>
             <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em]">
                   Time Left
                </span>
                <div className="bg-secondary/10 px-2 py-1 rounded-lg flex items-center gap-1.5 text-secondary">
                   <Calendar className="h-3.5 w-3.5" />
                   <span className="text-label-medium font-black">{daysRemaining} Days</span>
                </div>
             </div>
          </div>
          <ProgressBar percentage={percentage} className="h-3 rounded-full bg-black/5" />
        </div>

        {/* Stats & Badge Section */}
        <div className="flex items-center justify-between pt-5 border-t border-black/[0.03]">
          <div className="flex items-center gap-4">
             <Badge level={need.profile?.badge_level === 'level_4_platform_verified' ? 4 : need.profile?.badge_level === 'level_3_established' ? 3 : need.profile?.badge_level === 'level_2_trusted_tradesperson' ? 2 : need.profile?.badge_level === 'level_1_community_member' ? 1 : 0} className="scale-100" />
             <div className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-error/5 transition-colors group/heart cursor-pointer">
                <Heart className="h-4 w-4 fill-error/10 text-error group-hover/heart:fill-error transition-all" />
                <span className="text-label-small font-black text-on-surface">{need.profile?.vouch_count || 0}</span>
             </div>
          </div>
          <Button onClick={(e) => { e.stopPropagation(); onBack?.(); }} variant="secondary" className="rounded-2xl px-6 font-black bg-primary/5 hover:bg-primary text-primary hover:text-white border-none shadow-none transition-all duration-300">
            Pledge
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function NeedCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full border-outline-variant/30">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
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
        <div className="flex justify-between items-center pt-2 border-t border-outline-variant/30">
           <Skeleton className="h-6 w-24 rounded-full" />
           <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    </Card>
  );
}
