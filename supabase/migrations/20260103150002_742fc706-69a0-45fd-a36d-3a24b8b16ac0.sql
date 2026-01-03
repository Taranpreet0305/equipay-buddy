-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  upi_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members junction table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  paid_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL NOT NULL,
  split_type TEXT NOT NULL DEFAULT 'equal' CHECK (split_type IN ('equal', 'exact', 'percentage', 'shares')),
  category TEXT NOT NULL DEFAULT 'other',
  receipt_url TEXT,
  notes TEXT,
  is_settled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expense_splits table for tracking who owes what
CREATE TABLE public.expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  percentage DECIMAL(5,2),
  shares INTEGER,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(expense_id, user_id)
);

-- Create settlements table
CREATE TABLE public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method TEXT NOT NULL DEFAULT 'cash' CHECK (method IN ('cash', 'upi', 'bank')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Groups policies
CREATE POLICY "Users can view groups they belong to" ON public.groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_members.group_id = groups.id 
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update groups" ON public.groups
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete groups" ON public.groups
  FOR DELETE USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Users can view group members of their groups" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group creators can add members" ON public.group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_members.group_id 
      AND groups.created_by = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Group creators can remove members" ON public.group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_members.group_id 
      AND groups.created_by = auth.uid()
    ) OR user_id = auth.uid()
  );

-- Expenses policies
CREATE POLICY "Users can view expenses in their groups" ON public.expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_members.group_id = expenses.group_id 
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create expenses" ON public.expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_members.group_id = expenses.group_id 
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Expense creators can update expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = paid_by);

CREATE POLICY "Expense creators can delete expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = paid_by);

-- Expense splits policies
CREATE POLICY "Users can view their expense splits" ON public.expense_splits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      JOIN public.group_members gm ON gm.group_id = e.group_id
      WHERE e.id = expense_splits.expense_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create expense splits" ON public.expense_splits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expenses e
      JOIN public.group_members gm ON gm.group_id = e.group_id
      WHERE e.id = expense_splits.expense_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own splits" ON public.expense_splits
  FOR UPDATE USING (user_id = auth.uid());

-- Settlements policies
CREATE POLICY "Users can view settlements in their groups" ON public.settlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_members.group_id = settlements.group_id 
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create settlements they're part of" ON public.settlements
  FOR INSERT WITH CHECK (
    auth.uid() = from_user_id OR auth.uid() = to_user_id
  );

CREATE POLICY "Settlement parties can update" ON public.settlements
  FOR UPDATE USING (
    auth.uid() = from_user_id OR auth.uid() = to_user_id
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;