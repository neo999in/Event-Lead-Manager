import { NextResponse } from 'next/server';
import geminiService from '@/lib/geminiService';

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await geminiService.summarizeNotes(data);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
