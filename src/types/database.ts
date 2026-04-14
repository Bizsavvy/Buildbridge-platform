export type UserRole = 'tradesperson' | 'backer' | 'community_leader' | 'admin';

export enum BadgeLevel {
  LEVEL_0_UNVERIFIED = 'level_0_unverified',
  LEVEL_1_COMMUNITY_MEMBER = 'level_1_community_member',
  LEVEL_2_TRUSTED_TRADESPERSON = 'level_2_trusted_tradesperson',
  LEVEL_3_ESTABLISHED = 'level_3_established',
  LEVEL_4_PLATFORM_VERIFIED = 'level_4_platform_verified',
}

export enum NeedStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  FUNDED = 'funded',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

export enum NotificationChannel {
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
}

export type TradeCategory = 'tailor' | 'carpenter' | 'welder' | 'cobbler' | 'food_processor' | 'market_trader' | 'baker' | 'mechanic' | 'electrician' | 'plumber' | 'hair_stylist' | 'blacksmith' | 'other';
export type VerificationProvider = 'dojah' | 'prembly' | 'manual';
export type NotificationType = 'pledge_received' | 'first_pledge_celebration' | 'milestone_50' | 'milestone_80' | 'milestone_100' | 'proof_nudge_day3' | 'proof_nudge_day7' | 'proof_nudge_day14' | 'proof_submitted' | 'zero_pledge_24h' | 'disbursement_complete' | 'vouch_received' | 'need_approved' | 'need_rejected' | 'account_flagged';
export type RelationshipType = 'customer' | 'neighbor' | 'market_colleague' | 'apprentice_master' | 'family' | 'cooperative_member' | 'association_member' | 'other';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested' | 'flagged_fraud';

export interface User {
  id: string; // UUID
  phone: string;
  phone_verified_at: string | null;
  email: string | null;
  email_verified_at: string | null;
  name: string;
  role: UserRole;
  password_hash: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  failed_login_attempts: number;
  account_locked_until: string | null;
  two_factor_enabled: boolean;
  is_active: boolean;
  is_suspended: boolean;
  suspension_reason: string | null;
  suspended_at: string | null;
  suspended_by: string | null;
  data_deletion_requested_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string; // UUID
  user_id: string; // UUID
  trade_category: TradeCategory | null;
  trade_other_description: string | null;
  years_experience: number | null;
  apprentices_trained: number;
  certifications: string[] | null;
  location_lga: string | null;
  location_state: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  story: string | null;
  photo_url: string | null;
  photo_uploaded_at: string | null;
  badge_level: BadgeLevel;
  badge_updated_at: string | null;
  delivered_count: number;
  vouch_count: number;
  contact_info_visible: boolean;
  pledge_history_visible: boolean;
  vouch_details_visible: boolean;
  income_visible: boolean;
  trust_score: number;
  fraud_flags: number;
  last_fraud_review_at: string | null;
  notify_via_sms: boolean;
  notify_via_whatsapp: boolean;
  notify_via_email: boolean;
  can_vouch: boolean;
  vouching_suspended_until: string | null;
  can_create_needs: boolean;
  created_at: string;
  updated_at: string;
}

export interface Need {
  id: string; // UUID
  profile_id: string; // UUID
  item_name: string;
  /** Amount in kobo (NGN minor units) */
  item_cost: number;
  photo_url: string;
  photo_geotag_lat: number | null;
  photo_geotag_lng: number | null;
  photo_uploaded_at: string | null;
  story: string;
  impact_statement: string | null;
  impact_statement_source: string;
  deadline: string; // DATE
  created_at: string;
  published_at: string | null;
  completed_at: string | null;
  expired_at: string | null;
  status: NeedStatus;
  moderation_notes: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  rejection_reason: string | null;
  /** Amount in kobo (NGN minor units) */
  funded_amount: number;
  pledge_count: number;
  funding_percentage: number;
  disbursed_at: string | null;
  /** Amount in kobo (NGN minor units) */
  disbursement_amount: number | null;
  disbursement_reference: string | null;
  proof_photo_url: string | null;
  proof_video_url: string | null;
  proof_caption: string | null;
  proof_submitted_at: string | null;
  proof_nudge_count: number;
  last_proof_nudge_at: string | null;
  visibility_boost_until: string | null;
  featured: boolean;
  featured_until: string | null;
  reverse_image_search_flagged: boolean;
  duplicate_detection_flagged: boolean;
  updated_at: string;
}

export interface Pledge {
  id: string; // UUID
  need_id: string; // UUID
  backer_user_id: string; // UUID
  /** Amount in kobo (NGN minor units) */
  amount: number;
  currency: string;
  fee_breakdown_json: {
    platform_fee: number; // in kobo
    processing_fee: number; // in kobo
    tradesperson_receives: number; // in kobo
  };
  payment_provider: string | null;
  payment_reference: string | null;
  payment_status: string;
  paid_at: string | null;
  original_currency: string | null;
  /** Amount in minor units of original_currency */
  original_amount: number | null;
  exchange_rate: number | null;
  message: string | null;
  contact_revealed_at: string | null;
  disbursed_to_tradesperson: boolean;
  disbursed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vouch {
  id: string; // UUID
  voucher_user_id: string;
  recipient_profile_id: string;
  relationship_type: RelationshipType;
  relationship_duration_years: number | null;
  statement: string;
  vouch_weight: number;
  is_community_leader_vouch: boolean;
  status: ModerationStatus;
  disputed: boolean;
  dispute_reason: string | null;
  disputed_at: string | null;
  flagged_as_fraud: boolean;
  fraud_review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Verification {
  id: string; // UUID
  profile_id: string; // UUID
  nin_hash: string | null;
  bvn_hash: string | null;
  nin_verified_at: string | null;
  bvn_verified_at: string | null;
  selfie_url: string | null;
  selfie_match_score: number | null;
  selfie_matched_at: string | null;
  provider: VerificationProvider;
  provider_reference: string | null;
  provider_response_json: any | null;
  verified: boolean;
  verification_failed: boolean;
  failure_reason: string | null;
  manual_review_required: boolean;
  manual_review_completed: boolean;
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImpactWallSubmission {
  id: string; // UUID
  need_id: string; // UUID
  profile_id: string; // UUID
  photo_url: string | null;
  video_url: string | null;
  video_thumbnail_url: string | null;
  caption: string;
  opted_in_at: string;
  public_display_consent: boolean;
  moderation_status: ModerationStatus;
  moderated_by: string | null;
  moderation_notes: string | null;
  moderated_at: string | null;
  published_at: string | null;
  unpublished_at: string | null;
  featured: boolean;
  featured_until: string | null;
  view_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}
