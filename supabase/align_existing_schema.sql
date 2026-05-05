-- Apply this when an existing Supabase project was created with an older schema.
-- It adds columns currently used by the webapp without deleting any data.

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

NOTIFY pgrst, 'reload schema';
