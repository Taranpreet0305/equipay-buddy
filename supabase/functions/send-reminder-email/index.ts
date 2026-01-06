import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  type: "pending_settlement" | "overdue_payment";
  recipientEmail: string;
  recipientName: string;
  amount: number;
  currency?: string;
  senderName?: string;
  groupName?: string;
  dueDate?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const { 
      type, 
      recipientEmail, 
      recipientName, 
      amount, 
      currency = "INR",
      senderName,
      groupName,
      dueDate
    }: ReminderRequest = await req.json();

    console.log(`Sending ${type} reminder to ${recipientEmail}`);

    if (!recipientEmail || !recipientName || !amount) {
      throw new Error("Missing required fields: recipientEmail, recipientName, amount");
    }

    const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : "€";
    const formattedAmount = `${currencySymbol}${amount.toLocaleString()}`;

    let subject: string;
    let htmlContent: string;

    if (type === "pending_settlement") {
      subject = `💸 Reminder: You owe ${formattedAmount}${groupName ? ` in ${groupName}` : ""}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #0D9488 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px; }
            .amount-box { background: white; border: 2px solid #10B981; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
            .amount { font-size: 36px; font-weight: bold; color: #10B981; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #10B981 0%, #0D9488 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💰 EquiPay Reminder</h1>
          </div>
          <div class="content">
            <p>Hey ${recipientName}! 👋</p>
            <p>${senderName ? `<strong>${senderName}</strong> is waiting for a payment from you` : "You have a pending settlement"}${groupName ? ` in the <strong>${groupName}</strong> group` : ""}.</p>
            
            <div class="amount-box">
              <p style="margin: 0 0 8px 0; color: #6b7280;">Amount Due</p>
              <div class="amount">${formattedAmount}</div>
            </div>
            
            <p>Settle up now to keep your group expenses balanced! 🎯</p>
            
            <center>
              <a href="#" class="cta-button">Open EquiPay</a>
            </center>
          </div>
          <div class="footer">
            <p>This is an automated reminder from EquiPay.</p>
            <p>Split expenses fairly. Settle up easily. 💚</p>
          </div>
        </body>
        </html>
      `;
    } else {
      // Overdue payment
      subject = `⚠️ Overdue: ${formattedAmount} payment needed${groupName ? ` for ${groupName}` : ""}`;
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px; }
            .amount-box { background: white; border: 2px solid #EF4444; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
            .amount { font-size: 36px; font-weight: bold; color: #EF4444; }
            .overdue-badge { display: inline-block; background: #FEE2E2; color: #DC2626; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚠️ Overdue Payment</h1>
          </div>
          <div class="content">
            <p>Hey ${recipientName},</p>
            <p>This is a reminder that you have an <strong>overdue payment</strong>${senderName ? ` to <strong>${senderName}</strong>` : ""}${groupName ? ` in the <strong>${groupName}</strong> group` : ""}.</p>
            
            <div class="amount-box">
              <p style="margin: 0 0 8px 0; color: #6b7280;">Overdue Amount</p>
              <div class="amount">${formattedAmount}</div>
              ${dueDate ? `<span class="overdue-badge">Due: ${dueDate}</span>` : '<span class="overdue-badge">Payment Overdue</span>'}
            </div>
            
            <p>Please settle this payment as soon as possible to avoid any inconvenience. 🙏</p>
            
            <center>
              <a href="#" class="cta-button">Settle Now</a>
            </center>
          </div>
          <div class="footer">
            <p>This is an automated reminder from EquiPay.</p>
            <p>If you've already paid, please ignore this email.</p>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "EquiPay <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending reminder email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
