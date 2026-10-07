import nodemailer from "nodemailer";
import { markMailSent, pendingMail } from "./db";

export async function flushMail() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return { sent: 0, skipped: true };
  const port = Number(process.env.SMTP_PORT || 587);
  const from = process.env.SMTP_FROM || user;
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  let sent = 0;
  for (const mail of pendingMail()) {
    await transport.sendMail({ from, to: mail.to_email, subject: mail.subject, text: mail.body });
    markMailSent(mail.id);
    sent += 1;
  }
  return { sent, skipped: false };
}
