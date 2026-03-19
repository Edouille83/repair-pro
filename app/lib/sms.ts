import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? Twilio(accountSid, authToken) : null;

export async function sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (!client || !fromNumber) {
    console.log(`[SMS DISABLED] → ${to}: ${message}`);
    return { success: true, error: "SMS not configured" };
  }

  try {
    const formattedNumber = to.startsWith("+") ? to : `+33${to.slice(1)}`;
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedNumber,
    });
    console.log(`[SMS SENT] → ${formattedNumber}: ${message}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[SMS ERROR] → ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}
