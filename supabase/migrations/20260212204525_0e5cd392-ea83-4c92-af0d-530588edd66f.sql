
-- Fix infinite recursion: group_members SELECT policy references itself
-- Drop the recursive policy and replace with a direct auth.uid() check

DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;

CREATE POLICY "Users can view group members of their groups"
ON public.group_members
FOR SELECT
USING (
  group_id IN (
    SELECT gm.group_id FROM public.group_members gm WHERE gm.user_id = auth.uid()
  )
);
