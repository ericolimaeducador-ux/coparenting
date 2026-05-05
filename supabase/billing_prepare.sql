-- Future billing setup.
-- It prepares shared billing at R$ 30/month, split as R$ 15 for each parent.
-- Provider secrets must stay in Supabase Edge Functions, never in frontend code.

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
DROP POLICY IF EXISTS "partnership_billing_insert" ON partnership_billing;
DROP POLICY IF EXISTS "partnership_billing_update" ON partnership_billing;

CREATE POLICY "partnership_billing_select" ON partnership_billing FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM partnerships
    WHERE partnerships.id = partnership_billing.partnership_id
      AND (partnerships.parent_1_id = auth.uid() OR partnerships.parent_2_id = auth.uid())
  )
);

CREATE POLICY "partnership_billing_insert" ON partnership_billing FOR INSERT WITH CHECK (
  monthly_total_cents = 3000
  AND payer_amount_cents = 1500
  AND EXISTS (
    SELECT 1 FROM partnerships
    WHERE partnerships.id = partnership_billing.partnership_id
      AND (partnerships.parent_1_id = auth.uid() OR partnerships.parent_2_id = auth.uid())
  )
);

-- Real payment status updates should be made by a Supabase Edge Function
-- using the service role after payment-provider webhooks.
CREATE POLICY "partnership_billing_update" ON partnership_billing FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM partnerships
    WHERE partnerships.id = partnership_billing.partnership_id
      AND (partnerships.parent_1_id = auth.uid() OR partnerships.parent_2_id = auth.uid())
  )
) WITH CHECK (
  monthly_total_cents = 3000
  AND payer_amount_cents = 1500
);

INSERT INTO partnership_billing (partnership_id)
SELECT id FROM partnerships
WHERE status = 'active'
ON CONFLICT (partnership_id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
