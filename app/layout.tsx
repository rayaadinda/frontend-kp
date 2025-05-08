import type { Metadata } from "next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthCheck } from "@/components/auth-check"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "KJI - Inventory Management System",
	description: "Inventory management system for CV Kurnia Jaya Industri",
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<AuthCheck>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
					</ThemeProvider>
				</AuthCheck>
			</body>
		</html>
	)
}
