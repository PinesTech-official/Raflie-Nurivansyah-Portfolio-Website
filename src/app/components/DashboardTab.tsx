import { useState, useMemo } from "react";
import { buyerOrders, sellerItems, allTransactionData } from "./data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Package, ShoppingCart, ArrowDownCircle, DollarSign, ChevronRight, ArrowUpRight, Download } from "lucide-react";
import { Lang, tr } from "./i18n";

type UserRole = "admin" | "buyer_admin" | "seller_admin" | "marketing_admin";
type RangeKey = "7d" | "14d" | "21d" | "28d" | "monthly" | "yearly" | "all";

interface DashboardTabProps {
  onNavigate?: (tab: "buyer" | "seller" | "history") => void;
  userRole: UserRole;
  lang: Lang;
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getRangeOptions(lang: Lang): { key: RangeKey; label: string }[] {
  return [
    { key: "7d",      label: tr("days7", lang) },
    { key: "14d",     label: tr("days14", lang) },
    { key: "21d",     label: tr("days21", lang) },
    { key: "28d",     label: tr("days28", lang) },
    { key: "monthly", label: tr("monthly", lang) },
    { key: "yearly",  label: tr("yearly", lang) },
    { key: "all",     label: tr("allTime", lang) },
  ];
}

function getFilteredData(range: RangeKey) {
  const data = allTransactionData;
  if (range === "7d") return data.slice(-7);
  if (range === "14d") return data.slice(-14);
  if (range === "21d") return data.slice(-21);
  if (range === "28d") return data;
  if (range === "monthly") {
    // Aggregate by month label
    const map: Record<string, { date: string; pembelian: number; penjualan: number; pembelianItems: number; penjualanItems: number }> = {};
    data.forEach((d) => {
      const key = d.rawDate.slice(0, 7);
      const label = new Date(d.rawDate).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      if (!map[key]) map[key] = { date: label, pembelian: 0, penjualan: 0, pembelianItems: 0, penjualanItems: 0 };
      map[key].pembelian += d.pembelian;
      map[key].penjualan += d.penjualan;
      map[key].pembelianItems += d.pembelianItems;
      map[key].penjualanItems += d.penjualanItems;
    });
    return Object.values(map);
  }
  if (range === "yearly") {
    const map: Record<string, { date: string; pembelian: number; penjualan: number; pembelianItems: number; penjualanItems: number }> = {};
    data.forEach((d) => {
      const key = d.rawDate.slice(0, 4);
      if (!map[key]) map[key] = { date: key, pembelian: 0, penjualan: 0, pembelianItems: 0, penjualanItems: 0 };
      map[key].pembelian += d.pembelian;
      map[key].penjualan += d.penjualan;
      map[key].pembelianItems += d.pembelianItems;
      map[key].penjualanItems += d.penjualanItems;
    });
    return Object.values(map);
  }
  // all
  return data;
}

const CustomTooltip = ({ active, payload, label, payload: payloadProp }: any) => {
  if (active && payloadProp && payloadProp.length) {
    // Try to get fullDate from the data entry if available
    const fullDate = payloadProp[0]?.payload?.fullDate;
    return (
      <div
        className="rounded-xl p-3"
        style={{ background: "#1a1d2e", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", minWidth: 180 }}
      >
        <p style={{ color: "#94a3b8", fontSize: "0.72rem", marginBottom: fullDate ? "0.15rem" : "0.5rem" }}>{label}</p>
        {fullDate && (
          <p style={{ color: "#64748b", fontSize: "0.68rem", marginBottom: "0.5rem" }}>{fullDate}</p>
        )}
        {payloadProp.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color, fontSize: "0.78rem", fontWeight: 600 }}>
            {entry.name}: {formatRupiah(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Menunggu: { bg: "#fef3c7", color: "#d97706" },
    Diproses: { bg: "#dbeafe", color: "#2563eb" },
    Dikirim: { bg: "#ede9fe", color: "#7c3aed" },
    Tiba: { bg: "#d1fae5", color: "#059669" },
    Selesai: { bg: "#f0fdf4", color: "#16a34a" },
    "Sudah Cair": { bg: "#d1fae5", color: "#059669" },
    Disbursed: { bg: "#d1fae5", color: "#059669" },
    "Belum Cair": { bg: "#fef3c7", color: "#d97706" },
    Pending: { bg: "#fef3c7", color: "#d97706" },
  };
  const style = map[status] || { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span
      className="px-2 py-1 rounded-full"
      style={{ background: style.bg, color: style.color, fontSize: "0.7rem", fontWeight: 600 }}
    >
      {status}
    </span>
  );
}

export function DashboardTab({ onNavigate, userRole, lang }: DashboardTabProps) {
  const [range, setRange] = useState<RangeKey>("28d");

  const rangeOptions = useMemo(() => getRangeOptions(lang), [lang]);
  const chartData = useMemo(() => getFilteredData(range), [range]);

  const totalSalesValue = buyerOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalSalesItems = buyerOrders.reduce((acc, o) => acc + o.quantity, 0);
  const totalPurchaseValue = sellerItems.reduce((acc, s) => acc + s.sellingPrice * s.quantity, 0);
  const totalPurchaseItems = sellerItems.reduce((acc, s) => acc + s.quantity, 0);

  // Aggregated totals for current range
  const rangeData = chartData;
  const rangeSalesValue = rangeData.reduce((a, d) => a + d.pembelian, 0);
  const rangeSalesItems = rangeData.reduce((a, d) => a + d.pembelianItems, 0);
  const rangePurchaseValue = rangeData.reduce((a, d) => a + d.penjualan, 0);
  const rangePurchaseItems = rangeData.reduce((a, d) => a + d.penjualanItems, 0);

  const canSeeSales = userRole === "admin" || userRole === "buyer_admin";
  const canSeePurchase = userRole === "admin" || userRole === "seller_admin";

  // Table column headers
  const TABLE_COLS = ["ID", tr("customer", lang), "Item", tr("totalValue", lang), tr("type", lang), tr("status", lang), tr("orderDate", lang)];

  // Combined recent transactions (buyer + seller)
  const recentBuyer = buyerOrders.slice(0, 5).map((o) => ({
    id: o.id, customer: o.customerName, item: o.itemName,
    value: o.totalPrice, type: lang === "id" ? "Penjualan" : "Sales",
    status: o.shippingStatus, date: o.orderDate, txType: "buyer" as const,
  }));
  const recentSeller = sellerItems.slice(0, 3).map((s) => ({
    id: s.id, customer: s.customerName, item: s.itemName,
    value: s.sellingPrice * s.quantity, type: lang === "id" ? "Pembelian Barang" : "Stock In",
    status: s.disbursed ? (lang === "id" ? "Sudah Cair" : "Disbursed") : (lang === "id" ? "Belum Cair" : "Pending"),
    date: s.submitDate, txType: "seller" as const,
  }));
  const allRecent = [...recentBuyer, ...recentSeller]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  const exportTransactionHistory = () => {
    const headers = ["ID", "Customer", "Item", "Nilai", "Tipe", "Status", "Tanggal"];
    const rows = allRecent.map((r) => [r.id, r.customer, `"${r.item}"`, r.value, r.type, r.status, r.date]);
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `export_transaksi_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1a1d2e" }}>{tr("dashboardOverview", lang)}</h2>
        <p style={{ color: "#6b7280", fontSize: "0.82rem", marginTop: "0.15rem" }}>
          {tr("shopSummary", lang)}
        </p>
      </div>

      {/* Stats Grid */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}
      >
        {/* Total Penjualan Nilai */}
        <div
          className="bg-white rounded-xl p-5 flex flex-col gap-3"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#6b7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {tr("totalSalesValue", lang)}
              </p>
              <p
                className="mt-1"
                style={{ fontSize: "1.35rem", fontWeight: 800, color: "#16a34a", lineHeight: 1.2 }}
              >
                {formatRupiah(totalSalesValue)}
              </p>
            </div>
            <div className="rounded-xl p-2.5" style={{ background: "#dcfce7" }}>
              <DollarSign className="w-5 h-5" style={{ color: "#16a34a" }} />
            </div>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#6b7280" }}>
            {lang === "id"
              ? `Dari ${buyerOrders.length} ${tr("fromTransactions", lang)}`
              : `From ${buyerOrders.length} ${tr("fromTransactions", lang)}`}
          </p>
          {canSeeSales && (
            <button
              onClick={() => onNavigate?.("buyer")}
              className="flex items-center gap-1 self-start px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "#dcfce7",
                color: "#16a34a",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              {tr("showDetail", lang)} <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Total Penjualan Items */}
        <div
          className="bg-white rounded-xl p-5 flex flex-col gap-3"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#6b7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {tr("totalSalesItems", lang)}
              </p>
              <p
                className="mt-1"
                style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1a1d2e", lineHeight: 1.2 }}
              >
                {totalSalesItems} Item
              </p>
            </div>
            <div className="rounded-xl p-2.5" style={{ background: "#dbeafe" }}>
              <ShoppingCart className="w-5 h-5" style={{ color: "#2563eb" }} />
            </div>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#6b7280" }}>
            {tr("soldToCustomer", lang)}
          </p>
          {canSeeSales && (
            <button
              onClick={() => onNavigate?.("buyer")}
              className="flex items-center gap-1 self-start px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "#dbeafe",
                color: "#2563eb",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              {tr("showDetail", lang)} <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Barang Masuk Nilai */}
        <div
          className="bg-white rounded-xl p-5 flex flex-col gap-3"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#6b7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {tr("stockInValue", lang)}
              </p>
              <p
                className="mt-1"
                style={{ fontSize: "1.35rem", fontWeight: 800, color: "#dc2626", lineHeight: 1.2 }}
              >
                {formatRupiah(totalPurchaseValue)}
              </p>
            </div>
            <div className="rounded-xl p-2.5" style={{ background: "#fee2e2" }}>
              <ArrowDownCircle className="w-5 h-5" style={{ color: "#dc2626" }} />
            </div>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#6b7280" }}>
            {lang === "id"
              ? `Dari ${sellerItems.length} ${tr("fromSellers", lang)}`
              : `From ${sellerItems.length} ${tr("fromSellers", lang)}`}
          </p>
          {canSeePurchase && (
            <button
              onClick={() => onNavigate?.("seller")}
              className="flex items-center gap-1 self-start px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              {tr("showDetail", lang)} <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Barang Masuk Items */}
        <div
          className="bg-white rounded-xl p-5 flex flex-col gap-3"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#6b7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {tr("stockInItems", lang)}
              </p>
              <p
                className="mt-1"
                style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1a1d2e", lineHeight: 1.2 }}
              >
                {totalPurchaseItems} Item
              </p>
            </div>
            <div className="rounded-xl p-2.5" style={{ background: "#fef3c7" }}>
              <Package className="w-5 h-5" style={{ color: "#d97706" }} />
            </div>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#6b7280" }}>
            {tr("receivedFromSeller", lang)}
          </p>
          {canSeePurchase && (
            <button
              onClick={() => onNavigate?.("seller")}
              className="flex items-center gap-1 self-start px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: "#fef3c7",
                color: "#d97706",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              {tr("showDetail", lang)} <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div
        className="bg-white rounded-xl p-6"
        style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1d2e" }}>
              {tr("transactionEval", lang)}
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.78rem", marginTop: "0.15rem" }}>
              {tr("customerPurchase", lang)}
            </p>
          </div>
          {/* Range selector */}
          <div className="flex flex-wrap gap-1.5">
            {rangeOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setRange(opt.key)}
                className="px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: range === opt.key ? "#2563eb" : "#f3f4f6",
                  color: range === opt.key ? "#fff" : "#6b7280",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Range summary */}
        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#2563eb" }} />
            <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
              {tr("buyerPurchase", lang)}:{" "}
              <strong style={{ color: "#2563eb" }}>
                {formatRupiah(rangeSalesValue)} · {rangeSalesItems} item
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#10b981" }} />
            <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
              {tr("sellerSubmission", lang)}:{" "}
              <strong style={{ color: "#10b981" }}>
                {formatRupiah(rangePurchaseValue)} · {rangePurchaseItems} item
              </strong>
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={270}>
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPembelian" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPenjualan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="pembelian"
              name={tr("buyerPurchase", lang)}
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#colorPembelian)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="penjualan"
              name={tr("sellerSubmission", lang)}
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorPenjualan)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent transactions table */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1a1d2e" }}>
              {tr("recentTransactions", lang)}
            </h3>
            <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>—</span>
            <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>
              {lang === "id" ? "Buyer & Seller" : "Buyer & Seller"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportTransactionHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: "#166534", color: "#fff", fontSize: "0.75rem", fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              <Download className="w-3 h-3" /> Export CSV
            </button>
            {canSeeSales && (
              <button
                onClick={() => onNavigate?.("history")}
                className="flex items-center gap-1"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontSize: "0.78rem", fontWeight: 600 }}
              >
                {tr("viewAll", lang)} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {TABLE_COLS.map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.68rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid rgba(0,0,0,0.06)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allRecent.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: i < allRecent.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f9fafb")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}>
                  <td style={{ padding: "11px 14px", fontSize: "0.72rem", color: "#6b7280", fontFamily: "monospace", whiteSpace: "nowrap" }}>{row.id}</td>
                  <td style={{ padding: "11px 14px", fontSize: "0.82rem", color: "#1a1d2e", fontWeight: 600, whiteSpace: "nowrap" }}>{row.customer}</td>
                  <td style={{ padding: "11px 14px", fontSize: "0.82rem", color: "#374151" }}>{row.item}</td>
                  <td style={{ padding: "11px 14px", fontSize: "0.82rem", color: row.txType === "buyer" ? "#16a34a" : "#dc2626", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {formatRupiah(row.value)}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <span className="px-2 py-0.5 rounded-full" style={{ background: row.txType === "buyer" ? "#dbeafe" : "#ede9fe", color: row.txType === "buyer" ? "#1d4ed8" : "#7c3aed", fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {row.type}
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <StatusBadge status={row.status} />
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: "0.72rem", color: "#6b7280", whiteSpace: "nowrap" }}>{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
