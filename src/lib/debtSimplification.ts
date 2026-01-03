export interface Balance {
  userId: string;
  displayName: string;
  amount: number; // positive = owed to them, negative = they owe
}

export interface SimplifiedDebt {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

/**
 * Debt Simplification Algorithm
 * Calculates the minimum number of transactions needed to settle all debts in a group.
 * Uses a greedy approach to match max creditor with max debtor.
 */
export function simplifyDebts(balances: Balance[]): SimplifiedDebt[] {
  // Create mutable copy of balances
  const workingBalances = balances.map(b => ({ ...b }));
  const transactions: SimplifiedDebt[] = [];

  // Remove zero balances
  const nonZeroBalances = workingBalances.filter(b => Math.abs(b.amount) > 0.01);

  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors = nonZeroBalances.filter(b => b.amount > 0).sort((a, b) => b.amount - a.amount);
  const debtors = nonZeroBalances.filter(b => b.amount < 0).sort((a, b) => a.amount - b.amount);

  let i = 0; // creditor index
  let j = 0; // debtor index

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    // Amount to transfer is min of what debtor owes and what creditor is owed
    const settleAmount = Math.min(creditor.amount, Math.abs(debtor.amount));

    if (settleAmount > 0.01) {
      transactions.push({
        from: debtor.userId,
        fromName: debtor.displayName,
        to: creditor.userId,
        toName: creditor.displayName,
        amount: Math.round(settleAmount * 100) / 100,
      });
    }

    // Update balances
    creditor.amount -= settleAmount;
    debtor.amount += settleAmount;

    // Move to next creditor/debtor if settled
    if (creditor.amount < 0.01) i++;
    if (debtor.amount > -0.01) j++;
  }

  return transactions;
}

/**
 * Calculate net balances for each user from expenses
 */
export function calculateBalances(
  expenses: Array<{
    paid_by: string;
    paidByName: string;
    splits: Array<{ user_id: string; displayName: string; amount: number; is_paid: boolean }>;
  }>
): Balance[] {
  const balanceMap = new Map<string, { userId: string; displayName: string; amount: number }>();

  expenses.forEach(expense => {
    expense.splits.forEach(split => {
      // Initialize if not exists
      if (!balanceMap.has(split.user_id)) {
        balanceMap.set(split.user_id, {
          userId: split.user_id,
          displayName: split.displayName,
          amount: 0,
        });
      }

      const userBalance = balanceMap.get(split.user_id)!;

      if (split.user_id === expense.paid_by) {
        // This person paid, so they're owed (total expense - their share)
        const totalExpense = expense.splits.reduce((sum, s) => sum + s.amount, 0);
        userBalance.amount += totalExpense - split.amount;
      } else if (!split.is_paid) {
        // This person owes their share
        userBalance.amount -= split.amount;
      }
    });
  });

  return Array.from(balanceMap.values());
}

/**
 * Generate UPI deep link for payment
 */
export function generateUPILink(
  upiId: string,
  amount: number,
  name: string,
  note?: string
): string {
  const params = new URLSearchParams({
    pa: upiId, // payee address (UPI ID)
    pn: name, // payee name
    am: amount.toFixed(2), // amount
    cu: 'INR', // currency
  });

  if (note) {
    params.append('tn', note); // transaction note
  }

  return `upi://pay?${params.toString()}`;
}

/**
 * Check if UPI apps are available (basic heuristic for mobile)
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Format currency in INR
 */
export function formatCurrency(amount: number): string {
  return `₹${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}
