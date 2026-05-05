-- Apply this in Supabase SQL Editor on an existing project.
-- It hardens partnership creation, isolates chat messages by partnership,
-- and moves the uploads bucket to private access with owner-folder policies.

ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE children
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS blood_type TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS medications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sus_number TEXT,
ADD COLUMN IF NOT EXISTS health_insurance TEXT,
ADD COLUMN IF NOT EXISTS health_insurance_number TEXT,
ADD COLUMN IF NOT EXISTS school_name TEXT,
ADD COLUMN IF NOT EXISTS school_grade TEXT,
ADD COLUMN IF NOT EXISTS school_email TEXT,
ADD COLUMN IF NOT EXISTS school_address TEXT,
ADD COLUMN IF NOT EXISTS school_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS school_phone TEXT,
ADD COLUMN IF NOT EXISTS height_cm NUMERIC,
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS medical_history TEXT,
ADD COLUMN IF NOT EXISTS emotional_notes TEXT,
ADD COLUMN IF NOT EXISTS behavioral_notes TEXT,
ADD COLUMN IF NOT EXISTS spiritual_notes TEXT,
ADD COLUMN IF NOT EXISTS social_activities TEXT,
ADD COLUMN IF NOT EXISTS cultural_activities TEXT,
ADD COLUMN IF NOT EXISTS activities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE calendar_events
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS all_day BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other',
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#0e8fe7',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS responsible_parent TEXT,
ADD COLUMN IF NOT EXISTS recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurring_pattern TEXT,
ADD COLUMN IF NOT EXISTS notified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS paid_by TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE gift_suggestions
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS price_estimate NUMERIC,
ADD COLUMN IF NOT EXISTS link TEXT,
ADD COLUMN IF NOT EXISTS occasion TEXT DEFAULT 'birthday',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'suggested',
ADD COLUMN IF NOT EXISTS suggested_by TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE health_records
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'appointment',
ADD COLUMN IF NOT EXISTS doctor_name TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS height_cm NUMERIC,
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS next_appointment DATE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE school_records
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'grade',
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS grade NUMERIC,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE child_vaccinations
ADD COLUMN IF NOT EXISTS vaccine_catalog_id UUID REFERENCES vaccine_catalog(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS applied_location TEXT,
ADD COLUMN IF NOT EXISTS lot_number TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS partnership_billing (
  partnership_id UUID PRIMARY KEY REFERENCES partnerships(id) ON DELETE CASCADE,
  plan_key TEXT NOT NULL DEFAULT 'shared_family',
  currency TEXT NOT NULL DEFAULT 'BRL',
  monthly_total_cents INTEGER NOT NULL DEFAULT 3000,
  payer_amount_cents INTEGER NOT NULL DEFAULT 1500,
  provider TEXT,
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  parent_1_status TEXT NOT NULL DEFAULT 'pending' CHECK (parent_1_status IN ('pending','paid','overdue','exempt','cancelled')),
  parent_2_status TEXT NOT NULL DEFAULT 'pending' CHECK (parent_2_status IN ('pending','paid','overdue','exempt','cancelled')),
  parent_1_checkout_url TEXT,
  parent_2_checkout_url TEXT,
  parent_1_paid_at TIMESTAMPTZ,
  parent_2_paid_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE partnership_billing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "partnership_billing_select" ON partnership_billing;
CREATE POLICY "partnership_billing_select" ON partnership_billing FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM partnerships
    WHERE partnerships.id = partnership_billing.partnership_id
      AND (partnerships.parent_1_id = auth.uid() OR partnerships.parent_2_id = auth.uid())
  )
);

CREATE OR REPLACE FUNCTION get_partnership_storage_usage(p_partnership_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_parent_1 UUID;
  v_parent_2 UUID;
  v_total BIGINT;
BEGIN
  SELECT parent_1_id, parent_2_id
  INTO v_parent_1, v_parent_2
  FROM partnerships
  WHERE id = p_partnership_id
    AND (parent_1_id = auth.uid() OR parent_2_id = auth.uid());

  IF v_parent_1 IS NULL THEN
    RAISE EXCEPTION 'partnership_not_found';
  END IF;

  SELECT COALESCE(SUM(COALESCE((metadata->>'size')::BIGINT, 0)), 0)
  INTO v_total
  FROM storage.objects
  WHERE bucket_id = 'uploads'
    AND (storage.foldername(name))[2] IN (v_parent_1::TEXT, v_parent_2::TEXT);

  RETURN v_total;
END;
$$;

REVOKE ALL ON FUNCTION get_partnership_storage_usage(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_partnership_storage_usage(UUID) TO authenticated;

DROP POLICY IF EXISTS "partnerships_insert" ON partnerships;
CREATE POLICY "partnerships_insert" ON partnerships FOR INSERT WITH CHECK (
  parent_1_id = auth.uid()
  AND parent_2_id IS NULL
  AND status = 'pending'
  AND invite_token IS NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS one_active_partnership_parent_1
  ON partnerships (parent_1_id)
  WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS one_active_partnership_parent_2
  ON partnerships (parent_2_id)
  WHERE status = 'active' AND parent_2_id IS NOT NULL;

CREATE OR REPLACE FUNCTION accept_partnership_invite(
  p_invite_token TEXT,
  p_parent_name TEXT,
  p_parent_email TEXT
)
RETURNS partnerships
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partnership partnerships;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  UPDATE partnerships
  SET
    parent_2_id = auth.uid(),
    parent_2_email = p_parent_email,
    parent_2_name = p_parent_name,
    status = 'active',
    invite_token = NULL,
    updated_at = NOW()
  WHERE invite_token = p_invite_token
    AND status = 'pending'
    AND parent_2_id IS NULL
    AND (parent_2_email IS NULL OR LOWER(parent_2_email) = LOWER(p_parent_email))
    AND parent_1_id <> auth.uid()
  RETURNING * INTO v_partnership;

  IF v_partnership.id IS NULL THEN
    RAISE EXCEPTION 'invalid_or_expired_invite';
  END IF;

  INSERT INTO partnership_billing (partnership_id)
  VALUES (v_partnership.id)
  ON CONFLICT (partnership_id) DO NOTHING;

  RETURN v_partnership;
END;
$$;

REVOKE ALL ON FUNCTION accept_partnership_invite(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION accept_partnership_invite(TEXT, TEXT, TEXT) TO authenticated;

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE;

UPDATE chat_messages cm
SET partnership_id = p.id
FROM partnerships p
WHERE cm.partnership_id IS NULL
  AND p.status = 'active'
  AND (cm.sender_id = p.parent_1_id OR cm.sender_id = p.parent_2_id);

DELETE FROM chat_messages WHERE partnership_id IS NULL;

ALTER TABLE chat_messages
ALTER COLUMN partnership_id SET NOT NULL;

DROP POLICY IF EXISTS "chat_messages_select" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_delete" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_update" ON chat_messages;

CREATE POLICY "chat_messages_select" ON chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM partnerships
    WHERE id = chat_messages.partnership_id
      AND status = 'active'
      AND (parent_1_id = auth.uid() OR parent_2_id = auth.uid())
  )
);

CREATE POLICY "chat_messages_insert" ON chat_messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM partnerships
    WHERE id = chat_messages.partnership_id
      AND status = 'active'
      AND (parent_1_id = auth.uid() OR parent_2_id = auth.uid())
  )
);

CREATE POLICY "chat_messages_delete" ON chat_messages FOR DELETE USING (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM partnerships
    WHERE id = chat_messages.partnership_id
      AND status = 'active'
      AND (parent_1_id = auth.uid() OR parent_2_id = auth.uid())
  )
);

CREATE OR REPLACE FUNCTION mark_partnership_messages_read(p_partnership_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_1 UUID;
  v_parent_2 UUID;
BEGIN
  SELECT parent_1_id, parent_2_id
  INTO v_parent_1, v_parent_2
  FROM partnerships
  WHERE id = p_partnership_id
    AND status = 'active'
    AND (parent_1_id = auth.uid() OR parent_2_id = auth.uid());

  IF v_parent_1 IS NULL THEN
    RAISE EXCEPTION 'partnership_not_found';
  END IF;

  UPDATE chat_messages
  SET read = TRUE
  WHERE read = FALSE
    AND partnership_id = p_partnership_id
    AND sender_id <> auth.uid()
    AND sender_id IN (v_parent_1, v_parent_2);
END;
$$;

REVOKE ALL ON FUNCTION mark_partnership_messages_read(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION mark_partnership_messages_read(UUID) TO authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "uploads_user_read" ON storage.objects;
DROP POLICY IF EXISTS "uploads_user_insert" ON storage.objects;
DROP POLICY IF EXISTS "uploads_user_update" ON storage.objects;

CREATE POLICY "uploads_user_read" ON storage.objects FOR SELECT USING (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[2] IN (
    SELECT parent_1_id::text FROM partnerships WHERE parent_1_id = auth.uid() OR parent_2_id = auth.uid()
    UNION
    SELECT parent_2_id::text FROM partnerships WHERE parent_1_id = auth.uid() OR parent_2_id = auth.uid()
    UNION
    SELECT auth.uid()::text
  )
);

CREATE POLICY "uploads_user_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "uploads_user_update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
