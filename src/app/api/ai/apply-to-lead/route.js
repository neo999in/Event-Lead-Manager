import { NextResponse } from 'next/server';
import dbManager from '@/lib/db';

export async function POST(request) {
  try {
    const { leadId, ai_summary, ai_drafted_email } = await request.json();
    if (!leadId) {
      return NextResponse.json({ success: false, message: 'Lead ID required' }, { status: 400 });
    }
    
    const updates = {};
    if (ai_summary !== undefined) updates.ai_summary = ai_summary;
    if (ai_drafted_email !== undefined) updates.ai_drafted_email = ai_drafted_email;
    
    const lead = dbManager.updateLead(leadId, updates);
    if (!lead) {
      return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: lead, message: 'AI insights applied' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
