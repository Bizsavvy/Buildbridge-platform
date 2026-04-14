import { 
  Scissors, 
  Hammer, 
  Flame, 
  Store, 
  Settings, 
  Zap, 
  Droplets, 
  Sparkles, 
  Utensils, 
  MoreHorizontal,
  ChefHat
} from "lucide-react"

export const TRADE_CATEGORIES = [
  { id: 'tailor', label: 'Tailor', icon: Scissors },
  { id: 'carpenter', label: 'Carpenter', icon: Hammer },
  { id: 'welder', label: 'Welder', icon: Flame },
  { id: 'cobbler', label: 'Cobbler', icon: Hammer },
  { id: 'food_processor', label: 'Food Processor', icon: Utensils },
  { id: 'market_trader', label: 'Market Trader', icon: Store },
  { id: 'baker', label: 'Baker', icon: ChefHat },
  { id: 'mechanic', label: 'Mechanic', icon: Settings },
  { id: 'electrician', label: 'Electrician', icon: Zap },
  { id: 'plumber', label: 'Plumber', icon: Droplets },
  { id: 'hair_stylist', label: 'Hair Stylist', icon: Sparkles },
  { id: 'blacksmith', label: 'Blacksmith', icon: Hammer },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
]

export const TRADE_ICONS_MAP: Record<string, any> = TRADE_CATEGORIES.reduce((acc, cat) => ({
  ...acc,
  [cat.id]: cat.icon
}), {})

export const NIGERIAN_STATES = [
  'Lagos', 'Oyo', 'Anambra', 'Rivers', 'Kano', 'Kaduna', 'Abuja FCT', 'Ogun', 'Enugu', 'Delta', 'Edo', 'Imo', 'Kwara', 'Osun', 'Ondo', 'Abia', 'Ekiti', 'Plateau', 'Bayelsa', 'Cross River'
]
