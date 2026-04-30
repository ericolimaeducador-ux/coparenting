-- Apply this in Supabase SQL Editor on an existing project.
-- It restricts chat updates to a safe RPC and adds vaccination attachments.

ALTER TABLE child_vaccinations
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

DROP POLICY IF EXISTS "chat_messages_insert" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_update" ON chat_messages;

CREATE POLICY "chat_messages_insert" ON chat_messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM partnerships
    WHERE status = 'active'
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
    AND sender_id <> auth.uid()
    AND sender_id IN (v_parent_1, v_parent_2);
END;
$$;

REVOKE ALL ON FUNCTION mark_partnership_messages_read(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION mark_partnership_messages_read(UUID) TO authenticated;
