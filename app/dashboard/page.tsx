"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { InventoryChart } from "@/components/inventory-chart"
import { useEffect, useState } from "react"

// Data inventaris untuk dashboard
const inventoryData = [
	{
		id: 1,
		header: "Terminal V-35",
		type: "Elektronik",
		status: "Stok Rendah",
		target: "500",
		limit: "100",
		reviewer: "John Doe",
	},
	{
		id: 2,
		header: "Kabel 18 AWG",
		type: "Material",
		status: "Tersedia",
		target: "1000",
		limit: "200",
		reviewer: "Jane Smith",
	},
	{
		id: 3,
		header: "Konektor KS-12",
		type: "Komponen",
		status: "Stok Rendah",
		target: "600",
		limit: "150",
		reviewer: "Mike Johnson",
	},
	{
		id: 4,
		header: "Harnes Kabel WR-10",
		type: "Rakitan",
		status: "Tersedia",
		target: "300",
		limit: "75",
		reviewer: "Sarah Wilson",
	},
	{
		id: 5,
		header: "Unit Catu Daya",
		type: "Elektronik",
		status: "Habis",
		target: "100",
		limit: "25",
		reviewer: "David Brown",
	},
	{
		id: 6,
		header: "PCB A-12",
		type: "Elektronik",
		status: "Tersedia",
		target: "200",
		limit: "50",
		reviewer: "Emma Davis",
	},
	{
		id: 7,
		header: "Ikatan Kabel B-45",
		type: "Rakitan",
		status: "Stok Rendah",
		target: "150",
		limit: "30",
		reviewer: "James Lee",
	},
	{
		id: 8,
		header: "Casing Plastik",
		type: "Komponen",
		status: "Tersedia",
		target: "400",
		limit: "100",
		reviewer: "Linda Chen",
	},
	{
		id: 9,
		header: "Selongsong Heatshrink",
		type: "Material",
		status: "Tersedia",
		target: "1500",
		limit: "300",
		reviewer: "Robert Kim",
	},
	{
		id: 10,
		header: "Braket Logam",
		type: "Komponen",
		status: "Stok Rendah",
		target: "300",
		limit: "75",
		reviewer: "Susan Wang",
	},
]

// Kartu metrik inventaris
function InventorySectionCards() {
	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			<div
				data-slot="card"
				className="@container/card rounded-lg border bg-card p-4 shadow-sm"
			>
				<div className="flex flex-col gap-1">
					<p className="text-sm text-muted-foreground">Total Item Inventaris</p>
					<p className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						342
					</p>
				</div>
				<div className="mt-4 flex flex-col gap-1.5 text-sm">
					<div className="flex gap-2 font-medium">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="size-4 text-green-500"
						>
							<path d="m5 12 5 5 9-9" />
						</svg>
						+15 item baru bulan ini
					</div>
					<div className="text-sm text-muted-foreground">
						Dari semua kategori dan jenis
					</div>
				</div>
			</div>

			<div
				data-slot="card"
				className="@container/card rounded-lg border bg-card p-4 shadow-sm"
			>
				<div className="flex flex-col gap-1">
					<p className="text-sm text-muted-foreground">Item Stok Rendah</p>
					<p className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						18
					</p>
				</div>
				<div className="mt-4 flex flex-col gap-1.5 text-sm">
					<div className="flex gap-2 font-medium">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="size-4 text-amber-500"
						>
							<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
						Memerlukan perhatian
					</div>
					<div className="text-sm text-muted-foreground">
						Di bawah batas minimum
					</div>
				</div>
			</div>

			<div
				data-slot="card"
				className="@container/card rounded-lg border bg-card p-4 shadow-sm"
			>
				<div className="flex flex-col gap-1">
					<p className="text-sm text-muted-foreground">
						Tingkat Pengambilan Material
					</p>
					<p className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						148/hari
					</p>
				</div>
				<div className="mt-4 flex flex-col gap-1.5 text-sm">
					<div className="flex gap-2 font-medium">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="size-4 text-blue-500"
						>
							<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
							<polyline points="16 7 22 7 22 13" />
						</svg>
						Naik 12% bulan ini
					</div>
					<div className="text-sm text-muted-foreground">
						Permintaan produksi meningkat
					</div>
				</div>
			</div>

			<div
				data-slot="card"
				className="@container/card rounded-lg border bg-card p-4 shadow-sm"
			>
				<div className="flex flex-col gap-1">
					<p className="text-sm text-muted-foreground">Kesehatan Stok</p>
					<p className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						75%
					</p>
				</div>
				<div className="mt-4 flex flex-col gap-1.5 text-sm">
					<div className="flex gap-2 font-medium">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="size-4 text-green-500"
						>
							<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
							<rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
						</svg>
						Level inventaris sehat
					</div>
					<div className="text-sm text-muted-foreground">
						258 dari 342 item pada level optimal
					</div>
				</div>
			</div>
		</div>
	)
}

export default function DashboardPage() {
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
							<InventorySectionCards />
							<div className="px-4 lg:px-6">
								<InventoryChart />
							</div>
							<DataTable data={inventoryData} />
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
