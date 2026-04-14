-- ============================================================================
-- BuildBridge Schema v1.0.0
-- Tables + Constraints + RLS only. No custom indexes, no functions, no triggers.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM (
  'tradesperson', 'backer', 'community_leader', 'admin'
);

CREATE TYPE trade_category AS ENUM (
  'tailor', 'carpenter', 'welder', 'cobbler', 'food_processor',
  'market_trader', 'baker', 'mechanic', 'electrician', 'plumber',
  'hair_stylist', 'blacksmith', 'other'
);

CREATE TYPE badge_level AS ENUM (
  'level_0_unverified', 'level_1_community_member',
  'level_2_trusted_tradesperson', 'level_3_established',
  'level_4_platform_verified'
);

CREATE TYPE need_status AS ENUM (
  'draft', 'pending_review', 'active', 'funded',
  'completed', 'expired', 'rejected', 'flagged'
);

CREATE TYPE verification_provider AS ENUM ('dojah', 'prembly', 'manual');

CREATE TYPE notification_channel AS ENUM ('sms', 'whatsapp', 'email');

CREATE TYPE notification_type AS ENUM (
  'pledge_received', 'first_pledge_celebration',
  'milestone_50', 'milestone_80', 'milestone_100',
  'proof_nudge_day3', 'proof_nudge_day7', 'proof_nudge_day14',
  'proof_submitted', 'zero_pledge_24h', 'disbursement_complete',
  'vouch_received', 'need_approved', 'need_rejected', 'account_flagged'
);

CREATE TYPE relationship_type AS ENUM (
  'customer', 'neighbor', 'market_colleague', 'apprentice_master',
  'family', 'cooperative_member', 'association_member', 'other'
);

CREATE TYPE moderation_status AS ENUM (
  'pending', 'approved', 'rejected', 'revision_requested', 'flagged_fraud'
);

CREATE TYPE share_card_format AS ENUM (
  'whatsapp_16_9', 'instagram_9_16', 'twitter_2_1', 'facebook_1_91_1'
);

CREATE TYPE report_reason AS ENUM (
  'fake_identity', 'duplicate_listing', 'fraudulent_vouch',
  'inappropriate_content', 'stock_photo', 'false_information', 'spam', 'other'
);

CREATE TYPE nigerian_state AS ENUM (
  'lagos', 'oyo', 'anambra', 'rivers', 'kano', 'kaduna', 'abuja_fct',
  'ogun', 'enugu', 'delta', 'edo', 'imo', 'kwara', 'osun', 'ondo',
  'abia', 'ekiti', 'plateau', 'bayelsa', 'cross_river'
);


-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL UNIQUE,
  phone_verified_at TIMESTAMPTZ,
  email VARCHAR(255) UNIQUE,
  email_verified_at TIMESTAMPTZ,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'tradesperson',
  password_hash TEXT,
  last_login_at TIMESTAMPTZ,
  last_login_ip INET,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMPTZ,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  suspended_at TIMESTAMPTZ,
  suspended_by UUID REFERENCES users(id),
  data_deletion_requested_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_phone CHECK (phone ~ '^\+?[0-9]{10,15}$'),
  CONSTRAINT valid_email CHECK (
    email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL
  ),
  CONSTRAINT phone_verified_when_registered CHECK (phone_verified_at IS NOT NULL)
);


CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  trade_category trade_category,
  trade_other_description VARCHAR(100),
  years_experience INTEGER CHECK (years_experience >= 0 AND years_experience <= 80),
  apprentices_trained INTEGER DEFAULT 0 CHECK (apprentices_trained >= 0),
  certifications TEXT[],
  location_lga VARCHAR(100),
  location_state nigerian_state,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  story TEXT CHECK (char_length(story) <= 300),
  photo_url TEXT,
  photo_uploaded_at TIMESTAMPTZ,
  badge_level badge_level DEFAULT 'level_0_unverified',
  badge_updated_at TIMESTAMPTZ,
  delivered_count INTEGER DEFAULT 0,
  vouch_count INTEGER DEFAULT 0,
  contact_info_visible BOOLEAN DEFAULT TRUE,
  pledge_history_visible BOOLEAN DEFAULT TRUE,
  vouch_details_visible BOOLEAN DEFAULT TRUE,
  income_visible BOOLEAN DEFAULT FALSE,
  trust_score DECIMAL(3, 2) DEFAULT 1.00 CHECK (trust_score >= 0 AND trust_score <= 1.00),
  fraud_flags INTEGER DEFAULT 0,
  last_fraud_review_at TIMESTAMPTZ,
  notify_via_sms BOOLEAN DEFAULT TRUE,
  notify_via_whatsapp BOOLEAN DEFAULT TRUE,
  notify_via_email BOOLEAN DEFAULT FALSE,
  can_vouch BOOLEAN DEFAULT FALSE,
  vouching_suspended_until TIMESTAMPTZ,
  can_create_needs BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_coordinates CHECK (
    (location_latitude BETWEEN -90 AND 90 AND location_longitude BETWEEN -180 AND 180)
    OR (location_latitude IS NULL AND location_longitude IS NULL)
  )
);


CREATE TABLE needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_name VARCHAR(200) NOT NULL,
  item_cost DECIMAL(12, 2) NOT NULL CHECK (item_cost > 0 AND item_cost <= 1000000),
  photo_url TEXT NOT NULL,
  photo_geotag_lat DECIMAL(10, 8),
  photo_geotag_lng DECIMAL(11, 8),
  photo_uploaded_at TIMESTAMPTZ,
  story TEXT NOT NULL CHECK (char_length(story) <= 150),
  impact_statement TEXT CHECK (char_length(impact_statement) <= 200),
  impact_statement_source VARCHAR(20) DEFAULT 'ai_generated',
  deadline DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  status need_status DEFAULT 'draft',
  moderation_notes TEXT,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMPTZ,
  rejection_reason TEXT,
  funded_amount DECIMAL(12, 2) DEFAULT 0 CHECK (funded_amount >= 0),
  pledge_count INTEGER DEFAULT 0 CHECK (pledge_count >= 0),
  funding_percentage DECIMAL(5, 2) GENERATED ALWAYS AS ((funded_amount / item_cost) * 100) STORED,
  disbursed_at TIMESTAMPTZ,
  disbursement_amount DECIMAL(12, 2),
  disbursement_reference VARCHAR(100),
  proof_photo_url TEXT,
  proof_video_url TEXT,
  proof_caption TEXT CHECK (char_length(proof_caption) <= 300),
  proof_submitted_at TIMESTAMPTZ,
  proof_nudge_count INTEGER DEFAULT 0,
  last_proof_nudge_at TIMESTAMPTZ,
  visibility_boost_until TIMESTAMPTZ,
  featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  reverse_image_search_flagged BOOLEAN DEFAULT FALSE,
  duplicate_detection_flagged BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_geotag CHECK (
    (photo_geotag_lat BETWEEN -90 AND 90 AND photo_geotag_lng BETWEEN -180 AND 180)
    OR (photo_geotag_lat IS NULL AND photo_geotag_lng IS NULL)
  ),
  CONSTRAINT proof_requires_completion CHECK (
    (status = 'completed' AND proof_submitted_at IS NOT NULL)
    OR status != 'completed'
  ),
  CONSTRAINT funded_amount_not_exceeds_cost CHECK (funded_amount <= item_cost * 1.1)
);


CREATE TABLE pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  backer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'NGN',
  fee_breakdown_json JSONB NOT NULL,
  payment_provider VARCHAR(20),
  payment_reference VARCHAR(100) UNIQUE,
  payment_status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  original_currency VARCHAR(3),
  original_amount DECIMAL(12, 2),
  exchange_rate DECIMAL(10, 6),
  message TEXT CHECK (char_length(message) <= 500),
  contact_revealed_at TIMESTAMPTZ,
  disbursed_to_tradesperson BOOLEAN DEFAULT FALSE,
  disbursed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_fee_breakdown CHECK (
    jsonb_typeof(fee_breakdown_json) = 'object' AND
    (fee_breakdown_json->>'platform_fee')::DECIMAL >= 0 AND
    (fee_breakdown_json->>'processing_fee')::DECIMAL >= 0 AND
    (fee_breakdown_json->>'tradesperson_receives')::DECIMAL > 0
  ),
  CONSTRAINT international_pledge_complete CHECK (
    (original_currency IS NOT NULL AND original_amount IS NOT NULL AND exchange_rate IS NOT NULL)
    OR original_currency IS NULL
  )
);


CREATE TABLE vouches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_type relationship_type NOT NULL,
  relationship_duration_years INTEGER CHECK (relationship_duration_years >= 0 AND relationship_duration_years <= 50),
  statement TEXT NOT NULL CHECK (char_length(statement) >= 20 AND char_length(statement) <= 300),
  vouch_weight DECIMAL(3, 2) DEFAULT 1.00,
  is_community_leader_vouch BOOLEAN DEFAULT FALSE,
  status moderation_status DEFAULT 'approved',
  disputed BOOLEAN DEFAULT FALSE,
  dispute_reason TEXT,
  disputed_at TIMESTAMPTZ,
  flagged_as_fraud BOOLEAN DEFAULT FALSE,
  fraud_review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_vouch UNIQUE (voucher_user_id, recipient_profile_id)
);


CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  nin_hash VARCHAR(64),
  bvn_hash VARCHAR(64),
  nin_verified_at TIMESTAMPTZ,
  bvn_verified_at TIMESTAMPTZ,
  selfie_url TEXT,
  selfie_match_score DECIMAL(3, 2) CHECK (selfie_match_score >= 0 AND selfie_match_score <= 1.00),
  selfie_matched_at TIMESTAMPTZ,
  provider verification_provider NOT NULL,
  provider_reference VARCHAR(100),
  provider_response_json JSONB,
  verified BOOLEAN DEFAULT FALSE,
  verification_failed BOOLEAN DEFAULT FALSE,
  failure_reason TEXT,
  manual_review_required BOOLEAN DEFAULT FALSE,
  manual_review_completed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT nin_or_bvn_required CHECK (nin_hash IS NOT NULL OR bvn_hash IS NOT NULL),
  CONSTRAINT verified_requires_hash CHECK (
    (verified = TRUE AND (nin_hash IS NOT NULL OR bvn_hash IS NOT NULL))
    OR verified = FALSE
  )
);


CREATE TABLE impact_wall_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL UNIQUE REFERENCES needs(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT,
  video_url TEXT,
  video_thumbnail_url TEXT,
  caption TEXT NOT NULL CHECK (char_length(caption) >= 20 AND char_length(caption) <= 500),
  opted_in_at TIMESTAMPTZ NOT NULL,
  public_display_consent BOOLEAN DEFAULT TRUE,
  moderation_status moderation_status DEFAULT 'pending',
  moderated_by UUID REFERENCES users(id),
  moderation_notes TEXT,
  moderated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  unpublished_at TIMESTAMPTZ,
  featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT media_required CHECK (photo_url IS NOT NULL OR video_url IS NOT NULL),
  CONSTRAINT published_requires_approval CHECK (
    (published_at IS NOT NULL AND moderation_status = 'approved')
    OR published_at IS NULL
  )
);


CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  message TEXT NOT NULL,
  message_data JSONB,
  need_id UUID REFERENCES needs(id) ON DELETE SET NULL,
  pledge_id UUID REFERENCES pledges(id) ON DELETE SET NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  failed BOOLEAN DEFAULT FALSE,
  failure_reason TEXT,
  provider_reference VARCHAR(100),
  provider_response_json JSONB,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT delivered_requires_sent CHECK (
    (delivered = TRUE AND sent = TRUE) OR delivered = FALSE
  )
);


CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  milestone_pct INTEGER NOT NULL CHECK (milestone_pct IN (50, 80, 100)),
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  backers_notified BOOLEAN DEFAULT FALSE,
  backers_notified_at TIMESTAMPTZ,
  notification_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_milestone UNIQUE (need_id, milestone_pct)
);


CREATE TABLE share_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  format share_card_format NOT NULL,
  image_url TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generator_version VARCHAR(10) DEFAULT '1.0',
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  last_shared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_card UNIQUE (need_id, format)
);


CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  need_id UUID REFERENCES needs(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vouch_id UUID REFERENCES vouches(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  description TEXT CHECK (char_length(description) >= 10 AND char_length(description) <= 1000),
  evidence_urls TEXT[],
  status moderation_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT entity_required CHECK (
    need_id IS NOT NULL OR profile_id IS NOT NULL OR vouch_id IS NOT NULL
  )
);


CREATE TABLE vouch_velocity_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL,
  vouches_given_count INTEGER DEFAULT 0 CHECK (vouches_given_count >= 0),
  limit_exceeded BOOLEAN DEFAULT FALSE,
  limit_exceeded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_month UNIQUE (user_id, month_year),
  CONSTRAINT valid_month_format CHECK (month_year ~ '^\d{4}-\d{2}$')
);


CREATE TABLE community_leader_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name VARCHAR(255) NOT NULL,
  organization_type VARCHAR(100),
  position VARCHAR(100),
  verification_document_url TEXT,
  endorsement_statement TEXT NOT NULL CHECK (char_length(endorsement_statement) >= 50),
  member_count INTEGER CHECK (member_count > 0),
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_leader_profile UNIQUE (leader_user_id, profile_id)
);


CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  ip_address INET,
  user_agent TEXT,
  request_metadata JSONB,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE fraud_detection_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  need_id UUID REFERENCES needs(id) ON DELETE CASCADE,
  vouch_id UUID REFERENCES vouches(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'low',
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1.00),
  evidence_json JSONB,
  detection_method VARCHAR(100),
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  false_positive BOOLEAN DEFAULT FALSE,
  action_taken TEXT,
  action_taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM users WHERE id = auth.uid())
  );

CREATE POLICY "users_select_admin" ON users
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "users_update_admin" ON users
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());


ALTER TABLE needs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "needs_select_public" ON needs
  FOR SELECT USING (status IN ('active', 'completed', 'funded'));

CREATE POLICY "needs_select_own" ON needs
  FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "needs_insert_own" ON needs
  FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "needs_update_own" ON needs
  FOR UPDATE
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND status IN ('draft', 'pending_review')
  );

CREATE POLICY "needs_admin_all" ON needs
  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pledges_select_own" ON pledges
  FOR SELECT USING (backer_user_id = auth.uid());

CREATE POLICY "pledges_select_recipient" ON pledges
  FOR SELECT
  USING (
    need_id IN (
      SELECT needs.id FROM needs
      JOIN profiles ON needs.profile_id = profiles.id
      WHERE profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "pledges_insert_own" ON pledges
  FOR INSERT WITH CHECK (backer_user_id = auth.uid());

CREATE POLICY "pledges_admin_select" ON pledges
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE vouches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vouches_select_approved" ON vouches
  FOR SELECT USING (status = 'approved');

CREATE POLICY "vouches_select_own" ON vouches
  FOR SELECT USING (voucher_user_id = auth.uid());

CREATE POLICY "vouches_select_recipient" ON vouches
  FOR SELECT
  USING (recipient_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "vouches_insert_eligible" ON vouches
  FOR INSERT
  WITH CHECK (
    voucher_user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND can_vouch = TRUE)
  );


ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verifications_select_own" ON verifications
  FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "verifications_insert_own" ON verifications
  FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "verifications_admin_select" ON verifications
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE impact_wall_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "impact_wall_select_published" ON impact_wall_submissions
  FOR SELECT USING (published_at IS NOT NULL AND moderation_status = 'approved');

CREATE POLICY "impact_wall_select_own" ON impact_wall_submissions
  FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "impact_wall_insert_own" ON impact_wall_submissions
  FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "impact_wall_admin_all" ON impact_wall_submissions
  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "milestones_select_own" ON milestones
  FOR SELECT
  USING (
    need_id IN (
      SELECT n.id FROM needs n
      JOIN profiles p ON n.profile_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "milestones_admin_all" ON milestones
  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE share_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "share_cards_select_public" ON share_cards
  FOR SELECT
  USING (need_id IN (SELECT id FROM needs WHERE status IN ('active', 'funded', 'completed')));

CREATE POLICY "share_cards_admin_all" ON share_cards
  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select_own" ON reports
  FOR SELECT USING (reporter_user_id = auth.uid());

CREATE POLICY "reports_insert_own" ON reports
  FOR INSERT WITH CHECK (reporter_user_id = auth.uid());

CREATE POLICY "reports_admin_all" ON reports
  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE vouch_velocity_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vouch_velocity_select_own" ON vouch_velocity_tracking
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "vouch_velocity_admin_select" ON vouch_velocity_tracking
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE community_leader_endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "endorsements_select_verified" ON community_leader_endorsements
  FOR SELECT USING (verified = TRUE);

CREATE POLICY "endorsements_select_own" ON community_leader_endorsements
  FOR SELECT USING (leader_user_id = auth.uid());

CREATE POLICY "endorsements_insert_own" ON community_leader_endorsements
  FOR INSERT WITH CHECK (leader_user_id = auth.uid());

CREATE POLICY "endorsements_admin_all" ON community_leader_endorsements
  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_select" ON audit_log
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


ALTER TABLE fraud_detection_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fraud_events_admin_select" ON fraud_detection_events
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "fraud_events_admin_all" ON fraud_detection_events
  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================================
-- SEED
-- ============================================================================

INSERT INTO users (id, phone, name, role, phone_verified_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '+2348000000000',
  'System Admin',
  'admin',
  NOW()
);
