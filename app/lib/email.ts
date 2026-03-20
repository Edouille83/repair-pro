import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

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
  const firstName = clientName.split(" ")[0];
  
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    "Diagnostic": { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
    "En cours": { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
    "Attente pièce": { bg: "#ede9fe", text: "#5b21b6", border: "#8b5cf6" },
    "Terminée": { bg: "#d1fae5", text: "#065f46", border: "#10b981" },
  };
  const colors = statusColors[status] || { bg: "#f3f4f6", text: "#374151", border: "#6b7280" };

  const statusIcons: Record<string, string> = {
    "Diagnostic": "🔍",
    "En cours": "🔧",
    "Attente pièce": "📦",
    "Terminée": "✅",
  };
  const icon = statusIcons[status] || "📱";

  const statusMessages: Record<string, string> = {
    "Diagnostic": "Votre appareil est actuellement en cours de diagnostic par notre équipe technique.",
    "En cours": "Bonne nouvelle ! La réparation de votre appareil a commencée.",
    "Attente pièce": "Nous attendons une pièce détachée pour finaliser la réparation.",
    "Terminée": "Votre appareil est prêt ! Vous pouvez venir le récupérer.",
  };
  const message = statusMessages[status] || "Une mise à jour concernant votre réparation a été effectuée.";

  return {
    subject: `${icon} ${shopName} - Réparation ${status}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f0f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%); padding: 40px 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">${shopName}</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Atelier de Réparation</p>
          </div>
          
          <!-- Greeting -->
          <div style="padding: 32px 32px 24px 32px;">
            <h2 style="color: #1e3a5f; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Bonjour ${firstName},</h2>
          </div>
          
          <!-- Status Card -->
          <div style="padding: 0 32px 32px 32px;">
            <div style="background: ${colors.bg}; border-left: 4px solid ${colors.border}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <span style="font-size: 32px;">${icon}</span>
                <div>
                  <p style="margin: 0; color: ${colors.text}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Statut de votre réparation</p>
                  <p style="margin: 4px 0 0 0; color: ${colors.text}; font-size: 20px; font-weight: 700;">${status}</p>
                </div>
              </div>
              <p style="margin: 0; color: ${colors.text}; font-size: 15px; line-height: 1.6;">${message}</p>
            </div>
            
            <!-- Details Card -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%;">Appareil</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${deviceType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Modèle</td>
                  <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${brandModel}</td>
                </tr>
              </table>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #1e3a5f; padding: 24px 32px; text-align: center;">
            <p style="color: #ffffff; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${shopName}</p>
            <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px;">📞 ${shopPhone}</p>
          </div>
          
          <!-- Disclaimer -->
          <div style="padding: 16px 32px; background: #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.6;">
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.<br>
              Pour toute question, contactez-nous au ${shopPhone}
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `,
  };
}
