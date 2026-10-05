import { NextResponse } from 'next/server';
import dbManager from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const lead = dbManager.getLeadById(id);
    if (!lead) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const lead = dbManager.updateLead(id, data);
    if (!lead) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const success = dbManager.deleteLead(id);
    if (!success) return NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
