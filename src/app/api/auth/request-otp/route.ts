// src/app/api/auth/request-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, getUserByEmail, createUser } from '@/lib/auth'
import { sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, purpose = 'login' } = await request.json()

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    if (!['signup', 'login', 'password_reset'].includes(purpose)) {
      return NextResponse.json({ error: 'Purpose invalide' }, { status: 400 })
    }

    // Vérifier l'utilisateur
    const user = await getUserByEmail(email)

    // Pour signup, l'utilisateur ne doit pas exister
    if (purpose === 'signup' && user) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
    }

    // Pour login/password_reset, l'utilisateur doit exister
    if ((purpose === 'login' || purpose === 'password_reset') && !user) {
      return NextResponse.json({ error: 'Email non trouvé' }, { status: 404 })
    }

    // Générer l'OTP
    const code = await generateOTP(email, purpose)

    // Envoyer l'email
    const sent = await sendOTPEmail(email, code, purpose)

    if (!sent) {
      return NextResponse.json(
        { error: 'Impossible d\'envoyer l\'email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Code OTP envoyé à votre email',
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Masquer l'email
    })
  } catch (error) {
    console.error('OTP request error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
