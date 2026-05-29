"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

interface AuthCheckProps {
	children: React.ReactNode
}

export function AuthCheck({ children }: AuthCheckProps) {
	const [isLoading, setIsLoading] = useState(true)
	const router = useRouter()
	const pathname = usePathname()
	const { status } = useSession()

	useEffect(() => {
		// Skip auth check on login page to avoid redirect loop
		if (pathname === "/login") {
			setIsLoading(false)
			return
		}

		if (status === "loading") {
			return
		}

		if (status === "unauthenticated") {
			router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`)
			return
		}

		setIsLoading(false)
	}, [pathname, router, status])

	// Show nothing while checking authentication
	if (isLoading && pathname !== "/login") {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
					<p className="mt-4 text-gray-500">Loading...</p>
				</div>
			</div>
		)
	}

	return <>{children}</>
}
