
-- Fix: Allow creators to also see their own groups (needed for INSERT...RETURNING)
DROP POLICY IF EXISTS "Users can view groups they belong to" ON public.groups;
CREATE POLICY "Users can view groups they belong to"
ON public.groups
FOR SELECT
USING (created_by = auth.uid() OR public.is_group_member(id, auth.uid()));
