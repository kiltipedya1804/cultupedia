// src/lib/auth.ts
import { sql } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const OTP_EXPIRY_MINUTES = 10

// ── Types ──────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'moderator' | 'admin'
  verified: boolean
  verified_at: string | null
  created_at: string
  last_login: string | null
}

// ── OTP Generation ──────────────────────────────────────────

export async function generateOTP(email: string, purpose: 'signup' | 'login' | 'password_reset'): Promise<string> {
  const code = Math.random().toString().slice(2, 8).padStart(6, '0')
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
  
  await sql`
    INSERT INTO otp_codes (email, code, purpose, expires_at)
    VALUES (${email}, ${code}, ${purpose}, ${expiresAt.toISOString()})
  `
  
  return code
}

export async function verifyOTP(email: string, code: string, purpose: 'signup' | 'login' | 'password_reset'): Promise<boolean> {
  const rows = await sql`
    SELECT * FROM otp_codes
    WHERE email = ${email} 
      AND code = ${code} 
      AND purpose = ${purpose}
      AND used = FALSE
      AND expires_at > NOW()
      AND attempts < max_attempts
  `
  
  if (rows.length === 0) {
    await sql`
      UPDATE otp_codes
      SET attempts = attempts + 1
      WHERE email = ${email} AND code = ${code} AND purpose = ${purpose}
    `
    return false
  }
  
  await sql`
    UPDATE otp_codes
    SET used = TRUE, used_at = NOW()
    WHERE email = ${email} AND code = ${code}
  `
  
  return true
}

// ── User Management ───────────────────────────────────────

export async function createUser(email: string, fullName?: string): Promise<User> {
  const rows = await sql<User[]>`
    INSERT INTO users (email, full_name, role, verified)
    VALUES (${email}, ${fullName || null}, 'user', FALSE)
    RETURNING id, email, full_name, role, verified, verified_at, created_at, last_login
  `
  
  return rows[0]
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const rows = await sql<User[]>`
    SELECT id, email, full_name, role, verified, verified_at, created_at, last_login
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `
  
  return rows[0] || null
}

export async function getUserById(id: string): Promise<User | null> {
  const rows = await sql<User[]>`
    SELECT id, email, full_name, role, verified, verified_at, created_at, last_login
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `
  
  return rows[0] || null
}

export async function verifyUserEmail(email: string): Promise<void> {
  await sql`
    UPDATE users
    SET verified = TRUE, verified_at = NOW()
    WHERE email = ${email}
  `
}

export async function updateLastLogin(userId: string): Promise<void> {
  await sql`
    UPDATE users
    SET last_login = NOW()
    WHERE id = ${userId}
  `
}

export async function updateUserRole(userId: string, role: 'user' | 'moderator' | 'admin'): Promise<void> {
  await sql`
    UPDATE users
    SET role = ${role}, updated_at = NOW()
    WHERE id = ${userId}
  `
}
