import { NextResponse } from 'next/server';
import dbManager from '@/lib/db';

export async function GET() {
  try {
    const stats = dbManager.getStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
