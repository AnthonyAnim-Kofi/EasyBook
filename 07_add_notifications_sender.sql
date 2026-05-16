-- Add sender_id to notifications so message-type notifications can be
-- cleared per-partner when a chat is opened (cross-device read sync).
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS sender_id UUID
  REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_sender_unread
  ON public.notifications (user_id, sender_id)
  WHERE is_read = false;

-- Make sure realtime delivers UPDATE/DELETE payloads with full row data
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
  END IF;
END $$;
