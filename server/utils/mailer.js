
import nodemailer from "nodemailer";

let transporter = null;
export function getTransporter() {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return transporter;
}

export async function sendEmail(to, subject, text) {
  const t = getTransporter();
  if (!t) {
    console.log("[email stub]", { to, subject, text });
    return;
  }
  await t.sendMail({
    from: process.env.FROM_EMAIL || "no-reply@spendpal",
    to, subject, text
  });
}
