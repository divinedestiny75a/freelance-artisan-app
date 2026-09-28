// pages/api/sendEmail.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, text } = req.body;
  if (!to || !subject || !text) {
    return res.status(400).json({ error: "Missing required fields: to, subject, text" });
  }

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  if (!SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY not set – skipping email");
    return res.status(200).json({ message: "Email skipped (no API key configured)" });
  }

  try {
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(SENDGRID_API_KEY);
    await sgMail.send({
      to,
      from: "noreply@artisanmatch.com", // Change to your verified sender
      subject,
      text,
    });
    return res.status(200).json({ message: "Email sent" });
  } catch (err: any) {
    console.error("SendGrid error:", err?.response?.body || err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
