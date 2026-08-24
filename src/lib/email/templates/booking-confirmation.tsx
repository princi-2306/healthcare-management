/**
 * Booking confirmation email template for Patient
 */
interface BookingConfirmationProps {
  patientName: string;
  doctorName: string;
  specialisation: string;
  date: string;
  startTime: string;
  endTime: string;
}

export function bookingConfirmationTemplate({
  patientName,
  doctorName,
  specialisation,
  date,
  startTime,
  endTime,
}: BookingConfirmationProps) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 32px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 32px; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { color: #6b7280; font-weight: 500; }
        .detail-value { color: #111827; font-weight: 600; }
        .footer { padding: 24px 32px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 14px; }
        .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Appointment Confirmed</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${patientName}</strong>,</p>
          <p>Your appointment has been successfully booked. Here are the details:</p>
          
          <div class="detail-row">
            <span class="detail-label">Doctor</span>
            <span class="detail-value">Dr. ${doctorName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Specialisation</span>
            <span class="detail-value">${specialisation}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">${date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time</span>
            <span class="detail-value">${startTime} - ${endTime}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="badge">Confirmed</span>
          </div>
          
          <p style="margin-top: 24px; color: #6b7280;">
            Please arrive 10 minutes before your scheduled time. If you need to cancel or reschedule, 
            please do so at least 24 hours in advance.
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
 * Booking notification email template for Doctor
 */
interface DoctorBookingProps {
  doctorName: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  chiefComplaint?: string;
}

export function doctorBookingConfirmationTemplate({
  doctorName,
  patientName,
  date,
  startTime,
  endTime,
  chiefComplaint = "General Consultation",
}: DoctorBookingProps) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #0ea5e9, #0369a1); padding: 32px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 32px; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { color: #6b7280; font-weight: 500; }
        .detail-value { color: #111827; font-weight: 600; }
        .footer { padding: 24px 32px; background: #f9fafb; text-align: center; color: #6b7280; font-size: 14px; }
        .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 New Appointment Booked</h1>
        </div>
        <div class="content">
          <p>Hello <strong>Dr. ${doctorName}</strong>,</p>
          <p>A new appointment has been scheduled in your calendar. Here are the details:</p>
          
          <div class="detail-row">
            <span class="detail-label">Patient Name</span>
            <span class="detail-value">${patientName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">${date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time Slot</span>
            <span class="detail-value">${startTime} - ${endTime}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Chief Complaint</span>
            <span class="detail-value">${chiefComplaint}</span>
          </div>
          
          <p style="margin-top: 24px; color: #6b7280;">
            You can review the patient pre-visit summary on your doctor dashboard before the consultation.
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
