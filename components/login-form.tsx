"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IconEye, IconEyeOff } from "@tabler/icons-react"

// API endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function LoginForm() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const searchParams = useSearchParams()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setIsLoading(true)

		try {
			// Call the login API endpoint
			const response = await fetch(`${API_URL}/api/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			})

			// Handle rate limiting specifically
			if (response.status === 429) {
				throw new Error(
					"Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat."
				)
			}

			// Check if the response is OK before trying to parse JSON
			if (!response.ok) {
				if (response.status === 404) {
					throw new Error(
						"Endpoint API tidak ditemukan. Periksa konfigurasi server."
					)
				}

				// Try to parse response as JSON, but handle non-JSON responses gracefully
				let errorMessage
				try {
					const errorData = await response.json()
					errorMessage = errorData.message || `Error server: ${response.status}`
				} catch {
					errorMessage = `Error server: ${response.status}. Server tidak mengembalikan JSON yang valid.`
				}

				throw new Error(errorMessage)
			}

			// Parse response as JSON
			let data
			try {
				data = await response.json()
			} catch {
				throw new Error(
					"Respons tidak valid dari server: Bukan JSON yang valid"
				)
			}

			if (data.success && data.token) {
				// Store the token in localStorage
				localStorage.setItem("token", data.token)

				// Store user info if available
				if (data.user) {
					localStorage.setItem("user", JSON.stringify(data.user))
				}

				// Redirect after login
				const returnUrl = searchParams.get("returnUrl") || "/dashboard"
				window.location.href = returnUrl
			} else {
				throw new Error(
					data.message || "Login gagal - tidak ada token diterima"
				)
			}
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
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold">Masuk</h1>
				<p className="text-gray-500 dark:text-gray-400">
					Masukkan kredensial Anda untuk mengakses akun
				</p>
			</div>
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
					{error}
				</div>
			)}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="m@contoh.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="password">Kata Sandi</Label>
					</div>
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="absolute right-2 top-1/2 -translate-y-1/2"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? (
								<IconEyeOff className="h-4 w-4" />
							) : (
								<IconEye className="h-4 w-4" />
							)}
							<span className="sr-only">
								{showPassword
									? "Sembunyikan kata sandi"
									: "Tampilkan kata sandi"}
							</span>
						</Button>
					</div>
				</div>
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Sedang masuk..." : "Masuk"}
				</Button>
			</form>
		</div>
	)
}
