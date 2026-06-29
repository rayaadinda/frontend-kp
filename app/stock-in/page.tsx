"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { getAuthToken } from "@/lib/auth-token"
import { toast } from "sonner"
import { IconPackageImport, IconLoader2, IconCheck, IconSelector, IconSearch, IconBuildingStore, IconMapPin, IconBox } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const formSchema = z.object({
	inventoryId: z.string().min(1, { message: "Item harus dipilih" }),
	quantity: z.coerce.number().min(1, { message: "Kuantitas minimal 1" }),
	notes: z.string().optional(),
})

interface InventoryItem {
	_id: string
	partNumber: string
	partName: string
	quantity: number
	supplier: string
	location: string
}

export default function StockInPage() {
	const [inventory, setInventory] = useState<InventoryItem[]>([])
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [openCombobox, setOpenCombobox] = useState(false)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			inventoryId: "",
			quantity: 1,
			notes: "",
		},
	})

	const selectedInventoryId = form.watch("inventoryId")
	const selectedItem = useMemo(() => {
		return inventory.find(item => item._id === selectedInventoryId)
	}, [inventory, selectedInventoryId])

	const fetchInventory = async () => {
		try {
			setLoading(true)
			const token = await getAuthToken()
			if (!token) return

			const response = await fetch(`${API_URL}/api/inventory`, {
				headers: { Authorization: `Bearer ${token}` }
			})
			
			const data = await response.json()
			if (data.success) {
				setInventory(data.data)
			}
		} catch (error) {
			console.error("Failed to fetch inventory", error)
			toast.error("Gagal mengambil data inventaris.")
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchInventory()
	}, [])

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			setSubmitting(true)
			const token = await getAuthToken()
			if (!token) throw new Error("Unauthorized")

			const response = await fetch(`${API_URL}/api/inventory/${values.inventoryId}/receiving`, {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					quantity: values.quantity,
					notes: values.notes || "Penerimaan barang masuk (Stock-in)"
				})
			})

			const data = await response.json()
			
			if (!response.ok) {
				throw new Error(data.message || "Gagal menyimpan stock-in")
			}

			toast.success("Barang masuk berhasil dicatat!")
			form.reset()
			fetchInventory() // Refresh qty
		} catch (error: unknown) {
			console.error(error)
			const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan"
			toast.error(errorMessage)
		} finally {
			setSubmitting(false)
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
					<div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 w-full">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
							<div className="flex items-center gap-3">
								<div className="p-2.5 bg-primary/10 text-primary rounded-sm">
									<IconPackageImport className="size-6" />
								</div>
								<div>
									<h1 className="text-2xl font-bold tracking-tight">Penerimaan Barang (Stock-in)</h1>
									<p className="text-muted-foreground text-sm">
										Catat penerimaan komponen baru ke gudang untuk menambah stok
									</p>
								</div>
							</div>
						</div>

						{loading ? (
							<div className="flex justify-center items-center h-64 border rounded-sm bg-card">
								<div className="flex flex-col items-center gap-2 text-muted-foreground">
									<IconLoader2 className="animate-spin size-8" />
									<p>Memuat data komponen...</p>
								</div>
							</div>
						) : (
							<div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
								{/* Form Section */}
								<div className="lg:col-span-3">
									<Card className="border-border/60 shadow-sm overflow-hidden">
										<CardHeader className="bg-muted/30 pb-4 border-b">
											<CardTitle className="text-lg">Form Input Kedatangan</CardTitle>
											<CardDescription>
												Silakan cari komponen dan masukkan detail penerimaan barang.
											</CardDescription>
										</CardHeader>
										<CardContent className="pt-6">
											<Form {...form}>
												<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
													<FormField
														control={form.control}
														name="inventoryId"
														render={({ field }) => (
															<FormItem className="flex flex-col">
																<FormLabel>Pilih Part / Komponen</FormLabel>
																<Popover open={openCombobox} onOpenChange={setOpenCombobox}>
																	<PopoverTrigger asChild>
																		<FormControl>
																			<Button
																				variant="outline"
																				role="combobox"
																				aria-expanded={openCombobox}
																				className={cn(
																					"w-full justify-between font-normal",
																					!field.value && "text-muted-foreground"
																				)}
																			>
																				{field.value
																					? inventory.find((item) => item._id === field.value)?.partName || inventory.find((item) => item._id === field.value)?.partNumber
																					: "Cari part berdasarkan nama atau kode..."}
																				<IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
																			</Button>
																		</FormControl>
																	</PopoverTrigger>
																	<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
																		<Command>
																			<CommandInput placeholder="Cari part number atau nama..." className="h-9" />
																			<CommandList>
																				<CommandEmpty>Part tidak ditemukan.</CommandEmpty>
																				<CommandGroup>
																					{inventory.map((item) => (
																						<CommandItem
																							value={`${item.partNumber} ${item.partName}`}
																							key={item._id}
																							onSelect={() => {
																								form.setValue("inventoryId", item._id)
																								setOpenCombobox(false)
																							}}
																							className="flex flex-col items-start gap-1 py-2 cursor-pointer"
																						>
																							<div className="flex items-center w-full">
																								<div className="font-medium flex-1 truncate">{item.partName}</div>
																								<IconCheck
																									className={cn(
																										"h-4 w-4 shrink-0 text-primary",
																										item._id === field.value ? "opacity-100" : "opacity-0"
																									)}
																								/>
																							</div>
																							<div className="text-xs text-muted-foreground flex gap-2 w-full justify-between">
																								<span className="font-mono">{item.partNumber}</span>
																								<span>Sisa: {item.quantity}</span>
																							</div>
																						</CommandItem>
																					))}
																				</CommandGroup>
																			</CommandList>
																		</Command>
																	</PopoverContent>
																</Popover>
																<FormMessage />
															</FormItem>
														)}
													/>

													<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
														<FormField
															control={form.control}
															name="quantity"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Kuantitas Diterima (Qty)</FormLabel>
																	<FormControl>
																		<div className="relative">
																			<Input type="number" min={1} className="pl-10 font-mono text-lg" {...field} />
																			<IconBox className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
																		</div>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name="notes"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Catatan Pengiriman (Opsional)</FormLabel>
																	<FormControl>
																		<Input placeholder="DO-12345, PO-9988..." {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>

													<div className="pt-4 mt-4 border-t flex justify-end">
														<Button type="submit" size="lg" disabled={submitting || !selectedInventoryId} className="w-full sm:w-auto px-8">
															{submitting ? (
																<IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
															) : (
																<IconPackageImport className="mr-2 h-5 w-5" />
															)}
															Simpan Kedatangan Stok
														</Button>
													</div>
												</form>
											</Form>
										</CardContent>
									</Card>
								</div>

								{/* Info Section */}
								<div className="lg:col-span-2">
									<Card className="border-border/60 shadow-sm bg-muted/20 h-full">
										<CardHeader>
											<CardTitle className="text-lg flex items-center gap-2">
												<IconSearch className="h-5 w-5 text-primary" />
												Detail Komponen
											</CardTitle>
											<CardDescription>
												Informasi komponen yang dipilih akan muncul di sini.
											</CardDescription>
										</CardHeader>
										<CardContent>
											{selectedItem ? (
												<div className="space-y-6">
													<div>
														<h3 className="text-xl font-bold text-foreground mb-1">{selectedItem.partName}</h3>
														<div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold font-mono bg-background text-muted-foreground">
															{selectedItem.partNumber}
														</div>
													</div>
													
													<div className="grid grid-cols-2 gap-4">
														<div className="bg-background rounded-lg p-3 border shadow-sm flex flex-col gap-1">
															<span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Stok Saat Ini</span>
															<span className="text-2xl font-bold">{selectedItem.quantity}</span>
														</div>
														<div className="bg-background rounded-lg p-3 border shadow-sm flex flex-col justify-center gap-1">
															<span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Lokasi Rack</span>
															<span className="text-sm font-medium flex items-center gap-1">
																<IconMapPin className="h-3.5 w-3.5 text-primary" />
																{selectedItem.location || "-"}
															</span>
														</div>
													</div>

													<div className="bg-background rounded-lg p-3 border shadow-sm">
														<span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2 block">Supplier</span>
														<div className="flex items-center gap-2 text-sm font-medium">
															<div className="p-1.5 bg-primary/10 rounded text-primary">
																<IconBuildingStore className="h-4 w-4" />
															</div>
															{selectedItem.supplier || "-"}
														</div>
													</div>

													{selectedItem.quantity < 10 && (
														<div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 rounded-lg text-sm flex gap-2 items-start mt-4">
															<IconLoader2 className="h-4 w-4 shrink-0 mt-0.5" />
															<div>
																<p className="font-semibold">Stok Hampir Habis</p>
																<p className="opacity-90 text-xs mt-0.5">Segera tambahkan stok untuk menghindari kekosongan saat produksi.</p>
															</div>
														</div>
													)}
												</div>
											) : (
												<div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed rounded-lg p-6 bg-background">
													<div className="p-3 bg-muted rounded-full mb-3">
														<IconBox className="h-6 w-6 text-muted-foreground" />
													</div>
													<p className="text-sm text-muted-foreground">Belum ada komponen yang dipilih.</p>
													<p className="text-xs text-muted-foreground mt-1">Cari dan pilih komponen di form sebelah kiri untuk melihat detailnya.</p>
												</div>
											)}
										</CardContent>
									</Card>
								</div>
							</div>
						)}
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
