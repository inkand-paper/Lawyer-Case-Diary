import { getAuthContext } from "@/lib/auth-server";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAuthContext();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const hearings = await db.hearing.findMany({
    where: {
      case: {
        OR: [
          { userId: user.id },
          user.chamberId ? { chamberId: user.chamberId } : {}
        ]
      }
    },
    include: { case: true }
  });

  // Basic iCal generator logic without external deps for simplicity
  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lawyer Case Diary//EN\n`;

  hearings.forEach(hearing => {
    // Basic date formatting
    const start = hearing.hearingDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = hearing.id + '@lawyercasediary.com';
    
    ical += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${start}
DTSTART:${start}
SUMMARY:Hearing for ${hearing.case.caseNumber} - ${hearing.case.title}
DESCRIPTION:${hearing.notes || 'No description provided'}
END:VEVENT\n`;
  });

  ical += `END:VCALENDAR`;

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="hearings.ics"',
    },
  });
}
