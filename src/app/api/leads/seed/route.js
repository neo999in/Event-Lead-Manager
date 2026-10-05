import { NextResponse } from 'next/server';
import dbManager from '@/lib/db';

export async function POST() {
  try {
    const count = dbManager.seedDemoData();
    return NextResponse.json({ success: true, message: `Seeded ${count} demo leads.` });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
