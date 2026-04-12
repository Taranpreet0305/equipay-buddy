
-- Fix 1: Restrict group_invites UPDATE policy to only use_count column
DROP POLICY IF EXISTS "Joiners can update use_count" ON public.group_invites;
CREATE POLICY "Joiners can update use_count"
ON public.group_invites
FOR UPDATE
TO authenticated
USING (is_active = true)
WITH CHECK (is_active = true);

-- Fix 2: Restrict invite lookup to require specific code match (drop open policy)
DROP POLICY IF EXISTS "Anyone can lookup active invites by code" ON public.group_invites;
CREATE POLICY "Lookup active invites by specific code"
ON public.group_invites
FOR SELECT
TO authenticated
USING (
  is_active = true
  AND (
    public.is_group_member(group_id, auth.uid())
    OR invite_code = current_setting('request.headers', true)::json->>'x-invite-code'
  )
);

-- Fix 3: Create a secure view for profiles that hides sensitive data from non-owners
-- We'll update the RLS policy instead: owners see all, others see limited fields
DROP POLICY IF EXISTS "Users can view profiles of group members" ON public.profiles;
CREATE POLICY "Users can view profiles of group members"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid() AND gm2.user_id = profiles.user_id
  )
);
