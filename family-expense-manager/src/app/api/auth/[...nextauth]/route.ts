import NextAuth from "next-auth"
import { authOptions } from "../../../../lib/auth"

const handler = NextAuth(authOptions)

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
