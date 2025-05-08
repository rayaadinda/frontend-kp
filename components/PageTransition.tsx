"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

interface PageTransitionProps {
	children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
	const pathname = usePathname()

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={pathname}
				initial={{
					opacity: 0,
					x: 10,
				}}
				animate={{
					opacity: 1,
					x: 0,
				}}
				exit={{
					opacity: 0,
					x: -10,
				}}
				transition={{
					duration: 0.2,
					ease: "easeInOut",
				}}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	)
}
