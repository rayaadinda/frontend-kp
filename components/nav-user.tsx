"use client"

import {
	IconDotsVertical,
	IconLogout,
	IconUserCircle,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar"

export function NavUser() {
	const { isMobile } = useSidebar()
	const router = useRouter()
	const [user, setUser] = useState({
		name: "Pengguna",
		email: "pengguna@contoh.com",
		avatar: "",
	})
	const [userInitials, setUserInitials] = useState("P")

	useEffect(() => {
		// Ambil info pengguna dari localStorage
		const userJson = localStorage.getItem("user")
		if (userJson) {
			try {
				const userData = JSON.parse(userJson)
				setUser({
					name: userData.username || "Pengguna",
					email: userData.email || "pengguna@contoh.com",
					avatar: userData.avatar || "",
				})
				// Ambil inisial dari username
				setUserInitials((userData.username || "P").charAt(0).toUpperCase())
			} catch (error) {
				console.error("Error mengurai info pengguna:", error)
			}
		}
	}, [])

	const handleLogout = () => {
		// Hapus data autentikasi
		localStorage.removeItem("token")
		localStorage.removeItem("user")

		// Redirect ke halaman login
		router.push("/login")
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg grayscale">
								{user.avatar ? (
									<AvatarImage src={user.avatar} alt={user.name} />
								) : null}
								<AvatarFallback className="rounded-lg">
									{userInitials}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="text-muted-foreground truncate text-xs">
									{user.email}
								</span>
							</div>
							<IconDotsVertical className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									{user.avatar ? (
										<AvatarImage src={user.avatar} alt={user.name} />
									) : null}
									<AvatarFallback className="rounded-lg">
										{userInitials}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="text-muted-foreground truncate text-xs">
										{user.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<IconUserCircle className="mr-2 h-4 w-4" />
							Akun
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout}>
							<IconLogout className="mr-2 h-4 w-4" />
							Keluar
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
