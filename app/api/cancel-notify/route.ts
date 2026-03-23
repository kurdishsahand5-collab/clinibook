import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
    const { patientEmail, patientName, reason, service, date, time } = await req.json()

    try {
        await resend.emails.send({
            from: 'CliniBook Medical <onboarding@resend.dev>',
            to: patientEmail,
            subject: `Important: Your Appointment Has Been Cancelled`,
            html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:32px 40px;text-align:center;">
              <div style="font-size:32px;margin-bottom:8px;">🏥</div>
              <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">Appointment Update</h1>
              <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">We wanted to reach out personally</p>
            </div>

            <!-- Body -->
            <div style="padding:36px 40px;">
              <p style="font-size:16px;color:#1e293b;margin:0 0 16px;">Dear <strong>${patientName}</strong>,</p>
              
              <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">
                We hope this message finds you well. We sincerely apologize for the inconvenience, 
                but we need to inform you that your upcoming appointment has been cancelled.
              </p>

              <!-- Appointment Details Box -->
              <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:4px solid #0ea5e9;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Appointment Details</p>
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#64748b;font-weight:500;">Service</td>
                    <td style="padding:6px 0;font-size:14px;color:#1e293b;font-weight:600;text-align:right;">${service}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#64748b;font-weight:500;">Date</td>
                    <td style="padding:6px 0;font-size:14px;color:#1e293b;font-weight:600;text-align:right;">${date}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#64748b;font-weight:500;">Time</td>
                    <td style="padding:6px 0;font-size:14px;color:#1e293b;font-weight:600;text-align:right;">${time}</td>
                  </tr>
                </table>
              </div>

              <!-- Reason Box -->
              <div style="background:#fef2f2;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:4px solid #dc2626;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.5px;">Reason for Cancellation</p>
                <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.6;">${reason}</p>
              </div>

              <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;">
                We truly value your time and trust in us. Please don't hesitate to contact us 
                to reschedule your appointment at a time that works best for you. 
                We look forward to seeing you soon.
              </p>

              <p style="font-size:15px;color:#1e293b;margin:0;">
                Warm regards,<br/>
                <strong>The Medical Team</strong>
              </p>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                To reschedule, simply reply to this email or contact us directly.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Email send error:', error)
        return NextResponse.json({ success: false, error }, { status: 500 })
    }
}