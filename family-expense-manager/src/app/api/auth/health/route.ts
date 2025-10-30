import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ ok: true, now: Date.now() })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
