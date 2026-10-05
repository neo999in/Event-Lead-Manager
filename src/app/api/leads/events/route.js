import { NextResponse } from 'next/server';
import dbManager from '@/lib/db';

export async function GET() {
  try {
    const events = dbManager.getDistinctEvents();
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
