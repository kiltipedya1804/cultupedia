// src/app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP, createUser, verifyUserEmail, getUserByEmail, updateLastLogin } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, code, purpose = 'login', full_name, role_label } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email et code requis' }, { status: 400 })
    }

    if (!['signup', 'login', 'password_reset'].includes(purpose)) {
      return NextResponse.json({ error: 'Purpose invalide' }, { status: 400 })
    }

    const isValid = await verifyOTP(email, code, purpose)
    if (!isValid) {
      return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 401 })
    }

    let user = await getUserByEmail(email)

    if (purpose === 'signup') {
      if (user) {
        return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
      }

      // Récupérer les données de l'inscription en attente
      const pending = await sql`
        SELECT full_name, role_label, password_hash FROM pending_registrations
        WHERE email = ${email} AND expires_at > NOW()
        LIMIT 1
      `
      const pendingData = pending[0]

      user = await createUser(email, pendingData?.full_name ?? full_name)
      await verifyUserEmail(email)

      // Sauvegarder role_label et password_hash
      await sql`
        UPDATE users SET
          role_label = ${pendingData?.role_label ?? role_label ?? null},
          password_hash = ${pendingData?.password_hash ?? null}
        WHERE email = ${email}
      `

      // Nettoyer
      await sql`DELETE FROM pending_registrations WHERE email = ${email}`

      await sendWelcomeEmail(email, pendingData?.full_name ?? full_name).catch(() => {})

    } else if (purpose === 'login' || purpose === 'password_reset') {
      if (!user) {
        return NextResponse.json({ error: 'Email non trouvé' }, { status: 404 })
      }
      await updateLastLogin(user.id)
    }

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    const response = NextResponse.json({
      message: 'Authentification réussie',
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
