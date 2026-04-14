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
  need: Need & { profile?: Profile };
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
    <Card hoverLift className={cn("overflow-hidden flex flex-col h-full bg-surface border-outline-variant/50", className)}>
      {/* Visual Header: Image + Trade Badge */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-variant">
        {need.photo_url ? (
          <img
            src={need.photo_url}
            alt={need.item_name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
             <TradeIcon className="h-12 w-12 opacity-20" />
          </div>
        )}
        
        {/* Floating Category Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-surface/90 backdrop-blur-md px-3 py-1 text-label-small font-bold text-on-surface shadow-sm border border-outline-variant/30 capitalize">
          <TradeIcon className="h-3.5 w-3.5 text-primary" />
          {need.profile?.trade_category?.replace("_", " ")}
        </div>

        {/* Cost Overlay */}
        <div className="absolute bottom-3 right-3 rounded-full bg-primary/90 backdrop-blur-md px-3 py-1 text-label-small font-black text-on-primary shadow-lg">
          {formattedCost}
        </div>
      </div>

      <div className="flex flex-col flex-grow p-5 gap-4">
        {/* Profile Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
             <img 
               src={need.profile?.photo_url || "/api/placeholder/48/48"} 
               alt={need.profile?.name || "Tradesperson"} 
               className="h-10 w-10 rounded-full object-cover border-2 border-surface shadow-sm"
             />
             <div className="absolute -bottom-1 -right-1 bg-badge-2 rounded-full p-0.5 border-2 border-surface shadow-xs">
                <ShieldCheck className="h-2.5 w-2.5 text-white" />
             </div>
          </div>
          <div className="flex flex-col min-w-0">
             <h3 className="text-title-medium font-black text-on-surface truncate">
                {need.profile?.name || "Anonymous Tradesperson"}
             </h3>
             <div className="flex items-center gap-1.5 text-on-surface-variant">
                <MapPin className="h-3 w-3" />
                <span className="text-body-small truncate italic">
                  {need.profile?.location_lga}, {need.profile?.location_state?.toUpperCase()}
                </span>
             </div>
          </div>
        </div>

        {/* Item & Story Teaser */}
        <div className="flex flex-col gap-1.5">
           <h4 className="text-title-medium font-black text-primary line-clamp-1">
             {need.item_name}
           </h4>
           <p className="text-body-small text-on-surface-variant line-clamp-2 leading-relaxed italic">
             "{need.story}"
           </p>
        </div>

        {/* Progress Section */}
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex justify-between items-end">
             <div className="flex flex-col">
                <span className="text-label-small uppercase font-bold text-on-surface-variant tracking-wider">
                   Progress
                </span>
                <span className="text-body-large font-black text-on-surface leading-none py-0.5">
                   {Math.min(100, Math.floor(percentage))}%
                </span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-label-small uppercase font-bold text-on-surface-variant tracking-wider">
                   Remaining
                </span>
                <span className="text-body-large font-black text-primary leading-none py-0.5 flex items-center gap-1">
                   <Calendar className="h-4 w-4" />
                   {daysRemaining} Days
                </span>
             </div>
          </div>
          <ProgressBar percentage={percentage} className="h-2.5" />
        </div>

        {/* Stats & Badge Section */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
          <div className="flex items-center gap-3">
             <Badge level={need.profile?.badge_level === 'level_4_platform_verified' ? 4 : need.profile?.badge_level === 'level_3_established' ? 3 : need.profile?.badge_level === 'level_2_trusted_tradesperson' ? 2 : need.profile?.badge_level === 'level_1_community_member' ? 1 : 0} className="scale-90 origin-left" />
             <div className="flex items-center gap-1 text-on-surface-variant">
                <Heart className="h-3.5 w-3.5 fill-error/20 text-error" />
                <span className="text-label-small font-bold">{need.profile?.vouch_count || 0}</span>
             </div>
          </div>
          <Button onClick={onBack} size="sm" className="rounded-xl px-4 font-bold shadow-sm">
            Back Now
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
