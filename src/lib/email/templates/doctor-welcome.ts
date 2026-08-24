/**
 * Doctor Welcome & Credentials Email Template
 */
interface DoctorWelcomeProps {
  doctorName: string;
  email: string;
  password: string;
  loginUrl: string;
}

export function getDoctorWelcomeEmailHtml({
  doctorName,
  email,
  password,
  loginUrl,
}: DoctorWelcomeProps): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 32px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px; color: #334155; }
        .credentials-box { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .credential-row { margin: 8px 0; font-size: 15px; }
        .credential-label { font-weight: 600; color: #475569; display: inline-block; width: 160px; }
        .credential-code { background-color: #e2e8f0; color: #0f172a; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 15px; }
        .btn-container { text-align: center; margin: 32px 0 16px 0; }
        .btn { background-color: #0284c7; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
        .footer { padding: 24px 32px; background: #f8fafc; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 Healthcare Platform</h1>
        </div>
        <div class="content">
          <h2 style="margin-top:0; color: #0f172a;">Welcome, Dr. ${doctorName}!</h2>
          <p>An account has been created for you on the Healthcare Appointment Platform by the hospital administrator.</p>
          <p>You can log in directly using the following credentials:</p>
          
          <div class="credentials-box">
            <div class="credential-row">
              <span class="credential-label">Login Email:</span>
              <strong>${email}</strong>
            </div>
            <div class="credential-row">
              <span class="credential-label">Temporary Password:</span>
              <span class="credential-code">${password}</span>
            </div>
          </div>
          
          <p>Please log in using the button below:</p>
          
          <div class="btn-container">
            <a href="${loginUrl}" class="btn">Login to Doctor Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>Healthcare Appointment Platform &bull; Professional Care System</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
