
-- Create recurring expenses table
CREATE TABLE public.recurring_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  paid_by UUID NOT NULL,
  split_type TEXT NOT NULL DEFAULT 'equal',
  category TEXT NOT NULL DEFAULT 'other',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  next_due_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_recurring_group FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT fk_recurring_paid_by FOREIGN KEY (paid_by) REFERENCES public.profiles(user_id),
  CONSTRAINT fk_recurring_created_by FOREIGN KEY (created_by) REFERENCES public.profiles(user_id)
);

-- Enable RLS
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view recurring expenses in their groups"
ON public.recurring_expenses FOR SELECT
USING (EXISTS (
  SELECT 1 FROM group_members WHERE group_members.group_id = recurring_expenses.group_id AND group_members.user_id = auth.uid()
));

CREATE POLICY "Group members can create recurring expenses"
ON public.recurring_expenses FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM group_members WHERE group_members.group_id = recurring_expenses.group_id AND group_members.user_id = auth.uid()
));

CREATE POLICY "Creators can update recurring expenses"
ON public.recurring_expenses FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete recurring expenses"
ON public.recurring_expenses FOR DELETE
USING (auth.uid() = created_by);

-- Trigger for updated_at
CREATE TRIGGER update_recurring_expenses_updated_at
BEFORE UPDATE ON public.recurring_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
