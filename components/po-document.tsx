"use client"

import React from "react"

export interface POItem {
	no: number
	partNumber: string
	namaBarang: string
	satuan: string
	qty: number
	hargaSatuan: number
	total: number
}

export interface POData {
	noPO: string
	tanggal: string
	tanggalKirim: string
	vendor: {
		contactPerson: string
		cc: string
		companyName: string
		address: string
		fax: string
		phone: string
		handphone: string
	}
	shipTo: {
		contactPerson: string
		cc: string
		companyName: string
		address: string
		phone: string
		handphone: string
	}
	requisitioner: string
	shipVia: string
	fob: string
	shippingTerms: string
	items: POItem[]
	catatan: string
	ppn: boolean
	dibuatOleh: string
	jabatan: string
}

interface PODocumentProps {
	data: POData
}

export function PODocument({ data }: PODocumentProps) {
	const subtotal = data.items.reduce((sum, item) => sum + item.total, 0)
	const ppnAmount = data.ppn ? subtotal * 0.11 : 0
	const grandTotal = subtotal + ppnAmount
	const paperWidth = "215.9mm"
	const paperHeight = "330.2mm"

	const formatMoney = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`
	const displayText = (value?: string) => (value && value.trim() ? value : "-")

	return (
		<div
			id="po-document"
			style={{
				fontFamily: "Arial, sans-serif",
				fontSize: "9pt",
				color: "#000",
				backgroundColor: "#fff",
				width: paperWidth,
				minHeight: paperHeight,
				padding: "11mm 10mm 9mm 10mm",
				margin: "0 auto",
				boxSizing: "border-box",
				lineHeight: "1.15",
			}}
		>
			<div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "12px", alignItems: "start", marginBottom: "10px" }}>
				<div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
					<div style={{ width: "34px", height: "34px", borderRadius: "50%", border: "1.5px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6.5pt", fontWeight: "bold", flexShrink: 0 }}>
						LOGO
					</div>
					<div>
						<div style={{ fontSize: "13.5pt", fontWeight: "bold", letterSpacing: "0.1px", lineHeight: 1.02 }}>
							CV KURNIA JAYA INDUSTRI
						</div>
						<div style={{ fontSize: "7.8pt", marginTop: "3px" }}>
							Batan Indah Blok J nomor 17, RT03/RW04
						</div>
						<div style={{ fontSize: "7.8pt" }}>
							Kademangan - Setu, Tangerang Selatan - Banten 15315
						</div>
						<div style={{ fontSize: "7.8pt" }}>
							Phone : +6221 7564031
						</div>
					</div>
				</div>
				<div style={{ textAlign: "right" }}>
					<div style={{ fontSize: "17pt", fontWeight: "bold", lineHeight: 1.05, letterSpacing: "0.2px", color: "#1468b3" }}>PURCHASE ORDER</div>
					<table style={{ marginLeft: "auto", marginTop: "5px", borderCollapse: "collapse", fontSize: "8pt" }}>
						<tbody>
							<tr>
								<td style={{ padding: "1px 6px 1px 0", fontWeight: "bold" }}>DATE</td>
								<td style={{ padding: "1px 0 1px 6px", border: "1px solid #999", minWidth: "96px", textAlign: "center" }}>{displayText(data.tanggal)}</td>
							</tr>
							<tr>
								<td style={{ padding: "1px 6px 1px 0", fontWeight: "bold" }}>PO #</td>
								<td style={{ padding: "1px 0 1px 6px", border: "1px solid #999", minWidth: "96px", textAlign: "center" }}>{displayText(data.noPO)}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div style={{ borderTop: "2px solid #000", marginBottom: "10px" }} />

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
				<div style={{ minHeight: "92px" }}>
					<div style={{ backgroundColor: "#1468b3", color: "#fff", fontSize: "8.4pt", fontWeight: "bold", padding: "3px 10px", letterSpacing: "0.15px" }}>VENDOR</div>
					<div style={{ padding: "3px 3px 0 3px", fontSize: "8pt", lineHeight: 1.04 }}>
						<div style={{ fontSize: "9.5pt", fontWeight: "bold" }}>{displayText(data.vendor.contactPerson)}</div>
						<div style={{ fontSize: "8.5pt", fontWeight: "bold" }}>Cc : {displayText(data.vendor.cc)}</div>
						<div style={{ fontSize: "11pt", fontWeight: "bold", marginTop: "1px" }}>{displayText(data.vendor.companyName)}</div>
						<div style={{ fontSize: "8.5pt" }}>{displayText(data.vendor.address)}</div>
						<div style={{ display: "grid", gridTemplateColumns: "58px 1fr", gap: "4px", marginTop: "1px", fontSize: "8.5pt" }}>
							<div>Hp</div>
							<div>: {displayText(data.vendor.phone)}</div>
							<div>Fax</div>
							<div>: {displayText(data.vendor.fax)}</div>
							<div>Handphone</div>
							<div>: {displayText(data.vendor.handphone)}</div>
						</div>
					</div>
				</div>
				<div style={{ minHeight: "92px" }}>
					<div style={{ backgroundColor: "#1468b3", color: "#fff", fontSize: "8.4pt", fontWeight: "bold", padding: "3px 10px", letterSpacing: "0.15px" }}>SHIP TO</div>
					<div style={{ padding: "3px 3px 0 3px", fontSize: "8pt", lineHeight: 1.04 }}>
						<div style={{ fontSize: "9.5pt", fontWeight: "bold" }}>{displayText(data.shipTo.contactPerson)}</div>
						<div style={{ fontSize: "8.5pt", fontWeight: "bold" }}>Cc : {displayText(data.shipTo.cc)}</div>
						<div style={{ fontSize: "11pt", fontWeight: "bold", marginTop: "1px" }}>{displayText(data.shipTo.companyName)}</div>
						<div style={{ fontSize: "8.5pt" }}>{displayText(data.shipTo.address)}</div>
						<div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: "4px", marginTop: "1px", fontSize: "8.5pt" }}>
							<div>Phone</div>
							<div>: {displayText(data.shipTo.phone)}</div>
							<div>Handphone</div>
							<div>: {displayText(data.shipTo.handphone)}</div>
						</div>
						
					</div>
				</div>
			</div>

			<table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", fontSize: "8pt" }}>
				<thead>
					<tr style={{ backgroundColor: "#1f6fb2", color: "#fff" }}>
						<th style={{ border: "2px solid #000", padding: "3px 4px", textAlign: "center" }}>REQUISITIONER</th>
						<th style={{ border: "2px solid #000", padding: "3px 4px", textAlign: "center" }}>SHIP VIA</th>
						<th style={{ border: "2px solid #000", padding: "3px 4px", textAlign: "center" }}>F.O.B.</th>
						<th style={{ border: "2px solid #000", padding: "3px 4px", textAlign: "center" }}>SHIPPING TERMS</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td style={{ border: "2px solid #000", padding: "2px 4px", textAlign: "center" }}>{displayText(data.requisitioner)}</td>
						<td style={{ border: "2px solid #000", padding: "2px 4px", textAlign: "center" }}>{displayText(data.shipVia)}</td>
						<td style={{ border: "2px solid #000", padding: "2px 4px", textAlign: "center" }}>{displayText(data.fob)}</td>
						<td style={{ border: "2px solid #000", padding: "2px 4px", textAlign: "center" }}>{displayText(data.shippingTerms)}</td>
					</tr>
				</tbody>
			</table>

			<table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px", fontSize: "8pt" }}>
				<thead>
					<tr style={{ backgroundColor: "#1f6fb2", color: "#fff" }}>
						<th style={{ border: "2px solid #000", padding: "3px 4px", width: "4%", textAlign: "center" }}>NO</th>
						<th style={{ border: "2px solid #000", padding: "3px 4px", width: "10%", textAlign: "center" }}>ITEM #</th>
						<th style={{ border: "2px solid #000", padding: "3px 6px", width: "15%", textAlign: "center" }}>DESCRIPTION</th>
						<th colSpan={2} style={{ border: "2px solid #000", padding: "3px 4px", width: "5%", textAlign: "center" }}>QTY</th>
						<th style={{ border: "2px solid #000", padding: "3px 6px", width: "7%", textAlign: "center" }}>UNIT PRICE</th>
						<th style={{ border: "2px solid #000", padding: "3px 6px", width: "10%", textAlign: "center" }}>TOTAL</th>
					</tr>
				</thead>
				<tbody>
					{data.items.map((item, index) => (
						<tr key={index}>
							<td style={{ border: "2px solid #000", padding: "2px 4px", textAlign: "center", lineHeight: 1 }}>{index + 1}</td>
							<td style={{ border: "2px solid #000", padding: "2px 5px", textAlign: "center", lineHeight: 1 }}>{displayText(item.partNumber)}</td>
							<td style={{ border: "2px solid #000", padding: "2px 6px", lineHeight: 1 }}>{displayText(item.namaBarang)}</td>
							<td style={{ border: "2px solid #000", padding: "2px 4px", textAlign: "center", lineHeight: 1 }}>{item.qty}</td>
							<td style={{ border: "2px solid #000", padding: "2px 4px", textAlign: "center", lineHeight: 1 }}>{displayText(item.satuan)}</td>
							<td style={{ border: "2px solid #000", padding: "2px 5px", textAlign: "right", lineHeight: 1 }}>{item.hargaSatuan > 0 ? formatMoney(item.hargaSatuan) : "-"}</td>
							<td style={{ border: "2px solid #000", padding: "2px 5px", textAlign: "right", lineHeight: 1 }}>{item.total > 0 ? formatMoney(item.total) : "-"}</td>
						</tr>
					))}
					{data.items.length < 8 &&
						Array.from({ length: 8 - data.items.length }).map((_, index) => (
							<tr key={`empty-${index}`} style={{ height: "19px" }}>
								<td style={{ border: "2px solid #000" }} />
								<td style={{ border: "2px solid #000" }} />
								<td style={{ border: "2px solid #000" }} />
								<td style={{ border: "2px solid #000" }} />
								<td style={{ border: "2px solid #000" }} />
								<td style={{ border: "2px solid #000" }} />
								<td style={{ border: "2px solid #000" }} />
							</tr>
						))}
				</tbody>
			</table>

			<div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "10px", alignItems: "start", marginBottom: "12px" }}>
				<div style={{ border: "1px solid #999", minHeight: "92px" }}>
					<div style={{ padding: "5px 8px", fontSize: "8.3pt", fontWeight: "bold", borderBottom: "1px solid #999", backgroundColor: "#f5f5f5" }}>Comments or Special Instructions</div>
					<div style={{ padding: "5px 8px 6px", fontSize: "8pt", whiteSpace: "pre-wrap", minHeight: "60px", lineHeight: 1.18 }}>{data.catatan}</div>
				</div>
				<div>
					<table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt" }}>
						<tbody>
							<tr>
								<td style={{ border: "1px solid #999", padding: "2px 6px", fontWeight: "bold" }}>SUBTOTAL</td>
								<td style={{ border: "1px solid #999", padding: "2px 6px", textAlign: "right" }}>Rp</td>
								<td style={{ border: "1px solid #999", padding: "2px 6px", textAlign: "right" }}>{subtotal.toLocaleString("id-ID")}</td>
							</tr>
							<tr>
								<td style={{ border: "1px solid #999", padding: "2px 6px", fontWeight: "bold" }}>TAX</td>
								<td style={{ border: "1px solid #999", padding: "2px 6px", textAlign: "right" }}>Rp</td>
								<td style={{ border: "1px solid #999", padding: "2px 6px", textAlign: "right" }}>{data.ppn ? ppnAmount.toLocaleString("id-ID") : "-"}</td>
							</tr>
							<tr>
								<td style={{ border: "1px solid #999", padding: "2px 6px", fontWeight: "bold" }}>SHIPPING</td>
								<td style={{ border: "1px solid #999", padding: "2px 6px", textAlign: "right" }}>Rp</td>
								<td style={{ border: "1px solid #999", padding: "2px 6px", textAlign: "right" }}>-</td>
							</tr>
							<tr>
								<td style={{ border: "1px solid #999", padding: "2px 6px", fontWeight: "bold" }}>OTHER</td>
								<td style={{ border: "1px solid #999", padding: "2px 6px", textAlign: "right" }}>Rp</td>
								<td style={{ border: "1px solid #999", padding: "2px 6px", textAlign: "right" }}>-</td>
							</tr>
							<tr style={{ backgroundColor: "#1f2240", color: "#fff" }}>
								<td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold" }}>TOTAL</td>
								<td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>Rp</td>
								<td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right", fontWeight: "bold" }}>{grandTotal.toLocaleString("id-ID")}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 0.95fr", gap: "12px", alignItems: "start", marginBottom: "18px" }}>
				<div style={{ fontSize: "8pt", lineHeight: 1.18 }}>
					<div style={{ marginBottom: "4px" }}>If you have any questions about this purchase order, please contact</div>
					<table style={{ borderCollapse: "collapse", fontSize: "8pt" }}>
						<tbody>
							<tr>
								<td style={{ paddingRight: "6px", fontWeight: "bold" }}>Name</td>
								<td>: {displayText(data.dibuatOleh)}</td>
							</tr>
							<tr>
								<td style={{ paddingRight: "6px", fontWeight: "bold" }}>Email</td>
								<td>: {displayText(data.vendor.contactPerson)}</td>
							</tr>
							<tr>
								<td style={{ paddingRight: "6px", fontWeight: "bold" }}>Phone</td>
								<td>: {displayText(data.vendor.phone)}</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div style={{ textAlign: "center", paddingTop: "38px" }}>
					<div style={{ fontSize: "14pt", lineHeight: 1, marginBottom: "10px" }}>____________</div>
					<div style={{ fontWeight: "bold", fontSize: "8.6pt", textDecoration: "underline" }}>{displayText(data.dibuatOleh) || "Aditya Mahardika"}</div>
					<div style={{ fontSize: "8pt" }}>CV. Kurnia Jaya Industri</div>
				</div>
			</div>

			<div style={{ fontSize: "7.9pt", marginBottom: "8px" }}>
				<div style={{ marginBottom: "3px" }}>Note :</div>
				<div>1. Invoice diterima Maksimal tanggal 25 setiap bulan</div>
				<div>2. Pembayaran kepada Vendor dilakukan tanggal 25 setiap bulan dengan tempo waktu pengajuan minimal 1 bulan</div>
				<div>3. Jika ada hal yang perlu disepakati, akan dibicarakan antara pihak Vendor dengan CV.KJI</div>
			</div>
		</div>
	)
}
