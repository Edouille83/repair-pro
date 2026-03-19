import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.EMAIL_FROM || "Repair Pro <noreply@repairpro.local>";

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.log(`[EMAIL DISABLED] → ${to}: ${subject}`);
    return { success: true, error: "Email not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error(`[EMAIL ERROR] → ${to}:`, error);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL SENT] → ${to}: ${subject} (ID: ${data?.id})`);
    return { success: true };
  } catch (error: any) {
    console.error(`[EMAIL ERROR] → ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

export function formatRepairStatusEmail(
  clientName: string,
  deviceType: string,
  brandModel: string,
  status: string,
  shopName: string,
  shopPhone: string
): { subject: string; html: string } {
  const statusEmoji: Record<string, string> = {
    "Diagnostic": "📋",
    "En cours": "🔧",
    "Attente pièce": "📦",
    "Terminée": "✅",
  };
  const emoji = statusEmoji[status] || "🔔";

  const statusMessage: Record<string, string> = {
    "Diagnostic": "votre appareil est en cours de diagnostic",
    "En cours": "la réparation a commencé",
    "Attente pièce": "nous attendons une pièce détachée",
    "Terminée": "votre appareil est prêt !",
  };
  const message = statusMessage[status] || "une mise à jour a été effectuée";

  return {
    subject: `${emoji} ${status} - ${shopName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #1e293b; margin: 0 0 8px 0; font-size: 24px;">${shopName}</h1>
          <p style="color: #64748b; margin: 0 0 24px 0;">Atelier de Réparation Premium</p>
          
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 8px 0; font-size: 20px;">${emoji} Réparation ${status}</h2>
            <p style="margin: 0; opacity: 0.9;">${message}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; color: #475569;"><strong>Client:</strong> ${clientName}</p>
            <p style="margin: 0 0 8px 0; color: #475569;"><strong>Appareil:</strong> ${deviceType} ${brandModel}</p>
            <p style="margin: 0; color: #475569;"><strong>Statut:</strong> <span style="color: #6366f1; font-weight: bold;">${status}</span></p>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-bottom: 16px;">
            Merci de votre confiance. N'hésitez pas à nous contacter pour toute question.
          </p>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              <strong>${shopName}</strong><br>
              ${shopPhone}
            </p>
          </div>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
        </p>
      </body>
      </html>
    `,
  };
}
