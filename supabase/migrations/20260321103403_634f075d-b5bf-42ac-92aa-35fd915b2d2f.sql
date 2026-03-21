-- 1. Fix profiles SELECT policy: restrict to group co-members + self
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view group co-member profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid() AND gm2.user_id = profiles.user_id
  )
);

-- 2. Fix currency_rates: remove overly permissive ALL policy, restrict writes to service role
DROP POLICY IF EXISTS "System can manage currency rates" ON public.currency_rates;

CREATE POLICY "Service role can manage currency rates" ON public.currency_rates
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- 3. Fix notifications INSERT: restrict to self-targeted or via service role
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can create notifications for group members" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid() AND gm2.user_id = notifications.user_id
  )
  OR user_id = auth.uid()
);

-- Also allow service_role full insert for edge functions
CREATE POLICY "Service role can create notifications" ON public.notifications
FOR INSERT TO service_role
WITH CHECK (true);