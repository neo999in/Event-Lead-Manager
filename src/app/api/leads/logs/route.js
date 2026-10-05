import { NextResponse } from 'next/server';
import dbManager from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 100;
    const leadId = searchParams.get('leadId');

    let logs;
    if (leadId) {
      logs = dbManager.getLeadLogs(leadId);
    } else {
      logs = dbManager.getAllRecentLogs(limit);
    }

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
