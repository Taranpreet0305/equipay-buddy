import { supabase } from '@/integrations/supabase/client';

interface SendReminderParams {
  type: 'pending_settlement' | 'overdue_payment';
  recipientEmail: string;
  recipientName: string;
  amount: number;
  currency?: string;
  senderName?: string;
  groupName?: string;
  dueDate?: string;
}

export async function sendReminderEmail(params: SendReminderParams) {
  try {
    const { data, error } = await supabase.functions.invoke('send-reminder-email', {
      body: params,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to send reminder email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPendingSettlementReminder(
  recipientEmail: string,
  recipientName: string,
  amount: number,
  senderName?: string,
  groupName?: string
) {
  return sendReminderEmail({
    type: 'pending_settlement',
    recipientEmail,
    recipientName,
    amount,
    senderName,
    groupName,
  });
}

export async function sendOverduePaymentReminder(
  recipientEmail: string,
  recipientName: string,
  amount: number,
  senderName?: string,
  groupName?: string,
  dueDate?: string
) {
  return sendReminderEmail({
    type: 'overdue_payment',
    recipientEmail,
    recipientName,
    amount,
    senderName,
    groupName,
    dueDate,
  });
}
