import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

// 55 min buffer — access token lives 60 min, so we refresh 5 min early
const ACCESS_TOKEN_TTL = 55 * 60 * 1000

async function refreshAccessToken(token) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/token/refresh/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: token.refresh }),
      }
    )
    if (!res.ok) throw new Error('Refresh failed')
    const data = await res.json()
    return {
      ...token,
      access: data.access,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL,
      // refresh token rotates if your backend sends a new one, otherwise keep existing
      refresh: data.refresh ?? token.refresh,
    }
  } catch {
    // Signal to the client that something is wrong
    return { ...token, error: 'RefreshAccessTokenError' }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          )
          if (!res.ok) return null
          const data = await res.json()
          return {
            id: data.user.id,
            email: data.user.email,
            name: `${data.user.first_name} ${data.user.last_name}`,
            role: data.user.role,
            organization: data.user.organization,
            access: data.tokens.access,
            refresh: data.tokens.refresh,
          }
        } catch {
          return null
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // First sign-in — store tokens and set expiry
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          organization: user.organization,
          access: user.access,
          refresh: user.refresh,
          accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL,
        }
      }

      // Access token still valid — return as-is
      if (Date.now() < token.accessTokenExpires) {
        return token
      }

      // Token expired — attempt refresh
      return refreshAccessToken(token)
    },

    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.organization = token.organization
      session.access = token.access
      session.refresh = token.refresh
      session.error = token.error // surface RefreshAccessTokenError to client if needed
      return session
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  session: { strategy: 'jwt' },
})