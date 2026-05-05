-- ============================================================
-- COPARENT APP — Schema Supabase (PostgreSQL)
-- Execute este arquivo no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query > Cole e execute
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PARTNERSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_1_email TEXT,
  parent_1_name TEXT,
  parent_2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_2_email TEXT,
  parent_2_name TEXT,
  invite_token TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS one_active_partnership_parent_1
  ON partnerships (parent_1_id)
  WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS one_active_partnership_parent_2
  ON partnerships (parent_2_id)
  WHERE status = 'active' AND parent_2_id IS NOT NULL;

-- ============================================================
-- CHILDREN
-- ============================================================
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  photo_url TEXT,
  blood_type TEXT CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  allergies TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  sus_number TEXT,
  health_insurance TEXT,
  health_insurance_number TEXT,
  school_name TEXT,
  school_grade TEXT,
  school_email TEXT,
  school_address TEXT,
  school_whatsapp TEXT,
  school_phone TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  medical_history TEXT,
  emotional_notes TEXT,
  behavioral_notes TEXT,
  spiritual_notes TEXT,
  social_activities TEXT,
  cultural_activities TEXT,
  activities TEXT[] DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  parent_1_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CALENDAR EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'other' CHECK (category IN ('custody','medical','vaccine','school','activity','leisure','birthday','holiday','vacation','other')),
  color TEXT DEFAULT '#0e8fe7',
  location TEXT,
  responsible_parent TEXT,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern TEXT CHECK (recurring_pattern IN ('weekly','biweekly','monthly')),
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('income','expense')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  category TEXT DEFAULT 'other' CHECK (category IN ('food','transport','leisure','school','health','clothing','activities','other')),
  description TEXT,
  date DATE NOT NULL,
  receipt_url TEXT,
  paid_by TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','disputed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GIFT SUGGESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS gift_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price_estimate NUMERIC,
  link TEXT,
  occasion TEXT DEFAULT 'birthday' CHECK (occasion IN ('birthday','christmas','easter','childrens_day','other')),
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested','approved','purchased')),
  suggested_by TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HEALTH RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'appointment' CHECK (type IN ('vaccine','appointment','exam','measurement','incident')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  doctor_name TEXT,
  location TEXT,
  notes TEXT,
  attachment_url TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  next_appointment DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCHOOL RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS school_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'grade' CHECK (type IN ('grade','absence','meeting','incident','trip','achievement')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  subject TEXT,
  grade NUMERIC,
  notes TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VACCINE CATALOG
-- ============================================================
CREATE TABLE IF NOT EXISTS vaccine_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vaccine_key TEXT UNIQUE,
  vaccine_name TEXT NOT NULL,
  dose_label TEXT NOT NULL,
  schedule_type TEXT DEFAULT 'fixed_age' CHECK (schedule_type IN ('fixed_age','annual','conditional','manual_review')),
  window_start_months NUMERIC,
  window_start_days NUMERIC,
  window_end_months NUMERIC,
  window_end_days NUMERIC,
  min_interval_days NUMERIC,
  max_age_months NUMERIC,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHILD VACCINATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS child_vaccinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  vaccine_catalog_id UUID REFERENCES vaccine_catalog(id) ON DELETE SET NULL,
  vaccine_name TEXT NOT NULL,
  dose_label TEXT NOT NULL,
  applied_date DATE NOT NULL,
  applied_location TEXT,
  lot_number TEXT,
  attachment_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_vaccinations ENABLE ROW LEVEL SECURITY;

-- PARTNERSHIPS: users can see/manage their own partnerships
CREATE POLICY "partnerships_select" ON partnerships FOR SELECT USING (parent_1_id = auth.uid() OR parent_2_id = auth.uid());
CREATE POLICY "partnerships_insert" ON partnerships FOR INSERT WITH CHECK (
  parent_1_id = auth.uid()
  AND parent_2_id IS NULL
  AND status = 'pending'
  AND invite_token IS NOT NULL
);
CREATE POLICY "partnerships_delete" ON partnerships FOR DELETE USING (parent_1_id = auth.uid() OR parent_2_id = auth.uid());

-- Accepting an invite needs to update a row before the invited user is parent_2.
-- Keep that flow in a SECURITY DEFINER function instead of exposing invite tokens
-- or allowing broad UPDATEs through RLS.
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
    AND parent_1_id <> auth.uid()
  RETURNING * INTO v_partnership;

  IF v_partnership.id IS NULL THEN
    RAISE EXCEPTION 'invalid_or_expired_invite';
  END IF;

  RETURN v_partnership;
END;
$$;

REVOKE ALL ON FUNCTION accept_partnership_invite(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION accept_partnership_invite(TEXT, TEXT, TEXT) TO authenticated;

-- CHILDREN: accessible by both parents
CREATE POLICY "children_access" ON children FOR ALL USING (
  parent_1_id = auth.uid() OR parent_2_id = auth.uid()
);

-- CALENDAR EVENTS: via child access
CREATE POLICY "calendar_events_access" ON calendar_events FOR ALL USING (
  child_id IN (
    SELECT id FROM children WHERE parent_1_id = auth.uid() OR parent_2_id = auth.uid()
  )
);

-- EXPENSES: via child access
CREATE POLICY "expenses_access" ON expenses FOR ALL USING (
  child_id IN (
    SELECT id FROM children WHERE parent_1_id = auth.uid() OR parent_2_id = auth.uid()
  )
);

-- CHAT MESSAGES: users in same partnership
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

-- GIFT SUGGESTIONS: via child access
CREATE POLICY "gifts_access" ON gift_suggestions FOR ALL USING (
  child_id IN (
    SELECT id FROM children WHERE parent_1_id = auth.uid() OR parent_2_id = auth.uid()
  )
);

-- HEALTH RECORDS: via child access
CREATE POLICY "health_records_access" ON health_records FOR ALL USING (
  child_id IN (
    SELECT id FROM children WHERE parent_1_id = auth.uid() OR parent_2_id = auth.uid()
  )
);

-- SCHOOL RECORDS: via child access
CREATE POLICY "school_records_access" ON school_records FOR ALL USING (
  child_id IN (
    SELECT id FROM children WHERE parent_1_id = auth.uid() OR parent_2_id = auth.uid()
  )
);

-- VACCINE CATALOG: public read
CREATE POLICY "vaccine_catalog_read" ON vaccine_catalog FOR SELECT USING (TRUE);

-- CHILD VACCINATIONS: via child access
CREATE POLICY "child_vaccinations_access" ON child_vaccinations FOR ALL USING (
  child_id IN (
    SELECT id FROM children WHERE parent_1_id = auth.uid() OR parent_2_id = auth.uid()
  )
);

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ============================================================
-- VACCINE CATALOG SEED — Calendário Nacional de Vacinação (SBP)
-- ============================================================
INSERT INTO vaccine_catalog (vaccine_key, vaccine_name, dose_label, schedule_type, window_start_months, window_end_months, sort_order, notes) VALUES
  ('BCG_1', 'BCG', 'Dose única', 'fixed_age', 0, 1, 1, 'Aplicar ao nascer'),
  ('HB_1', 'Hepatite B', '1ª dose', 'fixed_age', 0, 1, 2, 'Aplicar ao nascer'),
  ('HB_2', 'Hepatite B', '2ª dose', 'fixed_age', 1, 2, 3, NULL),
  ('HB_3', 'Hepatite B', '3ª dose', 'fixed_age', 6, 7, 4, NULL),
  ('PENTA_1', 'Pentavalente (DTP+Hib+HB)', '1ª dose', 'fixed_age', 2, 3, 5, NULL),
  ('PENTA_2', 'Pentavalente (DTP+Hib+HB)', '2ª dose', 'fixed_age', 4, 5, 6, NULL),
  ('PENTA_3', 'Pentavalente (DTP+Hib+HB)', '3ª dose', 'fixed_age', 6, 7, 7, NULL),
  ('VIP_1', 'Vacina Inativada Poliomielite (VIP)', '1ª dose', 'fixed_age', 2, 3, 8, NULL),
  ('VIP_2', 'Vacina Inativada Poliomielite (VIP)', '2ª dose', 'fixed_age', 4, 5, 9, NULL),
  ('VIP_3', 'Vacina Inativada Poliomielite (VIP)', '3ª dose', 'fixed_age', 6, 7, 10, NULL),
  ('VOP_R1', 'Vacina Oral Poliomielite (VOP)', '1º reforço', 'fixed_age', 15, 18, 11, NULL),
  ('VOP_R2', 'Vacina Oral Poliomielite (VOP)', '2º reforço', 'fixed_age', 48, 60, 12, NULL),
  ('PNEUMO_1', 'Pneumocócica 10-valente', '1ª dose', 'fixed_age', 2, 3, 13, NULL),
  ('PNEUMO_2', 'Pneumocócica 10-valente', '2ª dose', 'fixed_age', 4, 5, 14, NULL),
  ('PNEUMO_R', 'Pneumocócica 10-valente', 'Reforço', 'fixed_age', 12, 15, 15, NULL),
  ('ROTA_1', 'Rotavírus humano (VORH)', '1ª dose', 'fixed_age', 2, 3, 16, 'Máximo até 3 meses e 15 dias'),
  ('ROTA_2', 'Rotavírus humano (VORH)', '2ª dose', 'fixed_age', 4, 5, 17, 'Máximo até 7 meses e 29 dias'),
  ('MENINGO_1', 'Meningocócica C conjugada', '1ª dose', 'fixed_age', 3, 5, 18, NULL),
  ('MENINGO_2', 'Meningocócica C conjugada', '2ª dose', 'fixed_age', 5, 6, 19, NULL),
  ('MENINGO_R', 'Meningocócica C conjugada', 'Reforço', 'fixed_age', 12, 15, 20, NULL),
  ('FEBRE_AM', 'Febre Amarela', '1ª dose', 'fixed_age', 9, 12, 21, NULL),
  ('FEBRE_AM_R', 'Febre Amarela', 'Reforço único', 'fixed_age', 48, 60, 22, NULL),
  ('TRIPLICE_V', 'Tríplice Viral (Sarampo+Caxumba+Rubéola)', '1ª dose', 'fixed_age', 12, 15, 23, NULL),
  ('TRIPLICE_V2', 'Tríplice Viral (Sarampo+Caxumba+Rubéola)', '2ª dose', 'fixed_age', 15, 18, 24, NULL),
  ('VARICELA', 'Varicela (Catapora)', '1ª dose', 'fixed_age', 15, 18, 25, NULL),
  ('HEPATITE_A', 'Hepatite A', '1ª dose', 'fixed_age', 15, 18, 26, NULL),
  ('DTP_R1', 'DTP (Tríplice bacteriana)', '1º reforço', 'fixed_age', 15, 18, 27, NULL),
  ('DTP_R2', 'DTP (Tríplice bacteriana)', '2º reforço', 'fixed_age', 48, 60, 28, NULL),
  ('HPV_1', 'HPV Quadrivalente', '1ª dose', 'fixed_age', 108, 168, 29, 'Para meninas de 9 a 14 anos e meninos de 11 a 14 anos'),
  ('HPV_2', 'HPV Quadrivalente', '2ª dose', 'fixed_age', 114, 174, 30, '6 meses após 1ª dose'),
  ('INFLUENZA', 'Influenza (Gripe)', 'Dose anual', 'annual', 6, NULL, 31, 'Anualmente para crianças de 6 meses a 5 anos')
ON CONFLICT (vaccine_key) DO NOTHING;

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Execute no Dashboard > Storage > New Bucket
-- Nome: uploads
-- Public: true (para acesso público às fotos e documentos)
-- Ou execute:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT DO NOTHING;

-- Security hardening: prefer a private bucket with authenticated owner-folder access.
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO UPDATE SET public = false;

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
