/**
 * Appointment reminder email template for Patient
 */
interface ReminderProps {
  patientName: string;
  doctorName: string;
  specialisation: string;
  date: string;
  startTime: string;
  hoursUntil: number | string;
}

export function reminderTemplate({
  patientName,
  doctorName,
  specialisation,
  date,
  startTime,
  hoursUntil,
}: ReminderProps) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 32px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 32px; }
        .reminder-box { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center; }
        .detail-row { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { color: #6b7280; font-weight: 500; }
        .detail-value { color: #111827; font-weight: 600; }
        .footer { padding: 24px 32px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Appointment Reminder</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${patientName}</strong>,</p>
          
          <div class="reminder-box">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #92400e;">
              Your appointment is in ${hoursUntil} hours
            </p>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Doctor</span>
            <span class="detail-value">Dr. ${doctorName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Specialisation</span>
            <span class="detail-value">${specialisation}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date & Time</span>
            <span class="detail-value">${date} at ${startTime}</span>
          </div>
          
          <p style="margin-top: 24px; color: #6b7280;">
            Please remember to arrive 10 minutes early. Bring any relevant medical records or test results.
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

/**
 * Appointment reminder email template for Doctor
 */
interface DoctorReminderProps {
  doctorName: string;
  patientName: string;
  date: string;
  startTime: string;
  hoursUntil: number | string;
}

export function doctorReminderTemplate({
  doctorName,
  patientName,
  date,
  startTime,
  hoursUntil,
}: DoctorReminderProps) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #f59e0b, #b45309); padding: 32px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 32px; }
        .reminder-box { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center; }
        .detail-row { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { color: #6b7280; font-weight: 500; }
        .detail-value { color: #111827; font-weight: 600; }
        .footer { padding: 24px 32px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Upcoming Patient Appointment</h1>
        </div>
        <div class="content">
          <p>Hello <strong>Dr. ${doctorName}</strong>,</p>
          
          <div class="reminder-box">
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #92400e;">
              Scheduled appointment in ${hoursUntil} hours
            </p>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Patient</span>
            <span class="detail-value">${patientName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date & Time</span>
            <span class="detail-value">${date} at ${startTime}</span>
          </div>
          
          <p style="margin-top: 24px; color: #6b7280;">
            Please log into your dashboard to review the patient&apos;s pre-visit clinical summary prior to the visit.
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
