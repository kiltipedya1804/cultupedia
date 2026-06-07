// src/app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP, createUser, verifyUserEmail, getUserByEmail, updateLastLogin } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, code, purpose = 'login', full_name } = await request.json()

    // Validation
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      )
    }

    if (!['signup', 'login', 'password_reset'].includes(purpose)) {
      return NextResponse.json(
        { error: 'Purpose invalide' },
        { status: 400 }
      )
    }

    // Vérifier l'OTP
    const isValid = await verifyOTP(email, code, purpose)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Code invalide ou expiré' },
        { status: 401 }
      )
    }

    let user = await getUserByEmail(email)

    // Pour signup, créer un nouvel utilisateur
    if (purpose === 'signup') {
      if (user) {
        return NextResponse.json(
          { error: 'Email déjà utilisé' },
          { status: 409 }
        )
      }
      user = await createUser(email, full_name)
      await sendWelcomeEmail(email, full_name)
    } else if (purpose === 'login' || purpose === 'password_reset') {
      if (!user) {
        return NextResponse.json(
          { error: 'Email non trouvé' },
          { status: 404 }
        )
      }
      await updateLastLogin(user.id)
    }

    // Vérifier l'email si c'est un signup
    if (purpose === 'signup') {
      await verifyUserEmail(email)
    }

    // Créer un cookie de session (simple JWT)
    const token = require('jsonwebtoken').sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      message: 'Authentification réussie',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    })

    // Définir le cookie de session
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
    })

    return response
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
