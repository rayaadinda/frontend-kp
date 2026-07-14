"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
	IconChartBar,
	IconDashboard,
	IconFileAi,
	IconFileText,
	IconHelp,
	IconInnerShadowTop,
	IconReport,
	IconSettings,
	IconShoppingCart,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: IconDashboard,
		},
		{
			title: "Inventaris",
			url: "/inventory",
			icon: IconChartBar,
		},
		{
			title: "Barang Masuk",
			url: "/stock-in",
			icon: IconReport,
		},
		{
			title: "Barang Keluar",
			url: "/checkout",
			icon: IconReport,
		},
		{
			title: "Prediksi K-Means",
			url: "/prediction",
			icon: IconFileAi,
		},
		{
			title: "Master B.O.M",
			url: "/bom",
			icon: IconReport,
		},
		{
			title: "Purchase Order",
			url: "/purchase-order",
			icon: IconShoppingCart,
		},
		{
			title: "Laporan",
			url: "/report",
			icon: IconFileText,
		},
	],
	navSecondary: [
		{
			title: "Pengaturan",
			url: "#",
			icon: IconSettings,
		},
		{
			title: "Bantuan",
			url: "#",
			icon: IconHelp,
		},
	],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = useSession()
	const isAdmin = session?.user?.role === "admin"

	const filteredNavMain = data.navMain.filter((item) => {
		if (isAdmin) return true
		return item.url === "/inventory" || item.url === "/checkout"
	})

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="#">
								<IconInnerShadowTop className="!size-5" />
								<span className="text-base font-semibold">
									CV Kurnia Jaya Industri.
								</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={filteredNavMain} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	)
}
