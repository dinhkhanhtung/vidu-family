import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Test exact NEXTAUTH_URL value and format
    const nextAuthUrl = process.env.NEXTAUTH_URL
    const isUrlFormatValid = nextAuthUrl && !nextAuthUrl.endsWith('/')

    // Test Google OAuth config
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
    const hasValidGoogleConfig = !!(googleClientId && googleClientSecret)
    
    // Mask sensitive data but show format
    const maskedGoogleId = googleClientId ? 
      `${googleClientId.substring(0, 6)}...${googleClientId.substring(googleClientId.length - 4)}` : 
      'NOT_SET'

    // Test auth session
    const session = await getServerSession(authOptions)

    // Get callback URL that should be registered in Google Console
    const expectedCallback = `${nextAuthUrl}/api/auth/callback/google`

    return NextResponse.json({
      status: 'ok',
      urls: {
        configured: nextAuthUrl,
        isFormatValid: isUrlFormatValid,
        expectedCallback: expectedCallback
      },
      auth: {
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
        googleClientId: maskedGoogleId,
        hasValidGoogleConfig
      },
      session: {
        exists: !!session,
        data: session
      },
      checkList: {
        nextAuthUrl: !!nextAuthUrl && isUrlFormatValid,
        secret: !!process.env.NEXTAUTH_SECRET,
        googleId: !!googleClientId,
        googleSecret: !!googleClientSecret
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      error: {
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}