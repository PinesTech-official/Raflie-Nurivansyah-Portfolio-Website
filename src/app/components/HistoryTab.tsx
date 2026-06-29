import { useState, useMemo } from "react";
import { buyerOrders, sellerItems, returnRefundData } from "./data";
import { formatRupiah, StatusBadge } from "./DashboardTab";
import { Lang, tr } from "./i18n";
import { ArrowLeft, Download, ShoppingCart, Store, RefreshCw, X, ChevronRight, Package, MapPin, Truck, CreditCard, Tag, Hash } from "lucide-react";

type TxType = "all" | "buyer" | "seller" | "refund";

interface Transaction {
  id: string;
  date: string;
  customer: string;
  item: string;
  value: number;
  type: TxType;
  typeLabel: string;
  status: string;
  paymentMethod?: string;
  notes?: string;
}

function exportHistoryCSV(data: Transaction[]) {
  const headers = ["ID", "Tanggal", "Customer", "Nama Barang", "Nilai", "Tipe", "Status", "Metode"];
  const rows = data.map((d) => [
    d.id, d.date, d.customer, `"${d.item}"`,
    d.value, d.typeLabel, d.status, d.paymentMethod || "-",
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export_history_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportHistoryXLS(data: Transaction[]) {
  const rows = data.map((d) => `
    <tr>
      <td>${d.id}</td>
      <td>${d.date}</td>
      <td>${d.customer}</td>
      <td>${d.item}</td>
      <td>${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(d.value)}</td>
      <td>${d.typeLabel}</td>
      <td>${d.status}</td>
      <td>${d.paymentMethod || "-"}</td>
    </tr>`).join("");
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="UTF-8">
<style>table{border-collapse:collapse}th{background:#1e2a4a;color:white;padding:6px 10px;border:1px solid #ccc;font-weight:bold}td{padding:5px 10px;border:1px solid #ccc}tr:nth-child(even)td{background:#f4f6fb}</style>
</head><body>
<h2 style="font-family:Arial;color:#1e2a4a;">Riwayat Transaksi / Transaction History</h2>
<p style="font-family:Arial;color:#6b7280;">Export: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
<table><thead><tr>
  <th>ID</th><th>Tanggal</th><th>Customer</th><th>Nama Barang</th><th>Nilai</th><th>Tipe</th><th>Status</th><th>Metode</th>
</tr></thead><tbody>${rows}</tbody></table>
</body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export_history_${new Date().toISOString().split("T")[0]}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

function TransactionDetailModal({ row, lang, onClose }: { row: Transaction; lang: Lang; onClose: () => void }) {
  const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
    buyer:  { bg: "#dbeafe", color: "#2563eb" },
    seller: { bg: "#ede9fe", color: "#7c3aed" },
    refund: { bg: "#fee2e2", color: "#dc2626" },
    all:    { bg: "#f3f4f6", color: "#374151" },
  };
  const tc = TYPE_COLORS[row.type] ?? TYPE_COLORS.all;

  // Find extra details from source data
  const buyerOrder = row.type === "buyer" ? buyerOrders.find((o) => o.id === row.id) : null;
  const sellerItem = row.type === "seller" ? sellerItems.find((s) => s.id === row.id) : null;
  const refundItem = row.type === "refund" ? returnRefundData.find((r) => r.id === row.id) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full sm:max-w-lg overflow-y-auto" style={{ borderRadius: "1.5rem 1.5rem 0 0", maxHeight: "92vh", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div className="flex items-center gap-3 px-5 py-4 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", zIndex: 10 }}>
          <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#f3f4f6", border: "none", cursor: "pointer", color: "#374151", fontSize: "0.8rem", fontWeight: 600 }}>
            <ArrowLeft className="w-4 h-4" /> {lang === "id" ? "Kembali" : "Back"}
          </button>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1a1d2e" }}>{lang === "id" ? "Detail Transaksi" : "Transaction Detail"}</h3>
            <p style={{ fontSize: "0.72rem", color: "#6b7280" }}>{row.id}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X className="w-4 h-4" style={{ color: "#6b7280" }} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Type badge + value */}
          <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: tc.bg, border: `1px solid ${tc.color}40` }}>
            <div>
              <p style={{ fontSize: "0.7rem", color: tc.color, fontWeight: 700, marginBottom: 4 }}>{row.typeLabel}</p>
              <p style={{ fontSize: "1.1rem", fontWeight: 900, color: tc.color }}>{formatRupiah(row.value)}</p>
            </div>
            <StatusBadge status={row.status} />
          </div>

          {/* Common fields */}
          <div className="grid grid-cols-2 gap-2">
            {[
              ["ID Transaksi", row.id],
              [lang === "id" ? "Tanggal" : "Date", row.date],
              ["Customer", row.customer],
              [lang === "id" ? "Nama Barang" : "Item", row.item],
              ...(row.paymentMethod ? [[lang === "id" ? "Metode Bayar" : "Payment", row.paymentMethod]] : []),
              ...(row.notes ? [["Catatan / Notes", row.notes]] : []),
            ].map(([label, val]) => (
              <div key={label as string} className="rounded-lg px-3 py-2.5" style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)" }}>
                <p style={{ fontSize: "0.65rem", color: "#9ca3af", fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: "0.82rem", color: "#1a1d2e", fontWeight: 600, marginTop: 2 }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Item photos */}
          {(buyerOrder?.itemPhotos?.length ?? 0) > 0 && (
            <div className="space-y-2">
              <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Foto Item</p>
              <div className="flex gap-2 flex-wrap">
                {buyerOrder!.itemPhotos.map((ph, i) => (
                  <img key={i} src={ph} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }} />
                ))}
              </div>
            </div>
          )}
          {(sellerItem?.itemPhotos?.length ?? 0) > 0 && (
            <div className="space-y-2">
              <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Foto Item</p>
              <div className="flex gap-2 flex-wrap">
                {sellerItem!.itemPhotos.map((ph, i) => (
                  <img key={i} src={ph} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }} />
                ))}
              </div>
            </div>
          )}
          {(refundItem?.photos?.length ?? 0) > 0 && (
            <div className="space-y-2">
              <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Foto Bukti Return</p>
              <div className="flex gap-2 flex-wrap">
                {refundItem!.photos.map((ph, i) => (
                  <img key={i} src={ph} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }} />
                ))}
              </div>
            </div>
          )}

          {/* Buyer-specific detail */}
          {buyerOrder && (
            <div className="space-y-2">
              <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>{lang === "id" ? "Detail Pengiriman" : "Shipping Detail"}</p>
              <div className="rounded-xl p-3 space-y-2" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <div className="flex gap-2 items-start"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#2563eb" }} /><p style={{ fontSize: "0.82rem", color: "#1e40af" }}>{buyerOrder.address}, {buyerOrder.city}</p></div>
                <div className="flex gap-2 items-center"><Truck className="w-4 h-4 flex-shrink-0" style={{ color: "#2563eb" }} /><p style={{ fontSize: "0.82rem", color: "#1e40af" }}>{buyerOrder.shippingService} — No. Resi: {buyerOrder.tracking || "–"}</p></div>
                <div className="flex gap-2 items-center"><Hash className="w-4 h-4 flex-shrink-0" style={{ color: "#2563eb" }} /><p style={{ fontSize: "0.82rem", color: "#1e40af" }}>Size: {buyerOrder.size} · Qty: {buyerOrder.quantity}</p></div>
              </div>
            </div>
          )}

          {/* Seller-specific detail */}
          {sellerItem && (
            <div className="space-y-2">
              <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>{lang === "id" ? "Detail Barang Masuk" : "Stock In Detail"}</p>
              <div className="rounded-xl p-3 space-y-2" style={{ background: "#faf5ff", border: "1px solid #ddd6fe" }}>
                <div className="flex gap-2 items-center"><Tag className="w-4 h-4 flex-shrink-0" style={{ color: "#7c3aed" }} /><p style={{ fontSize: "0.82rem", color: "#6d28d9" }}>Jenis: {sellerItem.itemType} · Ukuran: {sellerItem.size}</p></div>
                <div className="flex gap-2 items-center"><Package className="w-4 h-4 flex-shrink-0" style={{ color: "#7c3aed" }} /><p style={{ fontSize: "0.82rem", color: "#6d28d9" }}>Qty: {sellerItem.quantity} · Cair: {sellerItem.disbursed ? "✓ Ya" : "✗ Belum"}</p></div>
                {sellerItem.notes && <p style={{ fontSize: "0.78rem", color: "#8b5cf6" }}>{sellerItem.notes}</p>}
              </div>
            </div>
          )}

          {/* Refund-specific detail */}
          {refundItem && (
            <div className="space-y-2">
              <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>{lang === "id" ? "Detail Return & Refund" : "Return & Refund Detail"}</p>
              <div className="rounded-xl p-3 space-y-2" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <p style={{ fontSize: "0.82rem", color: "#dc2626", fontWeight: 600 }}>{refundItem.reason}</p>
                <p style={{ fontSize: "0.78rem", color: "#374151", lineHeight: 1.6 }}>{refundItem.description}</p>
                <p style={{ fontSize: "0.72rem", color: "#9ca3af" }}>Order: {refundItem.orderId}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function HistoryTab({ lang, onBack }: { lang: Lang; onBack?: () => void }) {
  const [filter, setFilter] = useState<TxType>("all");
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Build unified transaction list
  const allTransactions: Transaction[] = useMemo(() => {
    const buyerTx: Transaction[] = buyerOrders.map((o) => ({
      id: o.id, date: o.orderDate, customer: o.customerName, item: o.itemName,
      value: o.totalPrice, type: "buyer" as TxType,
      typeLabel: lang === "id" ? "Pembelian Customer" : "Customer Purchase",
      status: o.shippingStatus, paymentMethod: o.paymentMethod, notes: o.notes,
    }));

    const sellerTx: Transaction[] = sellerItems.map((s) => ({
      id: s.id, date: s.submitDate, customer: s.customerName, item: s.itemName,
      value: s.sellingPrice * s.quantity, type: "seller" as TxType,
      typeLabel: lang === "id" ? "Barang Masuk Seller" : "Seller Stock In",
      status: s.disbursed ? (lang === "id" ? "Sudah Cair" : "Disbursed") : (lang === "id" ? "Belum Cair" : "Pending"),
    }));

    const refundTx: Transaction[] = returnRefundData.map((r) => ({
      id: r.id, date: r.submittedAt, customer: r.customerName, item: r.itemName,
      value: r.totalPrice, type: "refund" as TxType,
      typeLabel: lang === "id" ? "Return & Refund" : "Return & Refund",
      status: r.status,
    }));

    return [...buyerTx, ...sellerTx, ...refundTx].sort((a, b) => b.date.localeCompare(a.date));
  }, [lang]);

  const filtered = allTransactions.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false;
    if (search && !t.customer.toLowerCase().includes(search.toLowerCase()) &&
        !t.item.toLowerCase().includes(search.toLowerCase()) &&
        !t.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const buyerCount = allTransactions.filter((t) => t.type === "buyer").length;
  const sellerCount = allTransactions.filter((t) => t.type === "seller").length;
  const refundCount = allTransactions.filter((t) => t.type === "refund").length;
  const totalBuyerValue = allTransactions.filter((t) => t.type === "buyer").reduce((a, t) => a + t.value, 0);
  const totalSellerValue = allTransactions.filter((t) => t.type === "seller").reduce((a, t) => a + t.value, 0);
  const totalRefundValue = allTransactions.filter((t) => t.type === "refund").reduce((a, t) => a + t.value, 0);

  const TYPE_CONFIG: Record<TxType, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
    all: { label: lang === "id" ? "Semua" : "All", bg: "#f3f4f6", color: "#374151", icon: null },
    buyer: { label: lang === "id" ? "Pembelian" : "Purchases", bg: "#dbeafe", color: "#2563eb", icon: <ShoppingCart className="w-3 h-3" /> },
    seller: { label: lang === "id" ? "Barang Masuk" : "Stock In", bg: "#ede9fe", color: "#7c3aed", icon: <Store className="w-3 h-3" /> },
    refund: { label: "Return & Refund", bg: "#fee2e2", color: "#dc2626", icon: <RefreshCw className="w-3 h-3" /> },
  };

  return (
    <div className="space-y-5">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: "#f3f4f6", border: "none", cursor: "pointer", color: "#374151", fontSize: "0.8rem", fontWeight: 600 }}>
          <ArrowLeft className="w-3.5 h-3.5" /> {lang === "id" ? "Kembali — Dashboard" : "Back — Dashboard"}
        </button>
      )}

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1d2e" }}>
            {lang === "id" ? "Riwayat Transaksi" : "Transaction History"}
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: 2 }}>
            {lang === "id" ? "Semua riwayat transaksi buyer, seller, dan refund" : "All buyer, seller, and refund transaction history"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportHistoryCSV(filtered)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
            style={{ background: "#f3f4f6", color: "#374151", fontSize: "0.78rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={() => exportHistoryXLS(filtered)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
            style={{ background: "#166534", color: "#fff", fontSize: "0.78rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
            <Download className="w-3.5 h-3.5" /> Excel (.xls)
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        <div className="rounded-xl p-4" style={{ background: "#dbeafe", border: "1px solid #93c5fd" }}>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-4 h-4" style={{ color: "#2563eb" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1e40af" }}>{lang === "id" ? "Pembelian Customer" : "Customer Purchases"}</span>
          </div>
          <p style={{ fontSize: "1rem", fontWeight: 800, color: "#1e40af" }}>{formatRupiah(totalBuyerValue)}</p>
          <p style={{ fontSize: "0.72rem", color: "#3b82f6" }}>{buyerCount} {lang === "id" ? "transaksi" : "transactions"}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#ede9fe", border: "1px solid #c4b5fd" }}>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4" style={{ color: "#7c3aed" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6d28d9" }}>{lang === "id" ? "Barang Masuk" : "Stock In"}</span>
          </div>
          <p style={{ fontSize: "1rem", fontWeight: 800, color: "#6d28d9" }}>{formatRupiah(totalSellerValue)}</p>
          <p style={{ fontSize: "0.72rem", color: "#8b5cf6" }}>{sellerCount} {lang === "id" ? "transaksi" : "transactions"}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}>
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="w-4 h-4" style={{ color: "#dc2626" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#b91c1c" }}>Return & Refund</span>
          </div>
          <p style={{ fontSize: "1rem", fontWeight: 800, color: "#b91c1c" }}>{formatRupiah(totalRefundValue)}</p>
          <p style={{ fontSize: "0.72rem", color: "#ef4444" }}>{refundCount} {lang === "id" ? "kasus" : "cases"}</p>
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          {(["all", "buyer", "seller", "refund"] as TxType[]).map((t) => {
            const cfg = TYPE_CONFIG[t];
            return (
              <button key={t} onClick={() => setFilter(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: filter === t ? (t === "all" ? "#1e2a4a" : cfg.bg) : "#f3f4f6", color: filter === t ? (t === "all" ? "#fff" : cfg.color) : "#374151", fontSize: "0.75rem", fontWeight: 600, border: `1.5px solid ${filter === t && t !== "all" ? cfg.color + "60" : "transparent"}`, cursor: "pointer" }}>
                {cfg.icon} {cfg.label}
              </button>
            );
          })}
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === "id" ? "Cari customer, barang, ID..." : "Search customer, item, ID..."}
          className="rounded-lg px-3 py-2 outline-none flex-1"
          style={{ border: "1.5px solid #e5e7eb", fontSize: "0.85rem", background: "#fff", color: "#1a1d2e", minWidth: 200 }}
          onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
        <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>{filtered.length} {lang === "id" ? "hasil" : "results"}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="admin-table-wrapper">
          <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["ID", lang === "id" ? "Tanggal" : "Date", "Customer", lang === "id" ? "Nama Barang" : "Item", lang === "id" ? "Nilai" : "Value", lang === "id" ? "Tipe" : "Type", lang === "id" ? "Metode" : "Method", "Status", lang === "id" ? "Aksi" : "Action"].map((h, hi) => (
                  <th key={h} className={hi === 8 ? "sticky-col" : ""} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.68rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(0,0,0,0.06)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const cfg = TYPE_CONFIG[row.type];
                return (
                  <tr key={row.id}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f9fafb")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}>
                    <td style={{ padding: "11px 14px", fontSize: "0.72rem", color: "#6b7280", fontFamily: "monospace", whiteSpace: "nowrap" }}>{row.id}</td>
                    <td style={{ padding: "11px 14px", fontSize: "0.75rem", color: "#6b7280", whiteSpace: "nowrap" }}>{row.date}</td>
                    <td style={{ padding: "11px 14px", fontSize: "0.85rem", color: "#1a1d2e", fontWeight: 600, whiteSpace: "nowrap" }}>{row.customer}</td>
                    <td style={{ padding: "11px 14px", fontSize: "0.82rem", color: "#374151", maxWidth: 180 }}>
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{row.item}</span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: "0.85rem", fontWeight: 700, whiteSpace: "nowrap",
                      color: row.type === "buyer" ? "#16a34a" : row.type === "seller" ? "#7c3aed" : "#dc2626" }}>
                      {formatRupiah(row.value)}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full w-fit" style={{ background: cfg.bg, color: cfg.color, fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: "0.75rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                      {row.paymentMethod || "–"}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="sticky-col" style={{ padding: "11px 14px" }}>
                      <button onClick={() => setSelectedTx(row)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                        style={{ background: "#eff6ff", color: "#2563eb", fontSize: "0.72rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
                        Detail <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
              {lang === "id" ? "Tidak ada data transaksi" : "No transaction data found"}
            </p>
          </div>
        )}
      </div>

      {selectedTx && <TransactionDetailModal row={selectedTx} lang={lang} onClose={() => setSelectedTx(null)} />}
    </div>
  );
}
