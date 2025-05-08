"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
	IconAlertCircle,
	IconArrowLeft,
	IconCircleCheck,
} from "@tabler/icons-react"

// API endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function AddInventoryItemPage() {
	const router = useRouter()
	const [formData, setFormData] = useState({
		productCode: "", // Updated field name to match backend
		productName: "", // Updated field name to match backend
		quantity: "",
		supplier: "", // New field to match backend
		location: "", // New field to match backend
	})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		setError("")
		setSuccess("")

		try {
			// Get token from localStorage
			const token = localStorage.getItem("token")

			if (!token) {
				setError("Authentication required")
				setIsSubmitting(false)
				return
			}

			// Convert quantity to number
			const payload = {
				...formData,
				quantity: parseInt(formData.quantity, 10),
			}

			const response = await fetch(`${API_URL}/inventory`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.message || "Failed to add item")
			}

			if (data.success) {
				setSuccess("Item added successfully!")
				// Clear form
				setFormData({
					productCode: "",
					productName: "",
					quantity: "",
					supplier: "",
					location: "",
				})
				// Navigate back to inventory page after delay
				setTimeout(() => {
					router.push("/inventory")
				}, 2000)
			} else {
				throw new Error(data.message || "Failed to add item")
			}
		} catch (err: any) {
			console.error("Error adding item:", err)
			setError(err.message || "Failed to add item")
		} finally {
			setIsSubmitting(false)
		}
	}

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
								<Button
									variant="outline"
									onClick={() => router.back()}
									className="mb-4"
								>
									<IconArrowLeft className="mr-2 h-4 w-4" />
									Back to Inventory
								</Button>
								<h1 className="text-2xl font-bold tracking-tight">
									Add Inventory Item
								</h1>
								<p className="text-muted-foreground">
									Add a new item to your inventory
								</p>
							</div>
							<div className="px-4 lg:px-6">
								{error && (
									<div className="mb-4 border border-red-500 bg-red-50 p-4 rounded-md">
										<div className="flex items-center gap-2 text-red-500">
											<IconAlertCircle className="h-4 w-4" />
											<p className="font-semibold">Error</p>
										</div>
										<p className="text-red-500 mt-1">{error}</p>
									</div>
								)}
								{success && (
									<div className="mb-4 border border-green-500 bg-green-50 p-4 rounded-md">
										<div className="flex items-center gap-2 text-green-500">
											<IconCircleCheck className="h-4 w-4" />
											<p className="font-semibold">Success</p>
										</div>
										<p className="text-green-500 mt-1">{success}</p>
									</div>
								)}
								<Card>
									<CardHeader>
										<CardTitle>Item Details</CardTitle>
										<CardDescription>
											Enter the details of the new inventory item
										</CardDescription>
									</CardHeader>
									<form onSubmit={handleSubmit}>
										<CardContent className="space-y-4">
											<div className="grid gap-4 sm:grid-cols-2">
												<div className="space-y-2">
													<Label htmlFor="productCode">Item Code</Label>
													<Input
														id="productCode"
														name="productCode"
														placeholder="ULISO99AWG22"
														value={formData.productCode}
														onChange={handleChange}
														required
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="productName">Item Name</Label>
													<Input
														id="productName"
														name="productName"
														placeholder="Wire AWG 22 Colour Red"
														value={formData.productName}
														onChange={handleChange}
														required
													/>
												</div>
											</div>

											<div className="grid gap-4 sm:grid-cols-3">
												<div className="space-y-2">
													<Label htmlFor="quantity">Quantity</Label>
													<Input
														id="quantity"
														name="quantity"
														type="number"
														min="0"
														placeholder="10"
														value={formData.quantity}
														onChange={handleChange}
														required
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="supplier">Supplier</Label>
													<Input
														id="supplier"
														name="supplier"
														placeholder="PT. Bersinar Sejahtera Gemilang"
														value={formData.supplier}
														onChange={handleChange}
														required
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="location">Location</Label>
													<Input
														id="location"
														name="location"
														placeholder="Warehouse A"
														value={formData.location}
														onChange={handleChange}
														required
													/>
												</div>
											</div>
										</CardContent>
										<CardFooter className="flex mt-2 justify-between">
											<Button
												variant="outline"
												type="button"
												onClick={() => router.back()}
												disabled={isSubmitting}
											>
												Cancel
											</Button>
											<Button type="submit" disabled={isSubmitting}>
												{isSubmitting ? "Adding..." : "Add Item"}
											</Button>
										</CardFooter>
									</form>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
