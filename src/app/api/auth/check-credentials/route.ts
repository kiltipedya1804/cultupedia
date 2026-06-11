// src/app/api/auth/check-credentials/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/auth'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password, purpose, full_name, role_label } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    if (purpose === 'signup') {
      // Vérifier que l'email n'existe pas déjà
      const existing = await getUserByEmail(email)
      if (existing) {
        return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
      }
      if (password.length < 6) {
        return NextResponse.json({ error: 'Mot de passe trop court (minimum 6 caractères)' }, { status: 400 })
      }
      // Stocker temporairement le hash pour l'utiliser après OTP
      const hash = await bcrypt.hash(password, 10)
      await sql`
        INSERT INTO pending_registrations (email, full_name, role_label, password_hash, expires_at)
        VALUES (${email}, ${full_name || null}, ${role_label || null}, ${hash}, NOW() + INTERVAL '30 minutes')
        ON CONFLICT (email) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          role_label = EXCLUDED.role_label,
          password_hash = EXCLUDED.password_hash,
          expires_at = EXCLUDED.expires_at
      `
      return NextResponse.json({ ok: true })
    }

    if (purpose === 'login') {
      const user = await getUserByEmail(email)
      if (!user) {
        return NextResponse.json({ error: 'Email non trouvé' }, { status: 404 })
      }
      // Vérifier le mot de passe
      const rows = await sql`SELECT password_hash FROM users WHERE email = ${email}`
      const hash = rows[0]?.password_hash
      if (!hash) {
        // Pas de mot de passe défini — autoriser connexion OTP uniquement
        return NextResponse.json({ ok: true, otp_only: true })
      }
      const valid = await bcrypt.compare(password, hash)
      if (!valid) {
        return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Purpose invalide' }, { status: 400 })
  } catch (error) {
    console.error('Check credentials error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
