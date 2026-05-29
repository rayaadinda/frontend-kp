"use client"

import * as React from "react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEye, IconEyeOff } from "@tabler/icons-react"

export function LoginForm() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const searchParams = useSearchParams()
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setIsLoading(true)

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			})

			if (result?.error) {
				throw new Error("Email atau kata sandi tidak valid")
			}

			const returnUrl = searchParams.get("returnUrl") || "/dashboard"
			router.push(returnUrl)
		} catch (error: unknown) {
			console.error("Error login:", error)
			const errorMessage =
				error instanceof Error ? error.message : "Login gagal"
			setError(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="space-y-6 text-slate-700">
			<div className="space-y-2">
				<h1 className="font-[var(--font-sora)] text-3xl font-semibold text-slate-900">
					Sign in
				</h1>
				<p className="text-sm text-slate-500">
					Welcome back. Please enter your details.
				</p>
			</div>
			{error && (
				<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
					{error}
				</div>
			)}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email" className="text-sm text-slate-600">
						Email
					</Label>
					<Input
						id="email"
						type="email"
						placeholder="Enter your email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="h-11 rounded-md border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400"
						autoComplete="email"
					/>
				</div>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="password" className="text-sm text-slate-600">
							Password
						</Label>
					</div>
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="h-11 rounded-md border border-slate-200 bg-slate-50/70 pr-12 text-slate-900 placeholder:text-slate-400"
							autoComplete="current-password"
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? (
								<IconEyeOff className="h-4 w-4" />
							) : (
								<IconEye className="h-4 w-4" />
							)}
							<span className="sr-only">
								{showPassword
									? "Hide password"
									: "Show password"}
							</span>
						</Button>
					</div>
				</div>
				<Button
					type="submit"
					className="h-11 w-full rounded-md bg-primary text-white hover:bg-primary/90"
					disabled={isLoading}
				>
					{isLoading ? "Signing in..." : "Sign In"}
				</Button>
			</form>
		</div>
	)
}
