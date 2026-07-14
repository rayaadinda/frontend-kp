"use client"

import { useState, useRef, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
	Card,
	CardContent,
	CardDescription,
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
	Plus,
	Trash2,
	Printer,
	Download,
	Eye,
	FileText,
	ShoppingCart,
	ArrowLeft,
} from "lucide-react"
import { format } from "date-fns"
import { PODocument, type POData, type POItem } from "@/components/po-document"
import { getAuthToken } from "@/lib/auth-token"
import { toast } from "sonner"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const PO_PAGE_WIDTH = "215.9mm"
const PO_PAGE_HEIGHT = "330.2mm"

const DEFAULT_SHIP_TO = {
	contactPerson: "Mr. Heri Ibrahim",
	cc: "Sindi AL",
	companyName: "CV. Kurnia Jaya Industri",
	address: "Jl. Gatot Subroto No. 34, RT 03/RW 02\nCikarang Kota - Cikarang Utara, Kab. Bekasi 17530\n(Depan Kantor Pos Pilar)",
	phone: "+62 878 8135 5782",
	handphone: "+62 813 2998 2994",
}



const emptyItem = (): POItem => ({
	no: 1,
	partNumber: "",
	namaBarang: "",
	satuan: "pcs",
	qty: 1,
	hargaSatuan: 0,
	total: 0,
})

interface InventoryPart {
	id: number
	partNumber: string
	partName: string
	supplier: string
	price: number
	quantity: number
}

export default function CreatePOPage() {
	const [items, setItems] = useState<POItem[]>([{ ...emptyItem() }])
	const [showPreview, setShowPreview] = useState(false)
	const [inventoryParts, setInventoryParts] = useState<InventoryPart[]>([])
	const printRef = useRef<HTMLDivElement>(null)

	const [formData, setFormData] = useState({
		noPO: "",
		tanggal: format(new Date(), "dd/MM/yyyy"),
		tanggalKirim: "",
		supplierNama: "",
		supplierAlamat: "",
		supplierFax: "",
		supplierTelp: "",
		supplierKontak: "",
		supplierHandphone: "",
		shipToKontak: DEFAULT_SHIP_TO.contactPerson,
		shipToCc: DEFAULT_SHIP_TO.cc,
		shipToNama: DEFAULT_SHIP_TO.companyName,
		shipToAlamat: DEFAULT_SHIP_TO.address,
		shipToTelp: DEFAULT_SHIP_TO.phone,
		shipToHandphone: DEFAULT_SHIP_TO.handphone,
		requisitioner: "-",
		shipVia: "-",
		fob: "-",
		shippingTerms: "-",
		catatan: "",
		ppn: false,
		dibuatOleh: "",
		jabatan: "Staff Gudang",
	})

	// Generate nomor PO saat pertama kali mount — DIHAPUS (input manual)

	useEffect(() => {
		const fetchInventory = async () => {
			try {
				const token = await getAuthToken()
				if (!token) return
				const res = await fetch(`${API_URL}/api/inventory`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				const data = await res.json()
				if (data.success) {
					setInventoryParts(
						data.data.map((item: { id: number; partNumber?: string; name: string; supplier: string; price?: number; quantity: number }) => ({
							id: item.id,
							partNumber: item.partNumber || "",
							partName: item.name,
							supplier: item.supplier,
							price: item.price || 0,
							quantity: item.quantity,
						}))
					)
				}
			} catch (e) {
				console.error("Failed to fetch inventory:", e)
			}
		}
		fetchInventory()
	}, [])

	const updateItem = (index: number, field: keyof POItem, value: string | number) => {
		setItems((prev) => {
			const updated = [...prev]
			updated[index] = { ...updated[index], [field]: value }
			if (field === "qty" || field === "hargaSatuan") {
				const qty = field === "qty" ? Number(value) : updated[index].qty
				const harga = field === "hargaSatuan" ? Number(value) : updated[index].hargaSatuan
				updated[index].total = qty * harga
			}
			return updated
		})
	}

	const addItem = () => {
		setItems((prev) => [...prev, { ...emptyItem(), no: prev.length + 1 }])
	}

	const removeItem = (index: number) => {
		if (items.length === 1) return
		setItems((prev) => prev.filter((_, i) => i !== index))
	}

	const fillFromInventory = (index: number, part: InventoryPart) => {
		setItems((prev) => {
			const updated = [...prev]
			updated[index] = {
				...updated[index],
				partNumber: part.partNumber,
				namaBarang: part.partName,
				hargaSatuan: part.price,
				total: updated[index].qty * part.price,
			}
			return updated
		})
		if (part.supplier && !formData.supplierNama) {
			setFormData((prev) => ({ ...prev, supplierNama: part.supplier }))
		}
	}

	const buildPOData = (): POData => ({
		noPO: formData.noPO,
		tanggal: formData.tanggal,
		tanggalKirim: formData.tanggalKirim,
		vendor: {
			contactPerson: formData.supplierKontak,
			cc: "",
			companyName: formData.supplierNama,
			address: formData.supplierAlamat,
			phone: formData.supplierTelp,
			fax: formData.supplierFax,
			handphone: formData.supplierHandphone,
		},
		shipTo: {
			contactPerson: formData.shipToKontak,
			cc: "",
			companyName: formData.shipToNama,
			address: formData.shipToAlamat,
			phone: formData.shipToTelp,
			handphone: formData.shipToHandphone,
		},
		requisitioner: formData.requisitioner,
		shipVia: formData.shipVia,
		fob: formData.fob,
		shippingTerms: formData.shippingTerms,
		items,
		catatan: formData.catatan,
		ppn: formData.ppn,
		dibuatOleh: formData.dibuatOleh,
		jabatan: formData.jabatan,
	})

	const openPrintableWindow = () => {
		const printContent = document.getElementById("po-document")
		if (!printContent) {
			toast.error("Dokumen tidak ditemukan. Pastikan preview sudah terbuka.")
			return null
		}

		const printWindow = window.open("", "_blank", "width=1400,height=1200")
		if (!printWindow) {
			toast.error("Popup diblokir browser. Izinkan popup untuk mencetak atau mengunduh PDF.")
			return null
		}

		printWindow.document.write(`
			<!DOCTYPE html>
			<html>
			<head>
				<title>${formData.noPO || "Purchase Order"}</title>
				<meta charset="utf-8" />
				<style>
					* { box-sizing: border-box; margin: 0; padding: 0; }
					html, body { width: 100%; height: 100%; background: #fff; }
					body { display: flex; justify-content: center; align-items: flex-start; padding: 0; }
					#po-document { width: ${PO_PAGE_WIDTH}; min-height: ${PO_PAGE_HEIGHT}; }
					@page { size: legal portrait; margin: 8mm; }
					@media print {
						body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
					}
				</style>
			</head>
			<body>${printContent.outerHTML}</body>
			</html>
		`)
		printWindow.document.close()
		printWindow.focus()
		return printWindow
	}

	const handlePrint = () => {
		const printWindow = openPrintableWindow()
		if (!printWindow) return
		setTimeout(() => {
			printWindow.print()
		}, 300)
	}

	const handleDownloadPDF = () => {
		const printWindow = openPrintableWindow()
		if (!printWindow) return
		setTimeout(() => {
			printWindow.print()
		}, 300)
		toast.success("Window cetak dibuka. Pilih 'Save as PDF' di dialog print browser Anda.")
	}

	const subtotal = items.reduce((sum, item) => sum + item.total, 0)
	const ppnAmount = formData.ppn ? subtotal * 0.11 : 0
	const grandTotal = subtotal + ppnAmount

	const formatRupiah = (amount: number) =>
		new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)

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
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">

							{/* Page Header */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Link href="/purchase-order">
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<ArrowLeft className="h-4 w-4" />
										</Button>
									</Link>
									<div>
										<h1 className="text-2xl font-bold tracking-tight">Buat Purchase Order</h1>
										<p className="text-muted-foreground text-sm">
											Isi formulir di bawah untuk membuat dokumen PO baru
										</p>
									</div>
								</div>
								<div className="flex gap-2">
									<Button variant="outline" onClick={() => setShowPreview(true)}>
										<Eye className="mr-2 h-4 w-4" />
										Preview
									</Button>
								</div>
							</div>

							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								{/* FORM - LEFT SIDE */}
								<div className="lg:col-span-2 flex flex-col gap-4">

									{/* INFO PO */}
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-base flex items-center gap-2">
												<FileText className="h-4 w-4" />
												Informasi Purchase Order
											</CardTitle>
										</CardHeader>
										<CardContent className="grid grid-cols-2 gap-4">
											<div className="space-y-1.5">
												<Label htmlFor="no-po">Nomor PO</Label>
												<Input
													id="no-po"
													placeholder="Contoh: 02/KJI/202507/001"
													value={formData.noPO}
													onChange={(e) => setFormData((p) => ({ ...p, noPO: e.target.value }))}
												/>
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="tanggal">Tanggal PO</Label>
												<Input
													id="tanggal"
													type="date"
													value={formData.tanggal}
													onChange={(e) => setFormData((p) => ({ ...p, tanggal: e.target.value }))}
												/>
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="dibuat-oleh">Dibuat Oleh</Label>
												<Input
													id="dibuat-oleh"
													placeholder="Nama pembuat PO"
													value={formData.dibuatOleh}
													onChange={(e) => setFormData((p) => ({ ...p, dibuatOleh: e.target.value }))}
												/>
											</div>
										</CardContent>
									</Card>

									{/* INFO VENDOR */}
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-base flex items-center gap-2">
												<ShoppingCart className="h-4 w-4" />
												Informasi Vendor
											</CardTitle>
										</CardHeader>
										<CardContent className="grid grid-cols-2 gap-4">
											<div className="col-span-2 space-y-1.5">
												<Label htmlFor="vendor-preset">Pilih Vendor Tersimpan</Label>
												<Select
													value={formData.supplierNama || "custom"}
													onValueChange={(value) =>
														setFormData((p) => ({
															...p,
															supplierNama: value === "custom" ? "" : value,
														}))
													}
												>
													<SelectTrigger id="vendor-preset" className="w-full">
														<SelectValue placeholder="Pilih vendor dari inventaris atau custom" />
													</SelectTrigger>
													<SelectContent>
														{Array.from(new Set(inventoryParts.map((part) => part.supplier).filter(Boolean))).map((supplier) => (
															<SelectItem key={supplier} value={supplier}>
																{supplier}
															</SelectItem>
														))}
														<SelectItem value="custom">Custom</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="supplier-kontak">Contact Person</Label>
												<Input
													id="supplier-kontak"
													placeholder="Mr./Mrs...."
													value={formData.supplierKontak}
													onChange={(e) => setFormData((p) => ({ ...p, supplierKontak: e.target.value }))}
												/>
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="supplier-cc">Cc <span className="text-muted-foreground">(optional)</span></Label>
												<Input
													id="supplier-cc"
													placeholder="Nama CC"
													onChange={(e) => setFormData((p) => ({ ...p, shipToCc: e.target.value }))}
												/>
											</div>
											<div className="col-span-2 space-y-1.5">
												<Label htmlFor="supplier-nama">Nama PT / Perusahaan</Label>
												<Input
													id="supplier-nama"
													placeholder="PT. Contoh Supplier Indonesia"
													value={formData.supplierNama}
													onChange={(e) => setFormData((p) => ({ ...p, supplierNama: e.target.value }))}
												/>
											</div>
											<div className="col-span-2 space-y-1.5">
												<Label htmlFor="supplier-alamat">Alamat PT</Label>
												<Textarea
													id="supplier-alamat"
													rows={2}
													placeholder="Jl. Contoh No. 1, Kota..."
													value={formData.supplierAlamat}
													onChange={(e) => setFormData((p) => ({ ...p, supplierAlamat: e.target.value }))}
												/>
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="supplier-telp">No. Telepon</Label>
												<Input
													id="supplier-telp"
													placeholder="021-XXXXXXX"
													value={formData.supplierTelp}
													onChange={(e) => setFormData((p) => ({ ...p, supplierTelp: e.target.value }))}
												/>
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="supplier-fax">Fax</Label>
												<Input
													id="supplier-fax"
													placeholder="021-XXXXXXX"
													value={formData.supplierTelp}
													onChange={(e) => setFormData((p) => ({ ...p, supplierTelp: e.target.value }))}
												/>
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="supplier-handphone">No. Handphone</Label>
												<Input
													id="supplier-handphone"
													placeholder="08xx-xxxx-xxxx"
													value={formData.supplierHandphone}
													onChange={(e) => setFormData((p) => ({ ...p, supplierHandphone: e.target.value }))}
												/>
											</div>
										</CardContent>
									</Card>

									{/* INFO SHIP TO */}
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-base flex items-center gap-2">
												<FileText className="h-4 w-4" />
												Informasi Ship To
											</CardTitle>
										</CardHeader>
										<CardContent className="grid grid-cols-2 gap-4">
											<div className="col-span-2 space-y-1.5">
												<Label htmlFor="shipto-preset">Pilih Ship To Tersimpan</Label>
												<Select
													value={formData.shipToNama === DEFAULT_SHIP_TO.companyName ? "default" : "custom"}
													onValueChange={(value) => {
														if (value === "default") {
															setFormData((p) => ({
																...p,
																shipToKontak: DEFAULT_SHIP_TO.contactPerson,
																shipToCc: DEFAULT_SHIP_TO.cc,
																shipToNama: DEFAULT_SHIP_TO.companyName,
																shipToAlamat: DEFAULT_SHIP_TO.address,
																shipToTelp: DEFAULT_SHIP_TO.phone,
																shipToHandphone: DEFAULT_SHIP_TO.handphone,
															}))
															return
														}
														setFormData((p) => ({ ...p, shipToNama: "", shipToAlamat: "", shipToTelp: "", shipToHandphone: "" }))
													}}
												>
													<SelectTrigger id="shipto-preset" className="w-full">
														<SelectValue placeholder="Pilih ship to atau custom" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="default">CV. Kurnia Jaya Industri</SelectItem>
														<SelectItem value="custom">Custom</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="shipto-kontak">Contact Person</Label>
												<Input id="shipto-kontak" placeholder="Mr./Mrs...." value={formData.shipToKontak} onChange={(e) => setFormData((p) => ({ ...p, shipToKontak: e.target.value }))} />
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="shipto-cc">Cc <span className="text-muted-foreground">(optional)</span></Label>
												<Input id="shipto-cc" placeholder="Nama CC"  onChange={(e) => setFormData((p) => ({ ...p, shipToCc: e.target.value }))} />
											</div>
											<div className="col-span-2 space-y-1.5">
												<Label htmlFor="shipto-nama">Nama PT / Perusahaan</Label>
												<Input id="shipto-nama" placeholder="CV. Kurnia Jaya Industri" value={formData.shipToNama} onChange={(e) => setFormData((p) => ({ ...p, shipToNama: e.target.value }))} />
											</div>
											<div className="col-span-2 space-y-1.5">
												<Label htmlFor="shipto-alamat">Alamat PT</Label>
												<Textarea id="shipto-alamat" rows={2} placeholder="Alamat tujuan pengiriman..." value={formData.shipToAlamat} onChange={(e) => setFormData((p) => ({ ...p, shipToAlamat: e.target.value }))} />
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="shipto-telp">No. Telepon</Label>
												<Input id="shipto-telp" placeholder="021-XXXXXXX" value={formData.shipToTelp} onChange={(e) => setFormData((p) => ({ ...p, shipToTelp: e.target.value }))} />
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="shipto-handphone">No. Handphone</Label>
												<Input id="shipto-handphone" placeholder="08xx-xxxx-xxxx" value={formData.shipToHandphone} onChange={(e) => setFormData((p) => ({ ...p, shipToHandphone: e.target.value }))} />
											</div>
										</CardContent>
									</Card>

									{/* METADATA PO */}
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-base">Requisitioner & Shipping Terms</CardTitle>
										</CardHeader>
										<CardContent className="grid grid-cols-2 gap-4">
											<div className="space-y-1.5">
												<Label htmlFor="requisitioner">Requisitioner</Label>
												<Input id="requisitioner" placeholder="-" value={formData.requisitioner} onChange={(e) => setFormData((p) => ({ ...p, requisitioner: e.target.value }))} />
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="ship-via">Ship Via</Label>
												<Input id="ship-via" placeholder="-" value={formData.shipVia} onChange={(e) => setFormData((p) => ({ ...p, shipVia: e.target.value }))} />
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="fob">F.O.B.</Label>
												<Input id="fob" placeholder="-" value={formData.fob} onChange={(e) => setFormData((p) => ({ ...p, fob: e.target.value }))} />
											</div>
											<div className="space-y-1.5">
												<Label htmlFor="shipping-terms">Shipping Terms</Label>
												<Input id="shipping-terms" placeholder="-" value={formData.shippingTerms} onChange={(e) => setFormData((p) => ({ ...p, shippingTerms: e.target.value }))} />
											</div>
										</CardContent>
									</Card>

									{/* TABEL ITEMS */}
									<Card>
										<CardHeader className="pb-3">
											<div className="flex items-center justify-between">
												<CardTitle className="text-base">Daftar Barang</CardTitle>
												<Button size="sm" onClick={addItem}>
													<Plus className="mr-1 h-4 w-4" />
													Tambah Baris
												</Button>
											</div>
											<CardDescription>
												Klik nama barang untuk mengisi otomatis dari inventaris yang ada
											</CardDescription>
										</CardHeader>
										<CardContent className="p-0">
											<div className="overflow-x-auto">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead className="w-[40px] text-center">#</TableHead>
															<TableHead className="w-[130px]">Part Number</TableHead>
															<TableHead>Nama Barang</TableHead>
															<TableHead className="w-[80px]">Satuan</TableHead>
															<TableHead className="w-[70px]">Qty</TableHead>
															<TableHead className="w-[140px]">Harga Satuan</TableHead>
															<TableHead className="w-[130px]">Total</TableHead>
															<TableHead className="w-[40px]"></TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{items.map((item, index) => (
															<TableRow key={index}>
																<TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
																<TableCell>
																	<Input
																		className="h-8 text-xs"
																		placeholder="PN-XXX"
																		value={item.partNumber}
																		onChange={(e) => updateItem(index, "partNumber", e.target.value)}
																	/>
																</TableCell>
																<TableCell>
																	<div className="flex gap-1">
																		<Input
																			className="h-8 w-38 text-xs"
																			placeholder="Nama barang..."
																			value={item.namaBarang}
																			onChange={(e) => updateItem(index, "namaBarang", e.target.value)}
																		/>
																	</div>
																</TableCell>
																<TableCell>
																	<Input
																		className="h-8 text-xs text-center"
																		placeholder="pcs"
																		value={item.satuan}
																		onChange={(e) => updateItem(index, "satuan", e.target.value)}
																	/>
																</TableCell>
																<TableCell>
																	<Input
																		className="h-8 w-20 text-xs text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
																		type="number"
																		min={1}
																		value={item.qty}
																		onChange={(e) => updateItem(index, "qty", Number(e.target.value))}
																	/>
																</TableCell>
																<TableCell>
																	<Input
																		className="h-8 w-24 text-xs text-center"
																		type="number"
																		onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
																		min={0}
																		placeholder="0"
																		value={item.hargaSatuan || ""}
																		onChange={(e) => updateItem(index, "hargaSatuan", Number(e.target.value))}
																	/>
																</TableCell>
																<TableCell className="font-medium text-sm text-right pr-3">
																	{item.total > 0 ? item.total.toLocaleString("id-ID") : "-"}
																</TableCell>
																<TableCell>
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-7 w-7 text-destructive hover:text-destructive"
																		onClick={() => removeItem(index)}
																		disabled={items.length === 1}
																	>
																		<Trash2 className="h-3.5 w-3.5" />
																	</Button>
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										</CardContent>
									</Card>

									{/* CATATAN */}
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-base">Catatan</CardTitle>
										</CardHeader>
										<CardContent>
											<Textarea
												rows={3}
												placeholder="Tambahkan catatan atau keterangan khusus..."
												value={formData.catatan}
												onChange={(e) => setFormData((p) => ({ ...p, catatan: e.target.value }))}
											/>
										</CardContent>
									</Card>
								</div>

								{/* SUMMARY - RIGHT SIDE */}
								<div className="flex flex-col gap-4">
									{/* Ringkasan */}
									<Card className="sticky top-4">
										<CardHeader className="pb-3">
											<CardTitle className="text-base">Ringkasan</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">No. PO</span>
												<span className="font-mono text-xs font-semibold">{formData.noPO}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Supplier</span>
												<span className="font-medium text-right max-w-[150px] truncate">
													{formData.supplierNama || "-"}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Total Item</span>
												<Badge variant="secondary">{items.length} baris</Badge>
											</div>
											<Separator />
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Subtotal</span>
												<span className="font-medium">{formatRupiah(subtotal)}</span>
											</div>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Switch
														id="ppn"
														checked={formData.ppn}
														onCheckedChange={(v) => setFormData((p) => ({ ...p, ppn: v }))}
													/>
													<Label htmlFor="ppn" className="text-sm cursor-pointer">
														PPN 11%
													</Label>
												</div>
												<span className="text-sm font-medium text-muted-foreground">
													{formatRupiah(ppnAmount)}
												</span>
											</div>
											<Separator />
											<div className="flex justify-between">
												<span className="font-bold">Grand Total</span>
												<span className="font-bold text-lg">{formatRupiah(grandTotal)}</span>
											</div>
											<Separator />

											{/* Action Buttons */}
											<div className="flex flex-col gap-2 pt-2">
												<Button
													className="w-full"
													onClick={() => setShowPreview(true)}
												>
													<Eye className="mr-2 h-4 w-4" />
													Preview Dokumen
												</Button>
											</div>
										</CardContent>
									</Card>

									{/* Quick Fill dari Inventaris */}
									{inventoryParts.length > 0 && (
										<Card>
											<CardHeader className="pb-3">
												<CardTitle className="text-base">Isi dari Inventaris</CardTitle>
												<CardDescription className="text-xs">
													Klik barang untuk menambah ke baris yang dipilih
												</CardDescription>
											</CardHeader>
											<CardContent className="p-0">
												<div className="max-h-[300px] overflow-y-auto divide-y">
													{inventoryParts.slice(0, 20).map((part, idx) => (
														<button
															key={`inv-${idx}-${part.id}`}
															className="w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors flex flex-col gap-0.5"
															onClick={() => fillFromInventory(items.length - 1, part)}
														>
															<span className="text-xs font-medium leading-none">{part.partName}</span>
															<span className="text-[10px] text-muted-foreground font-mono">{part.partNumber}</span>
														</button>
													))}
												</div>
											</CardContent>
										</Card>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>

			{/* PREVIEW DIALOG — fullscreen */}
			<Dialog open={showPreview} onOpenChange={setShowPreview}>
				<DialogContent
					className="h-[94vh] max-h-none p-0 rounded-sm flex flex-col"
					style={{ width: "96vw", maxWidth: "96vw" }}
				>
					{/* Toolbar */}
					<div className="flex items-center justify-between px-6 py-3 border-b bg-background flex-shrink-0">
						<DialogHeader className="p-0">
							<DialogTitle className="flex items-center gap-2 text-base">
								<FileText className="h-4 w-4" />
								Preview PO — {formData.noPO || "(Belum ada nomor PO)"}
							</DialogTitle>
							<DialogDescription className="text-xs">
								Review dokumen sebelum dicetak
							</DialogDescription>
						</DialogHeader>
						<div className="flex gap-2 ml-auto p-4">
							<Button variant="outline" size="sm" onClick={handlePrint}>
								<Printer className="mr-2 h-4 w-4" />
								Print
							</Button>
							<Button size="sm" onClick={handleDownloadPDF}>
								<Download className="mr-2 h-4 w-4" />
								Unduh / Simpan PDF
							</Button>
						</div>
					</div>
					{/* Document Preview — scrollable */}
					<div className="flex-1 overflow-auto bg-slate-200/70 p-3 md:p-6">
						<div className="w-fit mx-auto shadow-2xl bg-white">
							<div ref={printRef}>
								<PODocument data={buildPOData()} />
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</SidebarProvider>
	)
}
