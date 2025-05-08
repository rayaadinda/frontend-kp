import type { Metadata } from "next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthCheck } from "@/components/auth-check"
import { Toaster } from "@/components/ui/sonner"
import PageTransition from "@/components/PageTransition"

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
				<Toaster />
				<AuthCheck>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<PageTransition>{children}</PageTransition>
					</ThemeProvider>
				</AuthCheck>
			</body>
		</html>
	)
}
