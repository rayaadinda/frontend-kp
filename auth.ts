import NextAuth, { type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

const apiUrl =
	process.env.BACKEND_API_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	"http://localhost:5000"

const authSecret =
	process.env.AUTH_SECRET ||
	process.env.NEXTAUTH_SECRET ||
	"kji-dashboard-dev-secret"

const config = {
	pages: {
		signIn: "/login",
	},
	secret: authSecret,
	session: {
		strategy: "jwt",
	},
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials) => {
				const email = credentials?.email as string | undefined
				const password = credentials?.password as string | undefined

				if (!email || !password) {
					return null
				}

				const response = await fetch(`${apiUrl}/api/auth/login`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email, password }),
				})

				if (!response.ok) {
					return null
				}

				const data = (await response.json()) as {
					success?: boolean
					token?: string
					user?: {
						id: string
						email: string
						username: string
						role?: string
					}
				}

				if (!data.success || !data.token || !data.user) {
					return null
				}

				return {
					id: data.user.id,
					name: data.user.username,
					email: data.user.email,
					role: data.user.role,
					accessToken: data.token,
				}
			},
		}),
	],
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.id = user.id
				token.role = (user as { role?: string }).role
				token.accessToken = (user as { accessToken?: string }).accessToken
			}
			return token
		},
		session: async ({ session, token }) => {
			if (session.user) {
				session.user.id = token.id as string
				session.user.role = token.role as string | undefined
			}
			session.accessToken = token.accessToken as string | undefined
			return session
		},
		authorized: ({ auth, request }) => {
			const isLoggedIn = !!auth?.user
			const isLoginPage = request.nextUrl.pathname.startsWith("/login")
			if (isLoginPage) {
				return true
			}
			return isLoggedIn
		},
	},
} satisfies NextAuthConfig

export const { handlers, signIn, signOut, auth } = NextAuth(config)
