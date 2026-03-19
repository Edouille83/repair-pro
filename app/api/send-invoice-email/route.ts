import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/email";

export async function POST(request: Request) {
  try {
    const { to, invoice, clientName, deviceInfo, shopInfo } = await request.json();

    if (!to || !invoice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const invoiceNumber = `FAC-${invoice.createdAt.slice(6,10)}${invoice.createdAt.slice(3,5)}-${invoice.id.toString().padStart(4, "0")}`;
    const shopName = shopInfo?.name || "Repair Pro";
    const shopEmail = shopInfo?.email || "";

    const subject = `Facture ${invoiceNumber} - ${shopName}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #1e40af; margin: 0; }
    .header p { color: #64748b; margin: 5px 0 0; font-size: 12px; }
    .info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .info p { margin: 5px 0; }
    .amount { text-align: right; font-size: 24px; font-weight: bold; color: #059669; margin: 20px 0; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${shopName}</h1>
      <p>Facture</p>
    </div>
    
    <div class="info">
      <p><strong>Client:</strong> ${clientName}</p>
      <p><strong>Appareil:</strong> ${deviceInfo}</p>
      <p><strong>Facture N°:</strong> ${invoiceNumber}</p>
      <p><strong>Date:</strong> ${invoice.createdAt.split(' ')[0]}</p>
    </div>
    
    <div>
      <p><strong>Détails:</strong></p>
      <p>${invoice.laborLabel}: ${invoice.laborAmount.toFixed(2).replace('.', ',')} € HT</p>
      <p>${invoice.partLabel}: ${invoice.partAmount.toFixed(2).replace('.', ',')} € HT</p>
      <p>TVA (${invoice.vatRate}%): ${invoice.totalVat.toFixed(2).replace('.', ',')} €</p>
    </div>
    
    <div class="amount">
      Total TTC: ${invoice.totalTtc.toFixed(2).replace('.', ',')} €
    </div>
    
    <div class="footer">
      <p>Merci de votre confiance ! Vos réparations sont garanties 6 mois.</p>
      <p>${shopName} - ${shopInfo?.address || ''} ${shopInfo?.city || ''}</p>
      ${shopEmail ? `<p>Contact: ${shopEmail}</p>` : ''}
    </div>
  </div>
</body>
</html>
    `;

    const result = await sendEmail(to, subject, html);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
