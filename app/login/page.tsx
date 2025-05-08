"use client"

import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-6">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<div className="flex flex-col items-center space-y-2 text-center">
					<div className="flex items-center justify-center rounded-full bg-gray-100 p-2 mb-4">
						{/* You can replace with your actual company logo */}
						<h1 className="text-xl font-bold">KJI</h1>
					</div>
					<h1 className="text-2xl font-bold">CV Kurnia Jaya Industri</h1>
					<p className="text-sm text-muted-foreground">
						Sistem Manajemen Inventaris
					</p>
				</div>
				<div className="w-full">
					<LoginForm />
				</div>
			</div>
		</div>
	)
}
