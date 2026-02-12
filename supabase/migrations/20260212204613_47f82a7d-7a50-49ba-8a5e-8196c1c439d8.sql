
-- Fix: Use a security definer function to break the recursion cycle
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = p_user_id
  );
$$;

-- Fix group_members SELECT policy - use direct user_id check to avoid recursion
DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;
CREATE POLICY "Users can view group members of their groups"
ON public.group_members
FOR SELECT
USING (user_id = auth.uid() OR public.is_group_member(group_id, auth.uid()));

-- Fix groups SELECT policy to use the security definer function
DROP POLICY IF EXISTS "Users can view groups they belong to" ON public.groups;
CREATE POLICY "Users can view groups they belong to"
ON public.groups
FOR SELECT
USING (public.is_group_member(id, auth.uid()));
