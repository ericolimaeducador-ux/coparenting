-- Apply this in Supabase SQL Editor on an existing project.
-- It hardens partnership creation, isolates chat messages by partnership,
-- and moves the uploads bucket to private access with owner-folder policies.

ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

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
