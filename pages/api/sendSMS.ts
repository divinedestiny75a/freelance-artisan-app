// pages/api/sendSMS.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, body: messageBody } = req.body;
  if (!to || !messageBody) {
    return res.status(400).json({ error: "Missing required fields: to, body" });
  }

  const SID = process.env.TWILIO_ACCOUNT_SID;
  const TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const FROM = process.env.TWILIO_FROM_NUMBER;

  if (!SID || !TOKEN || !FROM) {
    console.warn("Twilio credentials not set – skipping SMS");
    return res.status(200).json({ message: "SMS skipped (no credentials configured)" });
  }

  try {
    const twilio = require("twilio");
    const client = twilio(SID, TOKEN);
    await client.messages.create({
      body: messageBody,
      from: FROM,
      to,
    });
    return res.status(200).json({ message: "SMS sent" });
  } catch (err: any) {
    console.error("Twilio error:", err);
    return res.status(500).json({ error: "Failed to send SMS" });
  }
}
