import nodemailer from "nodemailer";

let cachedTransport = null;

function buildTransportConfig() {
  const hasExplicit =
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasExplicit) {
    const host = process.env.SMTP_HOST;
    const port = parseInt(
      process.env.SMTP_PORT || (host === "smtp.gmail.com" ? "465" : "587"),
      10
    );
    const secure =
      (process.env.SMTP_SECURE || "").toLowerCase().trim() === "true" ||
      port === 465;
    return {
      host,
      port,
      secure,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    };
  }

  // Gmail convenience (if user provided but no host)
  if (
    !hasExplicit &&
    process.env.SMTP_USER &&
    process.env.SMTP_USER.endsWith("@gmail.com") &&
    process.env.SMTP_PASS
  ) {
    return {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    };
  }

  // Dev fallback: log-only pseudo transport (no external network)
  if (process.env.NODE_ENV !== "production") {
    return {
      name: "log-only",
      version: "1.0",
      send(mail, callback) {
        const input = mail.message.createReadStream();
        let raw = "";
        input.on("data", (c) => (raw += c.toString()));
        input.on("end", () => {
          console.log(
            "[MAIL:DEV:LOG-ONLY] Pretend send =>",
            mail.message.getEnvelope()
          );
          console.log(
            "[MAIL:RAW]\n" +
              raw.split("\n").slice(0, 25).join("\n") +
              "\n...trimmed"
          );
          callback(null, {
            envelope: mail.message.getEnvelope(),
            messageId: mail.message.messageId(),
            accepted: [mail.message.getEnvelope().to],
            rejected: [],
            pending: [],
            response: "LOG-ONLY",
          });
        });
      },
    };
  }

  throw new Error(
    "SMTP credentials missing in production (set SMTP_HOST, SMTP_USER, SMTP_PASS)"
  );
}

export function getTransport() {
  if (!cachedTransport) {
    const cfg = buildTransportConfig();
    if (cfg.send) {
      // log-only transport (already implements send)
      cachedTransport = cfg;
      console.warn("[MAIL] Using log-only dev transport (no real emails sent)");
    } else {
      cachedTransport = nodemailer.createTransport(cfg);
      console.log(
        `[MAIL] Transport ready host=${cfg.host} port=${cfg.port} secure=${cfg.secure}`
      );
    }
  }
  return cachedTransport;
}

export async function sendMail({ to, subject, html }) {
  const transporter = getTransport();
  const from =
    process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@example.test";
  let info;
  try {
    info = await transporter.sendMail({ from, to, subject, html });
  } catch (e) {
    console.error("[MAIL] sendMail error:", e?.response || e?.message || e);
    throw e;
  }
  if (info.response === "LOG-ONLY") {
    return { messageId: info.messageId, previewUrl: null, simulated: true };
  }
  const previewUrl = nodemailer.getTestMessageUrl?.(info) || null;
  if (previewUrl) console.log("[MAIL] Preview:", previewUrl);
  console.log(
    "[MAIL] Sent messageId=",
    info.messageId,
    "accepted=",
    info.accepted
  );
  return { messageId: info.messageId, previewUrl };
}
