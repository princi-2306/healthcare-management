/**
 * Cancellation email template for Patient
 */
interface CancellationProps {
  patientName: string;
  doctorName: string;
  date: string;
  startTime: string;
  cancelReason?: string;
}

export function cancellationTemplate({
  patientName,
  doctorName,
  date,
  startTime,
  cancelReason,
}: CancellationProps) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #ef4444, #dc2626); padding: 32px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 32px; }
        .detail-row { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { color: #6b7280; font-weight: 500; display: block; margin-bottom: 4px; }
        .detail-value { color: #111827; font-weight: 600; }
        .footer { padding: 24px 32px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Appointment Cancelled</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${patientName}</strong>,</p>
          <p>Your appointment has been cancelled. Here were the details:</p>
          
          <div class="detail-row">
            <span class="detail-label">Doctor</span>
            <span class="detail-value">Dr. ${doctorName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date & Time</span>
            <span class="detail-value">${date} at ${startTime}</span>
          </div>
          ${cancelReason ? `
          <div class="detail-row">
            <span class="detail-label">Reason</span>
            <span class="detail-value">${cancelReason}</span>
          </div>
          ` : ""}
          
          <p style="margin-top: 24px;">
            You can book a new appointment at any time through the platform.
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
 * Cancellation email template for Doctor
 */
interface DoctorCancellationProps {
  doctorName: string;
  patientName: string;
  date: string;
  startTime: string;
  cancelReason?: string;
}

export function doctorCancellationTemplate({
  doctorName,
  patientName,
  date,
  startTime,
  cancelReason,
}: DoctorCancellationProps) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #ef4444, #b91c1c); padding: 32px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 32px; }
        .detail-row { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { color: #6b7280; font-weight: 500; display: block; margin-bottom: 4px; }
        .detail-value { color: #111827; font-weight: 600; }
        .footer { padding: 24px 32px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Appointment Cancelled</h1>
        </div>
        <div class="content">
          <p>Hello <strong>Dr. ${doctorName}</strong>,</p>
          <p>An appointment scheduled in your calendar has been cancelled:</p>
          
          <div class="detail-row">
            <span class="detail-label">Patient Name</span>
            <span class="detail-value">${patientName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date & Time</span>
            <span class="detail-value">${date} at ${startTime}</span>
          </div>
          ${cancelReason ? `
          <div class="detail-row">
            <span class="detail-label">Cancellation Reason</span>
            <span class="detail-value">${cancelReason}</span>
          </div>
          ` : ""}
          
          <p style="margin-top: 24px; color: #6b7280;">
            This slot has automatically been released and made available for other bookings.
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
