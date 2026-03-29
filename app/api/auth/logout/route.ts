import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function POST() {
  const session = await getSession()
  session.destroy() // ← Limpia la cookie del browser
  return NextResponse.json({ success: true })
}