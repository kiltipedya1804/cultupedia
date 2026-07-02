// src/app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, nom, preferences } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // Check if already subscribed
    const existing = await sql`
      SELECT id, confirmed, unsubscribed_at FROM newsletter_subscribers WHERE email = ${email}
    `

    if (existing.length > 0) {
      const sub = existing[0]
      if (sub.confirmed && !sub.unsubscribed_at) {
        return NextResponse.json({ error: 'Déjà inscrit' }, { status: 409 })
      }
      // Re-subscribe
      await sql`
        UPDATE newsletter_subscribers
        SET confirmed = FALSE, unsubscribed_at = NULL, nom = ${nom ?? null}
        WHERE email = ${email}
      `
    } else {
      await sql`
        INSERT INTO newsletter_subscribers (email, nom, preferences)
        VALUES (${email}, ${nom ?? null}, ${preferences ?? []})
      `
    }

    // Get token for confirmation
    const rows = await sql`SELECT token FROM newsletter_subscribers WHERE email = ${email}`
    const token = rows[0]?.token

    // Send confirmation email
    const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://cultupedia.vercel.app'}/newsletter/confirm?token=${token}`

    await resend.emails.send({
      from: process.env.FROM_EMAIL ?? 'Cultupedia <onboarding@resend.dev>',
      to: email,
      subject: '✉️ Confirmez votre inscription à Cultupedia',
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1A1A24;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <div style="width: 36px; height: 36px; border-radius: 8px; overflow: hidden; display: inline-block;">
                <div style="height: 50%; background: #00235B;"></div>
                <div style="height: 50%; background: #C1001F;"></div>
              </div>
              <span style="font-size: 24px; font-weight: 700;">Cultu<span style="color: #C1001F;">pedia</span></span>
            </div>
          </div>
          <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 16px; color: #1A1A24;">
            Bienvenue${nom ? `, ${nom}` : ''} ! 🇭🇹
          </h1>
          <p style="font-size: 16px; color: #5A5A6E; line-height: 1.6; margin-bottom: 24px;">
            Merci de votre intérêt pour Cultupedia — l'encyclopédie vivante de la culture haïtienne.
            Confirmez votre inscription pour recevoir nos actualités.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${confirmUrl}" style="background: #C1001F; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
              Confirmer mon inscription
            </a>
          </div>
          <p style="font-size: 13px; color: #9090A8; margin-top: 32px; text-align: center;">
            Si vous n'avez pas demandé cette inscription, ignorez cet email.
          </p>
          <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9090A8; text-align: center;">
            © ${new Date().getFullYear()} Cultupedia — La mémoire culturelle haïtienne
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter subscribe error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
