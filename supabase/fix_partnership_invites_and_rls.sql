-- Apply this in Supabase SQL Editor on an existing project.
-- It fixes invite acceptance and removes cross-family access to childless events/expenses.

DROP POLICY IF EXISTS "partnerships_by_token" ON partnerships;
DROP POLICY IF EXISTS "partnerships_update" ON partnerships;

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

DROP POLICY IF EXISTS "calendar_events_access" ON calendar_events;
CREATE POLICY "calendar_events_access" ON calendar_events FOR ALL USING (
  child_id IN (
    SELECT id FROM children WHERE parent_1_id = auth.uid() OR parent_2_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "expenses_access" ON expenses;
CREATE POLICY "expenses_access" ON expenses FOR ALL USING (
  child_id IN (
    SELECT id FROM children WHERE parent_1_id = auth.uid() OR parent_2_id = auth.uid()
  )
);
