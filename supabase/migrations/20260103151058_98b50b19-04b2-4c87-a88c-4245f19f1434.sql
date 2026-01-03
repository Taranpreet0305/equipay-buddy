-- Create group messages table for in-app chat
CREATE TABLE public.group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'expense', 'settlement', 'reminder')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create currency_rates table for exchange rates caching
CREATE TABLE public.currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate DECIMAL(20,10) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(base_currency, target_currency)
);

-- Add preferred_currency to profiles
ALTER TABLE public.profiles ADD COLUMN preferred_currency TEXT DEFAULT 'INR';

-- Add original_currency and original_amount to expenses for multi-currency
ALTER TABLE public.expenses ADD COLUMN original_currency TEXT;
ALTER TABLE public.expenses ADD COLUMN original_amount DECIMAL(12,2);
ALTER TABLE public.expenses ADD COLUMN exchange_rate DECIMAL(20,10);

-- Enable RLS on new tables
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

-- Group messages policies
CREATE POLICY "Users can view messages in their groups" ON public.group_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_members.group_id = group_messages.group_id 
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their groups" ON public.group_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_members.group_id = group_messages.group_id 
      AND group_members.user_id = auth.uid()
    )
  );

-- Currency rates are publicly readable (cached data)
CREATE POLICY "Anyone can read currency rates" ON public.currency_rates
  FOR SELECT USING (true);

-- Only system can update rates
CREATE POLICY "System can manage currency rates" ON public.currency_rates
  FOR ALL USING (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;