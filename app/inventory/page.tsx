"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { InventoryDataTable } from "@/components/inventory-data-table"
import { InventoryDataTableSkeleton } from "@/components/inventory-data-table-skeleton"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

// API endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// For development - set to false in production
const BYPASS_AUTH_FOR_DEV = true

interface InventoryItem {
	id: number
	name: string
	category: string
	quantity: number
	price: number
	status: "In Stock" | "Low Stock" | "Out of Stock"
	lastUpdated: string
}

// Function to map backend data to frontend format
const mapApiDataToInventoryItem = (apiData: unknown): InventoryItem => {
	if (typeof apiData !== "object" || apiData === null) {
		throw new Error("Invalid API data")
	}
	const item = apiData as Record<string, unknown>
	// Determine status based on quantity
	let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock"
	if ((item.quantity as number) === 0) {
		status = "Out of Stock"
	} else if ((item.quantity as number) < 10) {
		status = "Low Stock"
	}

	return {
		id: item._id as number,
		name: item.productName as string,
		category: (item.supplier as string) || "General",
		quantity: item.quantity as number,
		price: 0,
		status: status,
		lastUpdated: new Date(item.lastUpdated as string).toLocaleDateString(),
	}
}

export default function InventoryPage() {
	const [inventory, setInventory] = useState<InventoryItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [isLoggedIn, setIsLoggedIn] = useState(false)

	// Mock login function for development
	const handleDevLogin = () => {
		// In a real app, this would call your backend login API
		localStorage.setItem("token", "dev-token-for-testing")
		setIsLoggedIn(true)
		fetchInventory()
	}

	// Fetch inventory data function
	const fetchInventory = async () => {
		try {
			setLoading(true)
			setError("")

			// Prepare headers
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			}

			// Get token from localStorage
			const token = localStorage.getItem("token")

			// For development, allow bypassing authentication
			if (!token) {
				if (BYPASS_AUTH_FOR_DEV) {
					console.warn("Warning: Authentication bypassed for development")
				} else {
					setError("Authentication required")
					setLoading(false)
					return
				}
			} else {
				headers["Authorization"] = `Bearer ${token}`
				setIsLoggedIn(true)
			}

			// Actual API call
			const response = await fetch(`${API_URL}/api/inventory`, { headers })

			if (!response.ok) {
				throw new Error(`Failed to fetch inventory: ${response.status}`)
			}

			const data = await response.json()

			if (data.success && Array.isArray(data.data)) {
				// Map API data to our frontend format
				const inventoryItems = data.data.map(mapApiDataToInventoryItem)
				setInventory(inventoryItems)
			} else {
				throw new Error("Invalid data format received from API")
			}
		} catch (err: unknown) {
			console.error("Error fetching inventory:", err)
			const errorMsg =
				err instanceof Error ? err.message : "Failed to fetch inventory"
			setError(errorMsg)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchInventory()
	}, [])

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							<div className="px-4 lg:px-6">
								<h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
								<p className="text-muted-foreground">
									Manage your inventory items and stock levels
								</p>
							</div>
							<div className="px-4 lg:px-6">
								{loading ? (
									<InventoryDataTableSkeleton />
								) : error ? (
									<div className="bg-red-50 p-4 rounded-md border border-red-200">
										<h3 className="text-red-600 font-medium mb-2">Error</h3>
										<p className="text-red-500">{error}</p>
										{error.includes("Authentication") && !isLoggedIn && (
											<Button
												onClick={handleDevLogin}
												className="mt-4 bg-red-500 hover:bg-red-600"
											>
												Login (Development Only)
											</Button>
										)}
									</div>
								) : (
									<InventoryDataTable
										data={inventory}
										onRefresh={fetchInventory}
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
