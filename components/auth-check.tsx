"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthCheckProps {
	children: React.ReactNode
}

export function AuthCheck({ children }: AuthCheckProps) {
	const [isLoading, setIsLoading] = useState(true)
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		// Skip auth check on login page to avoid redirect loop
		if (pathname === "/login") {
			setIsLoading(false)
			return
		}

		const checkAuth = () => {
			const token = localStorage.getItem("token")

			if (!token) {
				// Redirect to login page with return URL
				router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`)
			} else {
				setIsLoading(false)
			}
		}

		checkAuth()
	}, [pathname, router])

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
