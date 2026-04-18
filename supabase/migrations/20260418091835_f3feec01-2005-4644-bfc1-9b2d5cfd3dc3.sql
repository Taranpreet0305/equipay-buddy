-- 1. Add bio column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Create avatars storage bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users manage their own folder (auth.uid()/...)
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Account deletion function — cleans up data and removes auth user
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Remove user-owned data (cascading where possible)
  DELETE FROM public.expense_splits WHERE user_id = uid;
  DELETE FROM public.expenses WHERE paid_by = uid;
  DELETE FROM public.settlements WHERE from_user_id = uid OR to_user_id = uid;
  DELETE FROM public.group_messages WHERE user_id = uid;
  DELETE FROM public.recurring_expenses WHERE created_by = uid OR paid_by = uid;
  DELETE FROM public.group_invites WHERE created_by = uid;
  DELETE FROM public.notifications WHERE user_id = uid;
  DELETE FROM public.group_members WHERE user_id = uid;
  -- Delete groups created by user (cascade should clean up remaining members/expenses)
  DELETE FROM public.groups WHERE created_by = uid;
  DELETE FROM public.profiles WHERE user_id = uid;

  -- Finally, delete the auth user
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;