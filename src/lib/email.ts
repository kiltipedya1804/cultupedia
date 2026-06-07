// src/lib/email.ts
/**
 * Email service - uses Resend (https://resend.com)
 * 
 * Setup:
 * 1. npm install resend
 * 2. Add RESEND_API_KEY to .env.local
 * 3. Add FROM_EMAIL to .env.local
 */

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@cultupedia.ht'
const APP_NAME = 'Cultupedia'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendOTPEmail(email: string, code: string, purpose: 'signup' | 'login' | 'password_reset'): Promise<boolean> {
  try {
    // Check if Resend is available
    const { Resend } = await import('resend')
    if (!Resend) throw new Error('Resend not installed')

    const resend = new Resend(process.env.RESEND_API_KEY)

    const purposeText = {
      signup: 'créer votre compte',
      login: 'vous connecter',
      password_reset: 'réinitialiser votre mot de passe',
    }[purpose]

    const subject = {
      signup: `${APP_NAME} - Confirmez votre inscription`,
      login: `${APP_NAME} - Code de connexion`,
      password_reset: `${APP_NAME} - Réinitialisation du mot de passe`,
    }[purpose]

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #1a1a1a; }
            .code { background-color: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; }
            .code-value { font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #d4a373; font-family: monospace; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${APP_NAME}</div>
            </div>
            
            <h2>Bienvenue sur ${APP_NAME}!</h2>
            <p>Vous avez demandé à ${purposeText}. Utilisez le code ci-dessous pour continuer:</p>
            
            <div class="code">
              <div class="code-value">${code}</div>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Ce code expire dans 10 minutes. Si vous n'avez pas effectué cette demande, veuillez ignorer cet email.
            </p>
            
            <div class="footer">
              <p>&copy; 2025 ${APP_NAME}. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
    })

    return !!response.id
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    // Fallback: log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 OTP Code for ${email}: ${code}`)
    }
    return false
  }
}

export async function sendWelcomeEmail(email: string, fullName?: string): Promise<boolean> {
  try {
    const { Resend } = await import('resend')
    if (!Resend) throw new Error('Resend not installed')

    const resend = new Resend(process.env.RESEND_API_KEY)
    const name = fullName || 'utilisateur'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #1a1a1a; }
            .button { background-color: #d4a373; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${APP_NAME}</div>
            </div>
            
            <h2>Bienvenue, ${name}!</h2>
            <p>Merci de vous être inscrit sur ${APP_NAME}. Votre compte est maintenant actif.</p>
            
            <p>Vous pouvez maintenant:</p>
            <ul>
              <li>Explorer la culture haïtienne</li>
              <li>Voter et commenter les entrées</li>
              <li>Participer à la validation de nos données</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="${APP_URL}" class="button">Accéder à ${APP_NAME}</a>
            </p>
            
            <div class="footer">
              <p>&copy; 2025 ${APP_NAME}. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Bienvenue sur ${APP_NAME}!`,
      html,
    })

    return !!response.id
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return false
  }
}
