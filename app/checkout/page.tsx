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
import { CheckoutSkeleton } from "@/components/checkout-skeleton"
import { getAuthToken } from "@/lib/auth-token"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconBox } from "@tabler/icons-react"
import { Bom, BomItem, Transaction } from "@/types"

// API endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Define inventory item interface
interface InventoryItem {
	_id: string
	partNumber: string
	partName: string
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
	const [selectedVendor, setSelectedVendor] = useState("All")
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
	const [vendors, setVendors] = useState<string[]>([])
	const [checkoutDate, setCheckoutDate] = useState<Date | undefined>(new Date())

	// LEOCO State
	const [leocoKingPart, setLeocoKingPart] = useState("")
	const [leocoWorkOrder, setLeocoWorkOrder] = useState("")
	const [leocoQty, setLeocoQty] = useState(1)
	const [leocoNotes, setLeocoNotes] = useState("")
	const [boms, setBoms] = useState<Bom[]>([])
	const [leocoWos, setLeocoWos] = useState<string[]>([])
	const [activities, setActivities] = useState<Transaction[]>([])
	const [historySearchQuery, setHistorySearchQuery] = useState("")
	const [historyDateFilter, setHistoryDateFilter] = useState("")

	// Fetch inventory data from API
	const fetchInventory = async () => {
		try {
			setIsLoading(true)
			setError("")

			const token = await getAuthToken()
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
						unit: determineUnit((i.partName as string) || ""),
						minLevel: Math.round((i.quantity as number) * 0.1),
					} as InventoryItem
				})
				setInventoryItems(items)
				setSearchResults(items)

				// Extract unique types for category filtering
				const uniqueTypes = Array.from(
					new Set(
						items.map((item: InventoryItem) => determineType(item.partName))
					)
				) as string[]
				setCategories(uniqueTypes)

				// Extract unique vendors
				const uniqueVendors = Array.from(
					new Set(
						items.map((item: InventoryItem) => (item.supplier || "Lainnya").toUpperCase())
					)
				) as string[]
				setVendors(uniqueVendors)

				// We don't set leocoWos here anymore, we will derive it dynamically when a King Part is selected.
			}

			// Also fetch BOMs for LEOCO Tab
			const bomRes = await fetch(`${API_URL}/api/bom`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			const bomData = await bomRes.json()
			if (bomData.success) {
				setBoms(bomData.data)
			}

			// Fetch Activities Checkout
			const actRes = await fetch(`${API_URL}/api/checkout/history?limit=10`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			const actData = await actRes.json()
			if (actData.success) {
				setActivities(actData.data)
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
	const determineUnit = (partName: string) => {
		const lowerName = partName.toLowerCase()
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
	const determineType = (partName: string) => {
		const lowerName = partName.toLowerCase()
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
					item.partNumber.toLowerCase().includes(query) ||
					item.partName.toLowerCase().includes(query)
			)
		}

		if (selectedCategory !== "All") {
			results = results.filter(
				(item) => determineType(item.partName) === selectedCategory
			)
		}

		if (selectedVendor !== "All") {
			results = results.filter(
				(item) => (item.supplier || "Lainnya").toUpperCase() === selectedVendor
			)
		}

		setSearchResults(results)
	}, [searchQuery, selectedCategory, selectedVendor, inventoryItems])

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
			const token = await getAuthToken()
			if (!token) {
				setError("Otentikasi diperlukan")
				toast.error("Otentikasi diperlukan")
				setIsSubmitting(false)
				return
			}
			const checkoutData = {
				workOrder: workOrderNumber,
				items: cartItems.map((item) => ({
					name: item.partName,
					quantity: item.quantity,
					unit: item.unit || "Pcs",
				})),
				checkoutDate: checkoutDate
					? checkoutDate.toISOString()
					: new Date().toISOString(),
			}
			const response = await fetch(`${API_URL}/api/checkout`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(checkoutData),
			})
			if (response.status === 429) {
				throw new Error(
					"Terlalu banyak permintaan. Silakan coba lagi dalam beberapa saat."
				)
			}
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
				setCartItems([])
				setWorkOrderNumber("")
				setCheckoutDate(new Date())
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

	// Fetch Available WOs from the scalable backend API when King Part is selected
	useEffect(() => {
		const fetchWos = async () => {
			if (leocoKingPart) {
				try {
					const token = await getAuthToken()
					const res = await fetch(`${API_URL}/api/inventory/available-wos?kingPartNumber=${leocoKingPart}`, {
						headers: { Authorization: `Bearer ${token}` }
					})
					const data = await res.json()
					if (data.success) {
						setLeocoWos(data.data)
						if (leocoWorkOrder && !data.data.includes(leocoWorkOrder)) {
							setLeocoWorkOrder("")
						}
					}
				} catch (err) {
					console.error("Failed to fetch WOs", err)
				}
			} else {
				setLeocoWos([])
				setLeocoWorkOrder("")
			}
		}

		fetchWos()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [leocoKingPart])

	const handleLeocoCheckout = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!leocoKingPart || !leocoWorkOrder || leocoQty <= 0) {
			toast.error("Lengkapi King Part, Work Order, dan Kuantitas", { style: { background: "red" } })
			return
		}
		
		setIsSubmitting(true)
		try {
			const token = await getAuthToken()
			const res = await fetch(`${API_URL}/api/checkout/leoco-production`, {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({ kingPartNumber: leocoKingPart, workOrder: leocoWorkOrder, quantityToProduce: leocoQty, notes: leocoNotes })
			})
			
			const data = await res.json()
			if (!res.ok) throw new Error(data.message || "Gagal memproses produksi LEOCO")
			
			toast.success(data.message, { style: { background: "green" } })
			setLeocoKingPart("")
			setLeocoWorkOrder("")
			setLeocoQty(1)
			setLeocoNotes("")
			fetchInventory()
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan"
			toast.error(errorMessage, { style: { background: "red" } })
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
								{isLoading ? (
									<CheckoutSkeleton />
								) : (
									<Tabs defaultValue="reguler" className="w-full">
										<TabsList className="mb-4">
											<TabsTrigger value="reguler">Checkout Reguler</TabsTrigger>
											<TabsTrigger value="leoco">Produksi LEOCO (FIFO)</TabsTrigger>
										</TabsList>
										
										<TabsContent value="reguler">
											<>
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
													<div className="flex flex-col sm:flex-row gap-4">
														<div className="flex-1 max-w-full sm:max-w-md space-y-2">
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
																onChange={(e) =>
																	setWorkOrderNumber(e.target.value)
																}
															/>
														</div>
														<div className="w-full sm:w-auto space-y-2 flex flex-col">
															<label className="text-sm font-medium mb-1">
																Tanggal Checkout
															</label>
															<Popover>
																<PopoverTrigger asChild>
																	<Button
																		variant="outline"
																		className="w-full sm:w-[180px] justify-start text-left font-normal"
																	>
																		<CalendarIcon className="mr-2 h-4 w-4" />
																		{checkoutDate
																			? format(checkoutDate, "PPP", {
																					locale: id,
																			  })
																			: "Pilih tanggal"}
																	</Button>
																</PopoverTrigger>
																<PopoverContent
																	className="w-auto p-0"
																	align="start"
																>
																	<CalendarComponent
																		mode="single"
																		selected={checkoutDate}
																		onSelect={setCheckoutDate}
																	/>
																</PopoverContent>
															</Popover>
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
													{/* Search Bar & Vendor Filter */}
													<div className="flex flex-col sm:flex-row gap-4">
														<div className="relative flex-1">
															<IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
															<Input
																type="search"
																placeholder="Cari berdasarkan kode atau deskripsi..."
																className="pl-9"
																value={searchQuery}
																onChange={(e) => setSearchQuery(e.target.value)}
															/>
														</div>
														<Select value={selectedVendor} onValueChange={setSelectedVendor}>
															<SelectTrigger className="w-full sm:w-[180px]">
																<SelectValue placeholder="Pilih Vendor" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="All">Semua Vendor</SelectItem>
																{vendors.map((vendor) => (
																	<SelectItem key={vendor} value={vendor}>
																		{vendor}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>

													{/* Category Filters */}
													<div className="flex items-center gap-2 overflow-auto pb-2">
														<span className="text-sm font-medium">Filter:</span>
														<Button
															variant={
																selectedCategory === "All"
																	? "default"
																	: "outline"
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
																				{item.partNumber}
																			</TableCell>
																			<TableCell>{item.partName}</TableCell>
																			<TableCell className="text-right">
																				<span
																					className={`${
																						item.quantity <=
																						(item.minLevel || 0)
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
																				{item.partNumber}
																			</TableCell>
																			<TableCell>{item.partName}</TableCell>
																			<TableCell className="text-right">
																				{item.quantity} {item.unit || "Pcs"}
																			</TableCell>
																			<TableCell>
																				<Button
																					variant="ghost"
																					size="sm"
																					onClick={() =>
																						removeFromCart(item._id)
																					}
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
									</>
								</TabsContent>

								{/* TAB LEOCO (FIFO B.O.M) */}
								<TabsContent value="leoco">
									<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
										<div className="lg:col-span-1">
											<Card>
												<CardHeader>
													<CardTitle className="text-lg flex items-center gap-2">
														<IconBox className="h-5 w-5 text-primary" />
														Produksi LEOCO
													</CardTitle>
													<CardDescription>
														Sistem akan memotong stok bahan berdasarkan B.O.M pada Work Order yang Anda pilih. (Opsi WO yang muncul adalah stok yang tersedia).
													</CardDescription>
												</CardHeader>
												<CardContent>
													<form onSubmit={handleLeocoCheckout} className="space-y-6">
														<div className="space-y-2">
															<label className="text-sm font-medium">Target Part Number</label>
															<Select value={leocoKingPart} onValueChange={setLeocoKingPart} required>
																<SelectTrigger>
																	<SelectValue placeholder="Pilih Target Produksi" />
																</SelectTrigger>
																<SelectContent>
																	{boms.length === 0 ? (
																		<div className="px-2 py-4 text-sm text-center text-muted-foreground">Tidak ada B.O.M</div>
																	) : (
																		boms.map((bom: Bom) => (
																			<SelectItem key={bom._id || bom.id || bom.kingPartNumber} value={bom.kingPartNumber}>
																				{bom.kingPartNumber}
																			</SelectItem>
																		))
																	)}
																</SelectContent>
															</Select>
														</div>
														<div className="space-y-2">
															<label className="text-sm font-medium">Work Order (WO) Sumber Material</label>
															<Select value={leocoWorkOrder} onValueChange={setLeocoWorkOrder} required>
																<SelectTrigger>
																	<SelectValue placeholder="Pilih Work Order" />
																</SelectTrigger>
																<SelectContent>
																	{leocoWos.length === 0 ? (
																		<div className="px-2 py-4 text-sm text-center text-muted-foreground">Tidak ada WO Tersedia</div>
																	) : (
																		leocoWos.map((wo) => (
																			<SelectItem key={wo} value={wo}>
																				WO: {wo}
																			</SelectItem>
																		))
																	)}
																</SelectContent>
															</Select>
														</div>
														<div className="space-y-2">
															<label className="text-sm font-medium">Target Qty Produksi (Pcs)</label>
															<Input 
																type="number"
																min="1"
																value={leocoQty}
																onChange={e => setLeocoQty(parseInt(e.target.value) || 1)}
																required
															/>
														</div>
														<div className="space-y-2">
															<label className="text-sm font-medium">Catatan (Opsional)</label>
															<Input 
																placeholder="Catatan..."
																value={leocoNotes}
																onChange={e => setLeocoNotes(e.target.value)}
															/>
														</div>
														
														<div className="pt-4 mt-4 border-t flex justify-end">
															<Button type="submit" size="lg" disabled={isSubmitting || !leocoKingPart || !leocoWorkOrder} className="w-full sm:w-auto px-8">
																{isSubmitting ? (
																	<>
																		<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
																		Memproses...
																	</>
																) : (
																	"Proses Checkout"
																)}
															</Button>
														</div>
													</form>
												</CardContent>
											</Card>
										</div>

										{/* PREVIEW BREAKDOWN KELUAR */}
										<div className="lg:col-span-2">
											<Card className="border-border/60 shadow-sm h-full flex flex-col">
												<CardHeader className="bg-muted/30 pb-4 border-b">
													<CardTitle className="text-lg">Preview Material Keluar</CardTitle>
													<CardDescription>
														Material yang akan dipotong dari stok (Work Order: {leocoWorkOrder || "Belum dipilih"})
													</CardDescription>
												</CardHeader>
												<CardContent className="p-0 flex-1 flex flex-col min-h-[300px]">
													{leocoKingPart ? (
														(() => {
															const selectedBom = boms.find(b => b.kingPartNumber === leocoKingPart)
															if (!selectedBom) return <div className="p-6 text-center text-muted-foreground text-sm flex-1 flex items-center justify-center">B.O.M tidak ditemukan.</div>

															return (
																<div className="overflow-x-auto">
																	<table className="w-full text-sm text-left">
																		<thead className="bg-muted/50 border-b">
																			<tr>
																				<th className="px-4 py-3 font-medium text-muted-foreground">Material</th>
																				<th className="px-4 py-3 font-medium text-muted-foreground text-right">Per Pcs</th>
																				<th className="px-4 py-3 font-medium text-primary text-right">Total Potong ({leocoQty})</th>
																			</tr>
																		</thead>
																		<tbody className="divide-y">
																			{selectedBom.items.map((item: BomItem) => (
																				<tr key={item.id || item.childPartNumber} className="hover:bg-muted/30 transition-colors">
																					<td className="px-4 py-3">
																						<p className="font-medium text-xs truncate max-w-[120px]">{item.childPartNumber}</p>
																						<p className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={item.childPartName}>{item.childPartName}</p>
																					</td>
																					<td className="px-4 py-3 text-right tabular-nums text-muted-foreground text-xs">
																						{item.quantityRequired} {item.unit === 'Meter' ? 'm' : 'pcs'}
																					</td>
																					<td className="px-4 py-3 text-right tabular-nums font-semibold text-primary text-xs">
																						{Number((item.quantityRequired * leocoQty).toFixed(3))} {item.unit === 'Meter' ? 'm' : 'pcs'}
																					</td>
																				</tr>
																			))}
																		</tbody>
																	</table>
																</div>
															)
														})()
													) : (
														<div className="p-8 flex flex-col items-center justify-center text-center h-full flex-1">
															<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
																<IconBox className="h-8 w-8 text-muted-foreground/50" />
															</div>
															<p className="text-muted-foreground font-medium">Pilih Target Produksi & WO</p>
															<p className="text-xs text-muted-foreground/70 max-w-[200px] mt-1">
																Pilih Target Produksi untuk melihat estimasi material yang akan terpotong dari inventaris.
															</p>
														</div>
													)}
												</CardContent>
											</Card>
										</div>
									</div>
								</TabsContent>
							</Tabs>
						)}
						
						{/* History Section Checkout */}
						<div className="mb-8 mt-4">
							<Card>
								<CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
									<div>
										<CardTitle className="text-lg">Riwayat Barang Keluar Terbaru</CardTitle>
										<CardDescription>Daftar transaksi pengeluaran/produksi</CardDescription>
									</div>
									<div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
										<Input 
											placeholder="Cari WO, Target Produksi, dll..." 
											value={historySearchQuery}
											onChange={(e) => setHistorySearchQuery(e.target.value)}
											className="w-full sm:w-[200px]"
										/>
										<Input 
											type="date"
											value={historyDateFilter}
											onChange={(e) => setHistoryDateFilter(e.target.value)}
											className="w-full sm:w-[150px]"
										/>
									</div>
								</CardHeader>
								<CardContent>
									<div className="overflow-x-auto">
										<table className="w-full text-sm text-left">
											<thead className="bg-muted/50 border-b">
												<tr>
													<th className="px-4 py-3 font-medium text-muted-foreground">Work Order</th>
													<th className="px-4 py-3 font-medium text-muted-foreground">Target Produksi / Target</th>
													<th className="px-4 py-3 font-medium text-muted-foreground">Total Komponen</th>
													<th className="px-4 py-3 font-medium text-muted-foreground">Oleh</th>
													<th className="px-4 py-3 font-medium text-muted-foreground">Waktu</th>
												</tr>
											</thead>
											<tbody className="divide-y">
												{(() => {
													const filteredActivities = activities.filter(act => {
														const searchStr = historySearchQuery.toLowerCase()
														const matchSearch = !searchStr || 
															(act.workOrder && act.workOrder.toLowerCase().includes(searchStr)) ||
															(act.kingPartNumber && act.kingPartNumber.toLowerCase().includes(searchStr)) ||
															(act.project && act.project.toLowerCase().includes(searchStr)) ||
															(act.notes && act.notes.toLowerCase().includes(searchStr)) ||
															(act.operator?.username && act.operator.username.toLowerCase().includes(searchStr)) ||
															(act.createdBy?.name && act.createdBy.name.toLowerCase().includes(searchStr))
														
														const matchDate = !historyDateFilter || new Date(act.checkoutDate || act.createdAt).toISOString().split('T')[0] === historyDateFilter
														
														return matchSearch && matchDate
													})

													if (filteredActivities.length === 0) {
														return <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Tidak ada data transaksi yang sesuai</td></tr>
													}

													return filteredActivities.map((act) => (
														<tr key={act._id || act.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => window.location.href = `/checkout/${act._id || act.id}`}>
															<td className="px-4 py-3 font-medium text-primary">{act.workOrder}</td>
															<td className="px-4 py-3 text-sm">
																{act.kingPartNumber ? (
																	<div>
																		<span className="font-semibold">{act.kingPartNumber}</span>
																		<span className="text-xs text-muted-foreground ml-1">({act.quantity} pcs)</span>
																	</div>
																) : (
																	<span className="text-xs">{act.project || act.notes || "Reguler"}</span>
																)}
															</td>
															<td className="px-4 py-3 font-medium">{act.items?.length || 0} Jenis Barang</td>
															<td className="px-4 py-3">{act.operator?.username || act.createdBy?.name || "System"}</td>
															<td className="px-4 py-3 whitespace-nowrap text-xs">{new Date(act.checkoutDate || act.createdAt).toLocaleString('id-ID')}</td>
														</tr>
													))
												})()}
											</tbody>
										</table>
									</div>
								</CardContent>
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
