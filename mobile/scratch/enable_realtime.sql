-- Enable Realtime for the messages table to allow auto-refreshing chat
alter publication supabase_realtime add table messages;

-- Ensure RLS allows users to see their own messages
-- (Already should be there, but good to verify)
alter table messages enable row level security;
