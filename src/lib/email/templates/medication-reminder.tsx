/**
 * Medication reminder email template
 */
interface MedicationReminderProps {
  patientName: string;
  medicationName: string;
  dosage?: string;
  instructions?: string;
}

export function medicationReminderTemplate({
  patientName,
  medicationName,
  dosage,
  instructions,
}: MedicationReminderProps) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 32px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 32px; }
        .med-box { background: #f5f3ff; border: 1px solid #c4b5fd; border-radius: 8px; padding: 20px; margin: 16px 0; }
        .med-name { font-size: 20px; font-weight: 700; color: #5b21b6; margin-bottom: 8px; }
        .footer { padding: 24px 32px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💊 Medication Reminder</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${patientName}</strong>,</p>
          <p>This is a reminder to take your medication:</p>
          
          <div class="med-box">
            <div class="med-name">${medicationName}</div>
            ${dosage ? `<p style="margin: 4px 0; color: #374151;"><strong>Dosage:</strong> ${dosage}</p>` : ""}
            ${instructions ? `<p style="margin: 4px 0; color: #374151;"><strong>Instructions:</strong> ${instructions}</p>` : ""}
          </div>
          
          <p style="color: #6b7280;">
            Remember to take your medications as prescribed. If you experience any side effects, 
            please contact your doctor immediately.
          </p>
        </div>
        <div class="footer">
          <p>Healthcare Appointment Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
