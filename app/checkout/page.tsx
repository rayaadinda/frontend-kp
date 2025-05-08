"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

import {
	IconSearch,
	IconPlus,
	IconTrash,
	IconAlertCircle,
	IconCircleCheck,
	IconLoader2,
} from "@tabler/icons-react"
import { toast } from "sonner"

// API endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Define inventory item interface
interface InventoryItem {
	_id: string
	productCode: string
	productName: string
	quantity: number
	supplier: string
	location: string
	unit?: string
	minLevel?: number
}

type CartItem = InventoryItem & { quantity: number }

export default function CheckoutPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedCategory, setSelectedCategory] = useState("All")
	const [searchResults, setSearchResults] = useState<InventoryItem[]>([])
	const [cartItems, setCartItems] = useState<CartItem[]>([])
	const [workOrderNumber, setWorkOrderNumber] = useState("")
	const [quantities, setQuantities] = useState<Record<string, number>>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")
	const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
	const [categories, setCategories] = useState<string[]>([])

	// Fetch inventory data from API
	const fetchInventory = async () => {
		try {
			setIsLoading(true)
			setError("")

			// Get token from localStorage
			const token = localStorage.getItem("token")
			if (!token) {
				setError("Otentikasi diperlukan")
				setIsLoading(false)
				return
			}

			const response = await fetch(`${API_URL}/api/inventory`, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			})

			if (!response.ok) {
				throw new Error(`Error: ${response.status}`)
			}

			const data = await response.json()

			if (data.success && Array.isArray(data.data)) {
				// Process and set inventory items
				const items: InventoryItem[] = data.data.map((item: unknown) => {
					if (typeof item !== "object" || item === null)
						throw new Error("Invalid item")
					const i = item as Record<string, unknown>
					return {
						...i,
						unit: determineUnit((i.productName as string) || ""),
						minLevel: Math.round((i.quantity as number) * 0.1),
					} as InventoryItem
				})
				setInventoryItems(items)
				setSearchResults(items)

				// Extract unique types for category filtering
				const uniqueTypes = Array.from(
					new Set(
						items.map((item: InventoryItem) => determineType(item.productName))
					)
				) as string[]
				setCategories(uniqueTypes)
			}
		} catch (err: unknown) {
			console.error("Error fetching inventory:", err)
			const errorMsg =
				err instanceof Error ? err.message : "Gagal mengambil data"
			setError(`Gagal mengambil data: ${errorMsg}`)
		} finally {
			setIsLoading(false)
		}
	}

	// Helper to determine unit based on product name
	const determineUnit = (productName: string) => {
		const lowerName = productName.toLowerCase()
		if (
			lowerName.includes("wire") ||
			lowerName.includes("cable") ||
			lowerName.includes("kabel")
		) {
			return "Meter"
		}
		return "Pcs"
	}

	// Helper to determine item type based on product name
	const determineType = (productName: string) => {
		const lowerName = productName.toLowerCase()
		if (lowerName.includes("wire")) return "Wire"
		if (lowerName.includes("terminal")) return "Terminal"
		if (
			lowerName.includes("cable ties") ||
			lowerName.includes("cable tie") ||
			lowerName.includes("cabletie")
		)
			return "Cable Ties"
		return "Lainnya"
	}

	// Initial fetch
	useEffect(() => {
		fetchInventory()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Filter materials based on search query and category
	useEffect(() => {
		if (inventoryItems.length === 0) return

		let results = inventoryItems

		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			results = results.filter(
				(item) =>
					item.productCode.toLowerCase().includes(query) ||
					item.productName.toLowerCase().includes(query)
			)
		}

		if (selectedCategory !== "All") {
			results = results.filter(
				(item) => determineType(item.productName) === selectedCategory
			)
		}

		setSearchResults(results)
	}, [searchQuery, selectedCategory, inventoryItems])

	// Handle adding item to cart
	const addToCart = (item: InventoryItem) => {
		const quantity = quantities[item._id] || 0
		if (!quantity) return

		const existingItemIndex = cartItems.findIndex(
			(cartItem) => cartItem._id === item._id
		)

		if (existingItemIndex >= 0) {
			const updatedItems = [...cartItems]
			updatedItems[existingItemIndex].quantity += quantity
			setCartItems(updatedItems)
		} else {
			setCartItems([...cartItems, { ...item, quantity }])
		}

		// Reset quantity input
		setQuantities({ ...quantities, [item._id]: 0 })
	}

	// Handle removing item from cart
	const removeFromCart = (id: string) => {
		setCartItems(cartItems.filter((item) => item._id !== id))
	}

	// Handle quantity change
	const handleQuantityChange = (id: string, value: number) => {
		setQuantities({ ...quantities, [id]: value })
	}

	// Calculate total items in cart
	const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

	const handleCheckout = async () => {
		if (cartItems.length === 0 || !workOrderNumber) {
			setError(
				"Silakan tambahkan item ke keranjang dan masukkan nomor work order"
			)
			toast.error(
				"Silakan tambahkan item ke keranjang dan masukkan nomor work order"
			)
			return
		}

		setIsSubmitting(true)
		setError("")
		setSuccess("")

		try {
			// Get token from localStorage
			const token = localStorage.getItem("token")

			if (!token) {
				setError("Otentikasi diperlukan")
				toast.error("Otentikasi diperlukan")
				setIsSubmitting(false)
				return
			}

			// Format data for the API
			const checkoutData = {
				workOrderNumber,
				items: cartItems.map((item) => ({
					itemCode: item.productCode,
					quantity: item.quantity,
				})),
			}

			const response = await fetch(`${API_URL}/api/inventory/checkout`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(checkoutData),
			})

			// Handle rate limiting
			if (response.status === 429) {
				throw new Error(
					"Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat."
				)
			}

			// Try to parse response as JSON
			let data
			try {
				data = await response.json()
			} catch {
				throw new Error(
					`Error server: ${response.status}. Server tidak mengembalikan JSON yang valid.`
				)
			}

			if (!response.ok) {
				throw new Error(data.message || `Error server: ${response.status}`)
			}

			if (data.success) {
				toast.success("Material berhasil di-checkout!", {
					style: {
						background: "green",
					},
				})
				setSuccess("Material berhasil di-checkout!")
				// Clear cart
				setCartItems([])
				setWorkOrderNumber("")
				// Refresh inventory data to get updated quantities
				fetchInventory()
			} else {
				throw new Error(data.message || "Checkout gagal")
			}
		} catch (error: unknown) {
			console.error("Error during checkout:", error)
			const errorMessage =
				error instanceof Error ? error.message : "Checkout gagal"
			setError(errorMessage)
			toast.error(errorMessage, {
				style: {
					background: "red",
				},
			})
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
								<h1 className="text-2xl font-bold tracking-tight">
									Pengambilan Material
								</h1>
								<p className="text-muted-foreground">
									Proses pengambilan material untuk produksi
								</p>
							</div>

							<div className="px-4 lg:px-6">
								{/* Work Order Input */}
								<div className="mb-6">
									<Card>
										<CardHeader>
											<CardTitle>Informasi Work Order</CardTitle>
											<CardDescription>
												Masukkan detail work order Anda
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="grid gap-4 sm:grid-cols-2">
												<div className="space-y-2">
													<label
														htmlFor="work-order"
														className="text-sm font-medium"
													>
														Nomor Work Order
													</label>
													<Input
														id="work-order"
														placeholder="Masukkan nomor work order"
														value={workOrderNumber}
														onChange={(e) => setWorkOrderNumber(e.target.value)}
													/>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>

								{error && (
									<div className="mb-6 border border-red-500 bg-red-50 p-4 rounded-md">
										<div className="flex items-center gap-2 text-red-500">
											<IconAlertCircle className="h-4 w-4" />
											<p className="font-semibold">Error</p>
										</div>
										<p className="text-red-500 mt-1">{error}</p>
									</div>
								)}
								{success && (
									<div className="mb-6 border border-green-500 bg-green-50 p-4 rounded-md">
										<div className="flex items-center gap-2 text-green-500">
											<IconCircleCheck className="h-4 w-4" />
											<p className="font-semibold">Berhasil</p>
										</div>
										<p className="text-green-500 mt-1">{success}</p>
									</div>
								)}

								<div className="space-y-6">
									{/* Main Search and Results */}
									<Card>
										<CardHeader>
											<CardTitle>Pencarian Material</CardTitle>
											<CardDescription>
												Cari material berdasarkan kode atau deskripsi
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											{/* Search Bar */}
											<div className="relative">
												<IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
												<Input
													type="search"
													placeholder="Cari berdasarkan kode atau deskripsi..."
													className="pl-9"
													value={searchQuery}
													onChange={(e) => setSearchQuery(e.target.value)}
												/>
											</div>

											{/* Category Filters */}
											<div className="flex items-center gap-2 overflow-auto pb-2">
												<span className="text-sm font-medium">Filter:</span>
												<Button
													variant={
														selectedCategory === "All" ? "default" : "outline"
													}
													size="sm"
													onClick={() => setSelectedCategory("All")}
												>
													Semua
												</Button>
												{categories.map((category) => (
													<Button
														key={category}
														variant={
															selectedCategory === category
																? "default"
																: "outline"
														}
														size="sm"
														onClick={() => setSelectedCategory(category)}
													>
														{category}
													</Button>
												))}
											</div>

											{/* Results Table */}
											<div className="rounded-md border overflow-auto">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>Kode Item</TableHead>
															<TableHead>Deskripsi</TableHead>
															<TableHead className="text-right">
																Tersedia
															</TableHead>
															<TableHead className="w-[140px]">
																Jumlah
															</TableHead>
															<TableHead className="w-[80px]"></TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{isLoading ? (
															<TableRow>
																<TableCell
																	colSpan={5}
																	className="h-24 text-center"
																>
																	<div className="flex justify-center items-center">
																		<IconLoader2 className="h-5 w-5 animate-spin mr-2" />
																		Memuat data...
																	</div>
																</TableCell>
															</TableRow>
														) : searchResults.length > 0 ? (
															searchResults.map((item) => (
																<TableRow key={item._id}>
																	<TableCell className="font-medium">
																		{item.productCode}
																	</TableCell>
																	<TableCell>{item.productName}</TableCell>
																	<TableCell className="text-right">
																		<span
																			className={`${
																				item.quantity <= (item.minLevel || 0)
																					? "text-red-500"
																					: ""
																			}`}
																		>
																			{item.quantity} {item.unit || "Pcs"}
																		</span>
																	</TableCell>
																	<TableCell>
																		<Input
																			type="number"
																			min="0"
																			max={item.quantity}
																			value={quantities[item._id] || ""}
																			onChange={(e) =>
																				handleQuantityChange(
																					item._id,
																					parseInt(e.target.value) || 0
																				)
																			}
																		/>
																	</TableCell>
																	<TableCell>
																		<Button
																			variant="ghost"
																			size="sm"
																			onClick={() => addToCart(item)}
																			disabled={
																				!quantities[item._id] ||
																				quantities[item._id] <= 0 ||
																				quantities[item._id] > item.quantity
																			}
																		>
																			<IconPlus className="h-4 w-4" />
																		</Button>
																	</TableCell>
																</TableRow>
															))
														) : (
															<TableRow>
																<TableCell
																	colSpan={5}
																	className="h-24 text-center"
																>
																	Tidak ada hasil ditemukan.
																</TableCell>
															</TableRow>
														)}
													</TableBody>
												</Table>
											</div>
										</CardContent>
									</Card>

									{/* Shopping Cart */}
									<Card>
										<CardHeader className="flex flex-row items-center justify-between">
											<div>
												<CardTitle>Keranjang Material</CardTitle>
												<CardDescription>
													Item siap untuk checkout
												</CardDescription>
											</div>
											<Badge variant="outline">{totalItems} item</Badge>
										</CardHeader>
										<CardContent className="overflow-auto">
											<div className="rounded-md border">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>Kode Item</TableHead>
															<TableHead>Deskripsi</TableHead>
															<TableHead className="text-right">
																Jumlah
															</TableHead>
															<TableHead className="w-[60px]"></TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{cartItems.length > 0 ? (
															cartItems.map((item) => (
																<TableRow key={`cart-${item._id}`}>
																	<TableCell className="font-medium">
																		{item.productCode}
																	</TableCell>
																	<TableCell>{item.productName}</TableCell>
																	<TableCell className="text-right">
																		{item.quantity} {item.unit || "Pcs"}
																	</TableCell>
																	<TableCell>
																		<Button
																			variant="ghost"
																			size="sm"
																			onClick={() => removeFromCart(item._id)}
																		>
																			<IconTrash className="h-4 w-4 text-red-500" />
																		</Button>
																	</TableCell>
																</TableRow>
															))
														) : (
															<TableRow>
																<TableCell
																	colSpan={4}
																	className="h-24 text-center"
																>
																	Tidak ada item dalam keranjang.
																</TableCell>
															</TableRow>
														)}
													</TableBody>
												</Table>
											</div>
										</CardContent>
										<CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
											<Button
												variant="outline"
												disabled={cartItems.length === 0}
												onClick={() => setCartItems([])}
												className="w-full sm:w-auto"
											>
												Hapus Semua
											</Button>
											<Button
												disabled={
													cartItems.length === 0 ||
													!workOrderNumber ||
													isSubmitting
												}
												onClick={handleCheckout}
												className="w-full sm:w-auto"
											>
												{isSubmitting ? (
													<>
														<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
														Memproses...
													</>
												) : (
													"Checkout Material"
												)}
											</Button>
										</CardFooter>
									</Card>
								</div>
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
