import "server-only";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { serverEnv } from "@/config/env";

export type EmailMessage = { to: string; subject: string; html: string; text: string };

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

function resendSender(): EmailSender {
  const env = serverEnv();
  if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is missing");
  const client = new Resend(env.RESEND_API_KEY);
  return {
    async send(m) {
      const { error } = await client.emails.send({ from: env.EMAIL_FROM, to: m.to, subject: m.subject, html: m.html, text: m.text });
      if (error) throw new Error(`Resend: ${error.message}`);
    },
  };
}

function smtpSender(): EmailSender {
  const env = serverEnv();
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) throw new Error("SMTP_HOST, SMTP_USER and SMTP_PASSWORD are required");
  const port = env.SMTP_PORT ?? 465;
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
  return {
    async send(m) {
      await transport.sendMail({ from: env.EMAIL_FROM, to: m.to, subject: m.subject, html: m.html, text: m.text });
    },
  };
}

/** The configured email provider (EMAIL_PROVIDER=resend|smtp). */
export function getEmailSender(): EmailSender {
  return serverEnv().EMAIL_PROVIDER === "smtp" ? smtpSender() : resendSender();
}
