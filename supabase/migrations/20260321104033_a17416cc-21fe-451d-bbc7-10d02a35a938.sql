
-- Create group_invites table
CREATE TABLE public.group_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  invite_code text NOT NULL DEFAULT substr(md5(random()::text), 1, 8) UNIQUE,
  created_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  use_count integer NOT NULL DEFAULT 0,
  max_uses integer DEFAULT NULL,
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;

-- Group members can view invites for their groups
CREATE POLICY "Group members can view invites"
ON public.group_invites FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_invites.group_id
    AND group_members.user_id = auth.uid()
  )
);

-- Group members can create invites
CREATE POLICY "Group members can create invites"
ON public.group_invites FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_invites.group_id
    AND group_members.user_id = auth.uid()
  )
  AND created_by = auth.uid()
);

-- Anyone authenticated can read invites by code (for joining)
CREATE POLICY "Anyone can lookup active invites by code"
ON public.group_invites FOR SELECT
TO authenticated
USING (is_active = true);

-- Invite creators can update their invites
CREATE POLICY "Invite creators can update invites"
ON public.group_invites FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

-- Allow anyone authenticated to increment use_count when joining
CREATE POLICY "Joiners can update use_count"
ON public.group_invites FOR UPDATE
TO authenticated
USING (is_active = true);
