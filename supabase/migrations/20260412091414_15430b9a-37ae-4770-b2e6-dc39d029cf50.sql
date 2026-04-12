
DROP POLICY IF EXISTS "Anyone can read currency rates" ON public.currency_rates;
CREATE POLICY "Anyone can read currency rates"
ON public.currency_rates
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Expense creators can delete splits" ON public.expense_splits;
CREATE POLICY "Expense creators can delete splits"
ON public.expense_splits
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.expenses
    WHERE expenses.id = expense_splits.expense_id
    AND expenses.paid_by = auth.uid()
  )
);
