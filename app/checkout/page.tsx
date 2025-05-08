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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	IconSearch,
	IconPlus,
	IconTrash,
	IconAlertCircle,
	IconCircleCheck,
} from "@tabler/icons-react"

// Sample material data (replace with actual API call)
const sampleMaterials = [
	{
		id: 1,
		itemCode: "ULISO99AWG22",
		description: "Wire AWG 22 Colour Red, 17/0.16TA",
		category: "Wires",
		available: 20130,
		unit: "Meter",
		minLevel: 5000,
	},
	{
		id: 2,
		itemCode: "ULISO99AWG22B",
		description: "Wire AWG 22 Colour Black, 17/0.16TA",
		category: "Wires",
		available: 20130,
		unit: "Meter",
		minLevel: 5000,
	},
	{
		id: 3,
		itemCode: "NISO-100",
		description: "Cable Ties, Natural 2.5 x 100 mm",
		category: "Accessories",
		available: 95000,
		unit: "Pcs",
		minLevel: 10000,
	},
	{
		id: 4,
		itemCode: "TF187106-2",
		description: "Terminal Lug Type Flag",
		category: "Terminals",
		available: 4200,
		unit: "Pcs",
		minLevel: 1000,
	},
	{
		id: 5,
		itemCode: "29773-85-2",
		description: "Terminal Flag 110",
		category: "Terminals",
		available: 1200,
		unit: "Pcs",
		minLevel: 500,
	},
]

// Sample recent items
const recentItems = [
	{
		id: 1,
		itemCode: "ULISO99AWG22",
		description: "Wire AWG 22 Colour Red",
		timestamp: "Today, 10:45 AM",
	},
	{
		id: 3,
		itemCode: "NISO-100",
		description: "Cable Ties, Natural 2.5 x 100 mm",
		timestamp: "Today, 09:30 AM",
	},
	{
		id: 4,
		itemCode: "TF187106-2",
		description: "Terminal Lug Type Flag",
		timestamp: "Yesterday, 04:15 PM",
	},
]

// Sample favorite items
const favoriteItems = [
	{ id: 1, itemCode: "ULISO99AWG22", description: "Wire AWG 22 Colour Red" },
	{ id: 2, itemCode: "ULISO99AWG22B", description: "Wire AWG 22 Colour Black" },
]

// Sample predefined kits
const materialKits = [
	{
		id: 1,
		name: "Basic Harness Kit A",
		description: "Standard materials for basic harness type A",
		items: [
			{ itemCode: "ULISO99AWG22", quantity: 10, unit: "Meter" },
			{ itemCode: "NISO-100", quantity: 20, unit: "Pcs" },
			{ itemCode: "TF187106-2", quantity: 5, unit: "Pcs" },
		],
	},
	{
		id: 2,
		name: "Complex Harness Kit B",
		description: "Materials for complex harness type B",
		items: [
			{ itemCode: "ULISO99AWG22", quantity: 20, unit: "Meter" },
			{ itemCode: "ULISO99AWG22B", quantity: 15, unit: "Meter" },
			{ itemCode: "29773-85-2", quantity: 10, unit: "Pcs" },
		],
	},
]

export default function CheckoutPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedCategory, setSelectedCategory] = useState("All")
	const [searchResults, setSearchResults] = useState(sampleMaterials)
	const [cartItems, setCartItems] = useState<any[]>([])
	const [workOrderNumber, setWorkOrderNumber] = useState("")
	const [quantities, setQuantities] = useState<Record<number, number>>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")

	// Filter materials based on search query and category
	useEffect(() => {
		let results = sampleMaterials

		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			results = results.filter(
				(item) =>
					item.itemCode.toLowerCase().includes(query) ||
					item.description.toLowerCase().includes(query)
			)
		}

		if (selectedCategory !== "All") {
			results = results.filter((item) => item.category === selectedCategory)
		}

		setSearchResults(results)
	}, [searchQuery, selectedCategory])

	// Handle adding item to cart
	const addToCart = (item: any) => {
		const quantity = quantities[item.id] || 0
		if (!quantity) return

		const existingItemIndex = cartItems.findIndex(
			(cartItem) => cartItem.id === item.id
		)

		if (existingItemIndex >= 0) {
			const updatedItems = [...cartItems]
			updatedItems[existingItemIndex].quantity += quantity
			setCartItems(updatedItems)
		} else {
			setCartItems([...cartItems, { ...item, quantity }])
		}

		// Reset quantity input
		setQuantities({ ...quantities, [item.id]: 0 })
	}

	// Handle removing item from cart
	const removeFromCart = (id: number) => {
		setCartItems(cartItems.filter((item) => item.id !== id))
	}

	// Handle quantity change
	const handleQuantityChange = (id: number, value: number) => {
		setQuantities({ ...quantities, [id]: value })
	}

	// Handle adding kit to cart
	const addKitToCart = (kit: any) => {
		const kitItems = kit.items
			.map((item: any) => {
				const materialItem = sampleMaterials.find(
					(m) => m.itemCode === item.itemCode
				)
				if (!materialItem) return null

				return {
					...materialItem,
					quantity: item.quantity,
				}
			})
			.filter(Boolean)

		setCartItems([...cartItems, ...kitItems])
	}

	// Calculate total items in cart
	const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

	// Add the API URL constant and handleCheckout function
	const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

	const handleCheckout = async () => {
		if (cartItems.length === 0 || !workOrderNumber) {
			setError("Please add items to cart and enter a work order number")
			return
		}

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

			// Format data for the API
			const checkoutData = {
				workOrderNumber,
				items: cartItems.map((item) => ({
					itemCode: item.itemCode || item.name, // Adapt to your API expectations
					quantity: item.quantity,
				})),
			}

			const response = await fetch(`${API_URL}/inventory/checkout`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(checkoutData),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.message || "Checkout failed")
			}

			if (data.success) {
				setSuccess("Materials checked out successfully!")
				// Clear cart
				setCartItems([])
				setWorkOrderNumber("")
			} else {
				throw new Error(data.message || "Checkout failed")
			}
		} catch (err: any) {
			console.error("Error during checkout:", err)
			setError(err.message || "Checkout failed")
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
									Material Checkout
								</h1>
								<p className="text-muted-foreground">
									Request materials for production
								</p>
							</div>

							<div className="px-4 lg:px-6">
								{/* Work Order Input */}
								<div className="mb-6">
									<Card>
										<CardHeader>
											<CardTitle>Work Order Information</CardTitle>
											<CardDescription>
												Enter your work order details
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="grid gap-4 sm:grid-cols-2">
												<div className="space-y-2">
													<label
														htmlFor="work-order"
														className="text-sm font-medium"
													>
														Work Order Number
													</label>
													<Input
														id="work-order"
														placeholder="Enter work order number"
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
											<p className="font-semibold">Success</p>
										</div>
										<p className="text-green-500 mt-1">{success}</p>
									</div>
								)}

								<div className="grid gap-6 md:grid-cols-12">
									{/* Main Search and Results */}
									<div className="md:col-span-7 space-y-6">
										<Card>
											<CardHeader>
												<CardTitle>Material Search</CardTitle>
												<CardDescription>
													Search for materials by item code or description
												</CardDescription>
											</CardHeader>
											<CardContent className="space-y-4">
												{/* Search Bar */}
												<div className="relative">
													<IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
													<Input
														type="search"
														placeholder="Search by item code or description..."
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
														All
													</Button>
													<Button
														variant={
															selectedCategory === "Wires"
																? "default"
																: "outline"
														}
														size="sm"
														onClick={() => setSelectedCategory("Wires")}
													>
														Wires
													</Button>
													<Button
														variant={
															selectedCategory === "Terminals"
																? "default"
																: "outline"
														}
														size="sm"
														onClick={() => setSelectedCategory("Terminals")}
													>
														Terminals
													</Button>
													<Button
														variant={
															selectedCategory === "Accessories"
																? "default"
																: "outline"
														}
														size="sm"
														onClick={() => setSelectedCategory("Accessories")}
													>
														Accessories
													</Button>
												</div>

												{/* Results Table */}
												<div className="rounded-md border">
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Item Code</TableHead>
																<TableHead>Description</TableHead>
																<TableHead className="text-right">
																	Available
																</TableHead>
																<TableHead className="w-[140px]">
																	Quantity
																</TableHead>
																<TableHead className="w-[80px]"></TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{searchResults.length > 0 ? (
																searchResults.map((item) => (
																	<TableRow key={item.id}>
																		<TableCell className="font-medium">
																			{item.itemCode}
																		</TableCell>
																		<TableCell>{item.description}</TableCell>
																		<TableCell className="text-right">
																			<span
																				className={`${
																					item.available <= item.minLevel
																						? "text-red-500"
																						: ""
																				}`}
																			>
																				{item.available} {item.unit}
																			</span>
																		</TableCell>
																		<TableCell>
																			<Input
																				type="number"
																				min="0"
																				max={item.available}
																				value={quantities[item.id] || ""}
																				onChange={(e) =>
																					handleQuantityChange(
																						item.id,
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
																					!quantities[item.id] ||
																					quantities[item.id] <= 0 ||
																					quantities[item.id] > item.available
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
																		No results found.
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
													<CardTitle>Material Cart</CardTitle>
													<CardDescription>
														Items ready for checkout
													</CardDescription>
												</div>
												<Badge variant="outline">{totalItems} items</Badge>
											</CardHeader>
											<CardContent>
												<div className="rounded-md border">
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead>Item Code</TableHead>
																<TableHead>Description</TableHead>
																<TableHead className="text-right">
																	Quantity
																</TableHead>
																<TableHead className="w-[60px]"></TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{cartItems.length > 0 ? (
																cartItems.map((item) => (
																	<TableRow
																		key={`cart-${item.id}-${Math.random()}`}
																	>
																		<TableCell className="font-medium">
																			{item.itemCode}
																		</TableCell>
																		<TableCell>{item.description}</TableCell>
																		<TableCell className="text-right">
																			{item.quantity} {item.unit}
																		</TableCell>
																		<TableCell>
																			<Button
																				variant="ghost"
																				size="sm"
																				onClick={() => removeFromCart(item.id)}
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
																		No items added to cart.
																	</TableCell>
																</TableRow>
															)}
														</TableBody>
													</Table>
												</div>
											</CardContent>
											<CardFooter className="flex justify-between">
												<Button
													variant="outline"
													disabled={cartItems.length === 0}
													onClick={() => setCartItems([])}
												>
													Clear All
												</Button>
												<Button
													disabled={cartItems.length === 0 || !workOrderNumber}
													onClick={handleCheckout}
												>
													{isSubmitting
														? "Processing..."
														: "Checkout Materials"}
												</Button>
											</CardFooter>
										</Card>
									</div>

									{/* Sidebar with Saved Items, History */}
									<div className="md:col-span-5 space-y-6">
										<Tabs defaultValue="kits">
											<TabsList className="grid w-full grid-cols-3">
												<TabsTrigger value="kits">Material Kits</TabsTrigger>
												<TabsTrigger value="recent">Recent Items</TabsTrigger>
												<TabsTrigger value="favorites">Favorites</TabsTrigger>
											</TabsList>

											{/* Material Kits */}
											<TabsContent value="kits">
												<Card>
													<CardHeader>
														<CardTitle>Predefined Material Kits</CardTitle>
														<CardDescription>
															Common material combinations
														</CardDescription>
													</CardHeader>
													<CardContent className="space-y-4">
														{materialKits.map((kit) => (
															<div
																key={kit.id}
																className="rounded-lg border p-3"
															>
																<div className="flex justify-between items-start mb-2">
																	<div>
																		<h4 className="font-medium">{kit.name}</h4>
																		<p className="text-sm text-muted-foreground">
																			{kit.description}
																		</p>
																	</div>
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() => addKitToCart(kit)}
																	>
																		Add All
																	</Button>
																</div>
																<div className="text-sm space-y-1">
																	{kit.items.map((item, idx) => (
																		<div
																			key={idx}
																			className="flex justify-between"
																		>
																			<span>{item.itemCode}</span>
																			<span>
																				{item.quantity} {item.unit}
																			</span>
																		</div>
																	))}
																</div>
															</div>
														))}
													</CardContent>
												</Card>
											</TabsContent>

											{/* Recent Items */}
											<TabsContent value="recent">
												<Card>
													<CardHeader>
														<CardTitle>Recently Used Items</CardTitle>
														<CardDescription>
															Items you've recently checked out
														</CardDescription>
													</CardHeader>
													<CardContent>
														<div className="space-y-3">
															{recentItems.map((item) => (
																<div
																	key={item.id}
																	className="flex items-center justify-between rounded-lg border p-3"
																>
																	<div>
																		<div className="font-medium">
																			{item.itemCode}
																		</div>
																		<div className="text-sm text-muted-foreground">
																			{item.description}
																		</div>
																		<div className="text-xs text-muted-foreground">
																			{item.timestamp}
																		</div>
																	</div>
																	<Button variant="ghost" size="sm">
																		<IconPlus className="h-4 w-4" />
																	</Button>
																</div>
															))}
														</div>
													</CardContent>
												</Card>
											</TabsContent>

											{/* Favorites */}
											<TabsContent value="favorites">
												<Card>
													<CardHeader>
														<CardTitle>Favorite Items</CardTitle>
														<CardDescription>
															Your bookmarked materials
														</CardDescription>
													</CardHeader>
													<CardContent>
														<div className="space-y-3">
															{favoriteItems.map((item) => (
																<div
																	key={item.id}
																	className="flex items-center justify-between rounded-lg border p-3"
																>
																	<div>
																		<div className="font-medium">
																			{item.itemCode}
																		</div>
																		<div className="text-sm text-muted-foreground">
																			{item.description}
																		</div>
																	</div>
																	<Button variant="ghost" size="sm">
																		<IconPlus className="h-4 w-4" />
																	</Button>
																</div>
															))}
														</div>
													</CardContent>
												</Card>
											</TabsContent>
										</Tabs>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
