function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

export function passwordResetEmail(name: string, resetUrl: string) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(resetUrl);
  return `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;background:#070b13;color:#e5e7eb;font-family:Arial,sans-serif;padding:32px 16px">
        <div style="max-width:560px;margin:0 auto;background:#0d1422;border:1px solid #1f2937;border-radius:18px;padding:32px">
          <p style="margin:0 0 22px;color:#67e8f9;font-size:12px;letter-spacing:2px;text-transform:uppercase">Smart Grade Calculator</p>
          <h1 style="margin:0 0 16px;color:#ffffff;font-size:26px">Reset your password</h1>
          <p style="color:#9ca3af;line-height:1.7">Hello ${safeName}, we received a request to reset your Smart Grade Calculator password.</p>
          <a href="${safeUrl}" style="display:inline-block;margin:16px 0 20px;background:#22d3ee;color:#06202a;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:10px">Reset password</a>
          <p style="color:#9ca3af;line-height:1.7;font-size:14px">This link expires in 30 minutes and can only be used once. If you did not request a reset, you can safely ignore this email.</p>
          <p style="margin-top:28px;color:#64748b;font-size:12px">© 2026 Vireonix. Built for students.</p>
        </div>
      </body>
    </html>`;
}
