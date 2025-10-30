import NextAuth from "next-auth"
import { authOptions } from "../../../../lib/auth"

// Add debug logging to track requests
const handler = NextAuth({
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    async signIn(params) {
      console.log('[NextAuth] Sign in attempt:', { provider: params.account?.provider })
      return authOptions.callbacks?.signIn?.(params) ?? true
    },
    async jwt(params) {
      console.log('[NextAuth] JWT callback:', { email: params.token?.email })
      return authOptions.callbacks?.jwt?.(params) ?? params.token
    },
    async session(params) {
      console.log('[NextAuth] Session callback:', { userId: params.token?.sub })
      return authOptions.callbacks?.session?.(params) ?? params.session
    }
  }
})

// Export common HTTP methods to avoid 404s for less-common method usages
export {
	handler as GET,
	handler as POST,
	handler as PUT,
	handler as DELETE,
	handler as PATCH,
	handler as OPTIONS,
	handler as HEAD,
}
