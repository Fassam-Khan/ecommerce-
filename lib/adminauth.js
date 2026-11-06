import { cookies } from 'next/headers'

// PLACEHOLDER guard. Replace the body with your real admin check
// (NextAuth session, JWT, etc.). Until then it compares a cookie called
// "admin_token" with ADMIN_TOKEN from your .env.local.
export async function requireAdmin() {
  const token = process.env.ADMIN_TOKEN
  if (!token) return false
  const store = await cookies() // works on Next 14 and 15
  return store.get('admin_token')?.value === token
}