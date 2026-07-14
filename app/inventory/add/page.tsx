"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAuthToken } from "@/lib/auth-token"
import {
	IconArrowLeft,
	IconRefresh,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { MasterItem, Bom, BomItem } from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function AddInventoryItemPage() {
	const router = useRouter()
	const [formData, setFormData] = useState({
		partNumber: "",
		partName: "",
		quantity: "",
		unit: "Pcs",
		supplier: "",
		location: "",
		workOrder: "",
	})
	
	const [masterItems, setMasterItems] = useState<MasterItem[]>([])
	const [isLoadingMaster, setIsLoadingMaster] = useState(false)
	
	// Khusus LEOCO
	const [boms, setBoms] = useState<Bom[]>([])
	const [selectedKingPart, setSelectedKingPart] = useState<string>("")

	const [isSubmitting, setIsSubmitting] = useState(false)

	const VENDORS = ["LEOCO", "BSG", "YMK"]
	const LOCATIONS = ["Gudang Utama", "Gudang Karantina", "Gudang B"]

	useEffect(() => {
		const fetchBoms = async () => {
			try {
				const token = await getAuthToken()
				const response = await fetch(`${API_URL}/api/bom`, {
					headers: { Authorization: `Bearer ${token}` }
				})
				const data = await response.json()
				if (data.success) {
					setBoms(data.data)
				}
			} catch (err) {
				console.error("Failed to fetch BOMs", err)
			}
		}
		fetchBoms()
	}, [])

	useEffect(() => {
		const fetchMasterItems = async () => {
			if (!formData.supplier || formData.supplier === "LEOCO") {
				// Jika LEOCO, master items diambil secara dinamis dari King Part yang dipilih,
				// tidak di-fetch dari /api/item-master.
				if (formData.supplier !== "LEOCO") setMasterItems([])
				return
			}
			
			setIsLoadingMaster(true)
			try {
				const token = await getAuthToken()
				const response = await fetch(`${API_URL}/api/item-master?supplier=${formData.supplier}`, {
					headers: { Authorization: `Bearer ${token}` }
				})
				const data = await response.json()
				if (data.success) {
					setMasterItems(data.data)
				}
			} catch (err) {
				console.error("Failed to fetch master items", err)
			} finally {
				setIsLoadingMaster(false)
			}
		}

		fetchMasterItems()
	}, [formData.supplier])

	// Efek untuk mengisi masterItems LEOCO berdasarkan King Part yang dipilih
	useEffect(() => {
		if (formData.supplier === "LEOCO" && selectedKingPart) {
			const bom = boms.find(b => b.kingPartNumber === selectedKingPart)
			if (bom && bom.items) {
				// Format anak material BOM menjadi struktur yang sama dengan masterItems
				const leocoItems = bom.items.map((item: BomItem) => ({
					id: item.id,
					partNumber: item.childPartNumber,
					partName: item.childPartName,
					unit: item.unit
				}))
				setMasterItems(leocoItems)
			} else {
				setMasterItems([])
			}
		}
	}, [selectedKingPart, formData.supplier, boms])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleSupplierChange = (value: string) => {
		setFormData((prev) => ({
			...prev,
			supplier: value,
			partNumber: "",
			partName: "",
			unit: "Pcs",
			workOrder: value === "LEOCO" ? prev.workOrder : "GENERAL"
		}))
		setSelectedKingPart("")
		if (value === "LEOCO") {
			setMasterItems([]) // Akan diisi saat King Part dipilih
		}
	}

	const handlePartSelection = (id: string) => {
		// id di sini adalah nilai unique dari database (item.id) untuk mencegah duplikasi key/value
		const selectedItem = masterItems.find(item => item.id === id)
		if (selectedItem) {
			setFormData((prev) => ({
				...prev,
				partNumber: selectedItem.partNumber,
				partName: selectedItem.partName,
				unit: selectedItem.unit || "Pcs"
			}))
		}
	}

	const handleLocationChange = (value: string) => {
		setFormData((prev) => ({ ...prev, location: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!formData.supplier || !formData.partNumber || !formData.location || !formData.quantity) {
			toast.error("Mohon lengkapi semua field yang wajib diisi")
			return
		}
		
		setIsSubmitting(true)

		try {
			const token = await getAuthToken()
			if (!token) {
				toast.error("Authentication required")
				setIsSubmitting(false)
				return
			}

			const payload = {
				...formData,
				quantity: parseFloat(formData.quantity),
				workOrder: formData.workOrder || "GENERAL"
			}

			const response = await fetch(`${API_URL}/api/inventory`, {
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
				toast.success("Barang berhasil ditambahkan ke inventaris!", {
					description: `${payload.quantity} ${payload.unit} - ${payload.partName}`
				})
				// Clear form sebagian
				setFormData(prev => ({
					...prev,
					partNumber: "",
					partName: "",
					quantity: "",
					workOrder: prev.supplier === "LEOCO" ? prev.workOrder : ""
				}))
			} else {
				throw new Error(data.message || "Failed to add item")
			}
		} catch (err: unknown) {
			console.error("Add item error:", err)
			toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
		} finally {
			setIsSubmitting(false)
		}
	}

	// Cari ID dari item yang saat ini terpilih (agar Select ter-bind dengan value yang benar)
	const selectedItemId = masterItems.find(item => 
		item.partNumber === formData.partNumber && item.partName === formData.partName
	)?.id || ""

	return (
		<SidebarProvider
			style={{
				"--sidebar-width": "calc(var(--spacing) * 72)",
				"--header-height": "calc(var(--spacing) * 12)",
			} as React.CSSProperties}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				
				<div className="flex flex-1 flex-col">
					{/* Header Section - Full Width Clean */}
					<div className="bg-background border-b px-6 py-6 md:px-8 lg:px-10">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<div>
								<h1 className="text-3xl font-bold tracking-tight text-foreground">
									Penerimaan Material Reguler
								</h1>
								<p className="text-muted-foreground mt-1">
									Input data masuknya material mentah dari vendor langsung ke sistem.
								</p>
							</div>
							<Button
								variant="outline"
								onClick={() => router.push("/inventory")}
								className="shrink-0"
							>
								<IconArrowLeft className="mr-2 h-4 w-4" />
								Kembali
							</Button>
						</div>
					</div>

					{/* Form Section - Clean SaaS/ERP Layout */}
					<div className="flex-1 p-6 md:p-8 lg:px-10">
						<form onSubmit={handleSubmit} className="max-w-6xl">
							
							{/* Blok 1: Informasi Dasar & Supplier */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b">
								<div className="col-span-1">
									<h2 className="text-lg font-medium text-foreground">Informasi Vendor</h2>
									<p className="text-sm text-muted-foreground mt-1">
										Tentukan sumber material masuk. Untuk material produksi internal (LEOCO), wajib mencantumkan Work Order.
									</p>
								</div>
								
								<div className="col-span-1 md:col-span-2 max-w-2xl space-y-6">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label htmlFor="supplier" className="text-sm font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
												Vendor / Supplier
											</Label>
											<Select 
												value={formData.supplier} 
												onValueChange={handleSupplierChange}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Pilih Vendor" />
												</SelectTrigger>
												<SelectContent>
													{VENDORS.map(vendor => (
														<SelectItem key={vendor} value={vendor}>
															{vendor}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										
										<div className="space-y-2">
											<Label htmlFor="workOrder" className="text-sm font-medium">
												No Work Order (Opsional)
											</Label>
											<Input
												id="workOrder"
												name="workOrder"
												value={formData.workOrder}
												onChange={handleChange}
												placeholder={formData.supplier === "LEOCO" ? "Masukkan No WO LEOCO" : "Contoh: GENERAL"}
												className={formData.supplier === "LEOCO" ? "border-primary focus-visible:ring-primary shadow-sm" : ""}
											/>
											{formData.supplier === "LEOCO" && (
												<p className="text-xs text-primary mt-1">WO wajib untuk slot produksi.</p>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Blok 2: Detail Material (Dinamis) */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b">
								<div className="col-span-1">
									<h2 className="text-lg font-medium text-foreground">Identitas Material</h2>
									<p className="text-sm text-muted-foreground mt-1">
										{formData.supplier === "LEOCO" 
											? "Pilih Target Part Number untuk memuat komponen B.O.M secara otomatis." 
											: "Pilih Part Number, deskripsi material akan terisi secara otomatis dari database Master Barang."}
									</p>
								</div>

								<div className="col-span-1 md:col-span-2 max-w-2xl space-y-6">
									{/* Khusus LEOCO: Pilih Target Produksi Dulu */}
									{formData.supplier === "LEOCO" && (
										<div className="space-y-2">
											<Label className="text-sm font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
												Target Part Number (BOM Reference)
											</Label>
											<Select 
												value={selectedKingPart} 
												onValueChange={setSelectedKingPart}
											>
												<SelectTrigger className="w-full border-primary">
													<SelectValue placeholder="Pilih Target Produksi untuk memuat material" />
												</SelectTrigger>
												<SelectContent>
													{boms.map(bom => (
														<SelectItem key={bom.id} value={bom.kingPartNumber}>
															{bom.kingPartNumber}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}

									<div className="grid grid-cols-1 gap-6">
										<div className="space-y-2">
											<Label className="text-sm font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
												{formData.supplier === "LEOCO" ? "Anak Material LEOCO" : "Item Code / Part Number"}
											</Label>
											<div className="flex gap-2">
												<Select 
													value={selectedItemId} 
													onValueChange={handlePartSelection}
													disabled={
														!formData.supplier || 
														isLoadingMaster || 
														(formData.supplier === "LEOCO" && !selectedKingPart)
													}
												>
													<SelectTrigger className="flex-1">
														<SelectValue placeholder={
															!formData.supplier 
																? "Pilih vendor dahulu" 
																: formData.supplier === "LEOCO" && !selectedKingPart
																	? "Pilih Target Produksi dahulu"
																	: isLoadingMaster 
																		? "Memuat data..." 
																		: "Pilih Part Number"
														} />
													</SelectTrigger>
													<SelectContent>
														{masterItems.length > 0 ? (
															masterItems.map(item => (
																<SelectItem key={item.id} value={item.id}>
																	{item.partNumber}
																	{formData.supplier !== "LEOCO" && ` — ${item.partName}`}
																</SelectItem>
															))
														) : (
															<div className="p-2 text-sm text-center text-muted-foreground">
																Tidak ada data material
															</div>
														)}
													</SelectContent>
												</Select>
												{isLoadingMaster && (
													<div className="flex items-center justify-center p-2 text-muted-foreground">
														<IconRefresh className="h-5 w-5 animate-spin" />
													</div>
												)}
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="partName" className="text-sm font-medium">
												Deskripsi / Item Name
											</Label>
											<Input
												id="partName"
												name="partName"
												value={formData.partName}
												placeholder="Terisi otomatis..."
												readOnly
												className="bg-muted/30 text-muted-foreground border-transparent focus-visible:ring-0 shadow-none cursor-not-allowed"
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Blok 3: Logistik */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-b">
								<div className="col-span-1">
									<h2 className="text-lg font-medium text-foreground">Alokasi & Logistik</h2>
									<p className="text-sm text-muted-foreground mt-1">
										Tentukan jumlah penerimaan material aktual dan penempatan rak/gudang penyimpanannya.
									</p>
								</div>

								<div className="col-span-1 md:col-span-2 max-w-2xl space-y-6">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label htmlFor="quantity" className="text-sm font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
												Kuantitas Diterima ({formData.unit})
											</Label>
											<Input
												id="quantity"
												name="quantity"
												type="number"
												step="0.01"
												min="0.01"
												required
												value={formData.quantity}
												onChange={handleChange}
												placeholder="Misal: 1500"
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="location" className="text-sm font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
												Lokasi Penyimpanan
											</Label>
											<Select 
												value={formData.location} 
												onValueChange={handleLocationChange}
											>
												<SelectTrigger>
													<SelectValue placeholder="Pilih Rak / Gudang" />
												</SelectTrigger>
												<SelectContent>
													{LOCATIONS.map(loc => (
														<SelectItem key={loc} value={loc}>
															{loc}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
							</div>

							{/* Aksi */}
							<div className="flex items-center gap-4 py-8 justify-end max-w-6xl">
								<Button
									type="button"
									variant="ghost"
									onClick={() => {
										setFormData({
											partNumber: "",
											partName: "",
											quantity: "",
											unit: "Pcs",
											supplier: "",
											location: "",
											workOrder: "",
										})
										setSelectedKingPart("")
									}}
									disabled={isSubmitting}
								>
									Reset Form
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? "Menyimpan Data..." : "Simpan ke Inventaris"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
