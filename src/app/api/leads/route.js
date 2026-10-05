import { NextResponse } from 'next/server';
import dbManager from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    event: searchParams.get('event') || '',
    priority: searchParams.get('priority') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'DESC'
  };
  try {
    const leads = dbManager.getAllLeads(filters);
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const lead = dbManager.createLead(data);
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
