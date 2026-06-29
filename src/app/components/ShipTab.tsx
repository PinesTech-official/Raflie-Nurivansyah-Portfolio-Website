import { useState } from "react";
import { buyerOrders, BuyerOrder } from "./data";
import { StatusBadge, formatRupiah } from "./DashboardTab";
import { Lang, tr } from "./i18n";
import {
  Package,
  Truck,
  Download,
  ChevronRight,
  ArrowLeft,
  X,
  MapPin,
  Hash,
  Clock,
  Info,
} from "lucide-react";

// Estimate delivery days based on city distance from Jakarta (toko)
function estimateDelivery(city: string, service: string, lang: Lang): { days: string; eta: string } {
  const distanceMap: Record<string, number> = {
    "Jakarta Selatan": 1,
    "Jakarta Pusat": 1,
    "Jakarta Barat": 1,
    "Jakarta Utara": 1,
    "Jakarta Timur": 1,
    Bekasi: 2,
    Depok: 2,
    Tangerang: 2,
    Bogor: 2,
    Bandung: 2,
    Semarang: 3,
    Yogyakarta: 3,
    Surabaya: 4,
    Medan: 5,
    Makassar: 5,
    Bali: 4,
  };
  const baseDays = distanceMap[city] ?? 3;
  const serviceMult: Record<string, number> = {
    "JNE YES": 1,
    "SiCepat BEST": 1,
    "JNE REG": 1.5,
    "SiCepat REG": 1.5,
    "J&T Express": 1.5,
    "Pos Indonesia": 2,
    "JNE OKE": 2,
  };
  const mult = Object.entries(serviceMult).find(([k]) => service.includes(k.split(" ")[0]))?.at(1) as number ?? 1.5;
  const finalDays = Math.round(baseDays * mult);
  const today = new Date(2024, 5, 12);
  today.setDate(today.getDate() + finalDays);
  const eta = today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return { days: `${finalDays} ${tr("workingDays", lang)}`, eta };
}

function ShipDetailModal({ order, onClose, lang }: { order: BuyerOrder; onClose: () => void; lang: Lang }) {
  const shippingSteps = ["Menunggu", "Diproses", "Dikirim", "Tiba", "Selesai"];
  const currentStep = shippingSteps.indexOf(order.shippingStatus);
  const { days, eta } = estimateDelivery(order.city, order.shippingService, lang);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4 sticky top-0 bg-white"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", zIndex: 10 }}
        >
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: "#f3f4f6", border: "none", cursor: "pointer", color: "#374151", fontSize: "0.82rem", fontWeight: 600 }}
          >
            <ArrowLeft className="w-4 h-4" /> {tr("back", lang)}
          </button>
          <div className="flex-1">
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1d2e" }}>
              {tr("shipDetail", lang)} — {order.id}
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{order.customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2"
            style={{ background: "#f3f4f6", border: "none", cursor: "pointer" }}
          >
            <X className="w-4 h-4" style={{ color: "#6b7280" }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Tracking Progress */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-4 h-4" style={{ color: "#2563eb" }} />
              <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                {tr("trackingSection", lang)}
              </h4>
            </div>
            <div className="flex items-center mb-4">
              {shippingSteps.map((step, i) => {
                const isCompleted = i <= currentStep;
                const isActive = i === currentStep;
                return (
                  <div key={step} className="flex items-center" style={{ flex: i < shippingSteps.length - 1 ? 1 : "none" }}>
                    <div className="flex flex-col items-center">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{
                          background: isCompleted ? "#2563eb" : "#e5e7eb",
                          border: isActive ? "3px solid #93c5fd" : "none",
                        }}
                      >
                        {isCompleted && <div className="w-3 h-3 rounded-full bg-white" />}
                      </div>
                      <p
                        style={{
                          fontSize: "0.62rem",
                          color: isCompleted ? "#2563eb" : "#9ca3af",
                          marginTop: "0.35rem",
                          fontWeight: isActive ? 700 : 400,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {step}
                      </p>
                    </div>
                    {i < shippingSteps.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: 2,
                          background: i < currentStep ? "#2563eb" : "#e5e7eb",
                          margin: "0 4px",
                          marginTop: -14,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={order.shippingStatus} />
              <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>{tr("currentStatus", lang)}</span>
            </div>
          </section>

          {/* Resi & Service */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4" style={{ color: "#2563eb" }} />
              <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                {tr("resiService", lang)}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                <p style={{ fontSize: "0.68rem", color: "#9ca3af", fontWeight: 500 }}>{tr("courier", lang)}</p>
                <p style={{ fontSize: "0.9rem", color: "#1a1d2e", fontWeight: 700, marginTop: "0.2rem" }}>
                  {order.shippingService}
                </p>
              </div>
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                <p style={{ fontSize: "0.68rem", color: "#9ca3af", fontWeight: 500 }}>{tr("resiNo", lang)}</p>
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: order.tracking !== "-" ? "#2563eb" : "#9ca3af",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    marginTop: "0.2rem",
                    wordBreak: "break-all",
                  }}
                >
                  {order.tracking !== "-" ? order.tracking : tr("noResi", lang)}
                </p>
              </div>
            </div>
          </section>

          {/* ETA */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" style={{ color: "#2563eb" }} />
              <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                {tr("etaSection", lang)}
              </h4>
            </div>
            <div
              className="rounded-xl p-4"
              style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#2563eb" }} />
                <div>
                  <p style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                    {lang === "id" ? "Tujuan pengiriman:" : "Shipping destination:"}
                  </p>
                  <p style={{ fontSize: "0.88rem", color: "#1a1d2e", fontWeight: 600 }}>
                    {order.address}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div>
                      <p style={{ fontSize: "0.68rem", color: "#9ca3af" }}>{tr("etaTime", lang)}</p>
                      <p style={{ fontSize: "0.95rem", color: "#2563eb", fontWeight: 700 }}>{days}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.68rem", color: "#9ca3af" }}>{tr("etaArrival", lang)}</p>
                      <p style={{ fontSize: "0.9rem", color: "#1e40af", fontWeight: 700 }}>{eta}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Item Detail */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4" style={{ color: "#2563eb" }} />
              <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>{tr("itemDetail", lang)}</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: tr("itemName", lang),  value: order.itemName },
                { label: tr("type", lang),       value: order.itemType },
                { label: tr("size", lang),       value: order.size },
                { label: tr("qty", lang),        value: `${order.quantity} pcs` },
                { label: tr("totalValue", lang), value: formatRupiah(order.totalPrice) },
              ].map((d) => (
                <div
                  key={d.label}
                  className="rounded-lg px-4 py-3"
                  style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <p style={{ fontSize: "0.68rem", color: "#9ca3af", fontWeight: 500 }}>{d.label}</p>
                  <p style={{ fontSize: "0.88rem", color: "#1a1d2e", fontWeight: 600, marginTop: "0.2rem" }}>
                    {d.value}
                  </p>
                </div>
              ))}
            </div>
            {order.itemPhotos.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-3">
                {order.itemPhotos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`${order.itemName} ${i + 1}`}
                    className="rounded-xl object-cover"
                    style={{ width: 100, height: 100, border: "1px solid rgba(0,0,0,0.08)" }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function exportToExcel(orders: BuyerOrder[]) {
  // Build proper Excel-compatible HTML table saved as .xls
  const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  const rows = orders.map((o) => `
    <tr>
      <td>${o.id}</td>
      <td>${o.customerName}</td>
      <td>${o.address}</td>
      <td>${o.city}</td>
      <td>${o.itemName}</td>
      <td>${o.itemType}</td>
      <td>${o.size}</td>
      <td>${o.quantity}</td>
      <td>${o.shippingService}</td>
      <td>${o.tracking !== "-" ? o.tracking : "Belum ada resi"}</td>
      <td>${o.shippingStatus}</td>
      <td>${fmt(o.totalPrice)}</td>
      <td>${o.orderDate}</td>
    </tr>`).join("");

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><meta name=ProgId content=Excel.Sheet><meta name=Generator content="Microsoft Excel 11">
<style>
  table { border-collapse: collapse; }
  th { background-color: #1e2a4a; color: white; font-weight: bold; padding: 6px 10px; border: 1px solid #ccc; }
  td { padding: 5px 10px; border: 1px solid #ccc; }
  tr:nth-child(even) td { background-color: #f4f6fb; }
</style>
</head><body>
<h2 style="font-family:Arial;color:#1e2a4a;">Product to Ship</h2>
<p style="font-family:Arial;color:#6b7280;">Tanggal export: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
<table>
  <thead><tr>
    <th>No. Order</th><th>Nama Customer</th><th>Alamat Lengkap</th><th>Kota</th>
    <th>Nama Barang</th><th>Jenis</th><th>Ukuran</th><th>Qty</th>
    <th>Jasa Kirim</th><th>No. Resi</th><th>Status</th><th>Nilai</th><th>Tgl Order</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
</body></html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export_ship_${new Date().toISOString().split("T")[0]}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

const toShipOrders = buyerOrders.filter((o) => ["Menunggu", "Diproses"].includes(o.shippingStatus));
const shippedOrders = buyerOrders.filter((o) => ["Dikirim", "Tiba", "Selesai"].includes(o.shippingStatus));

export function ShipTab({ lang, onBack }: { lang: Lang; onBack?: () => void }) {
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrder | null>(null);

  const TABLE_COLS = [
    "No. Order",
    tr("customer", lang),
    tr("address", lang),
    tr("itemName", lang),
    tr("type", lang),
    tr("size", lang),
    tr("qty", lang),
    tr("courier", lang),
    tr("resiNo", lang),
    tr("status", lang),
    tr("showDetails", lang),
  ];

  const renderRow = (order: BuyerOrder, i: number, total: number, highlight = false) => (
    <tr
      key={order.id}
      style={{
        borderBottom: i < total - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = highlight ? "#fffbeb" : "#f9fafb")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}
    >
      <td style={{ padding: "11px 14px", fontSize: "0.72rem", color: "#6b7280", fontFamily: "monospace", whiteSpace: "nowrap" }}>{order.id}</td>
      <td style={{ padding: "11px 14px", fontSize: "0.85rem", color: "#1a1d2e", fontWeight: 600, whiteSpace: "nowrap" }}>{order.customerName}</td>
      <td style={{ padding: "11px 14px", fontSize: "0.75rem", color: "#6b7280", maxWidth: 180 }}>
        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {order.address}
        </span>
      </td>
      <td style={{ padding: "11px 14px", fontSize: "0.85rem", color: "#374151", whiteSpace: "nowrap" }}>{order.itemName}</td>
      <td style={{ padding: "11px 14px" }}>
        <span className="px-2 py-0.5 rounded-full" style={{ background: "#e0e7ff", color: "#3730a3", fontSize: "0.68rem", fontWeight: 600 }}>
          {order.itemType}
        </span>
      </td>
      <td style={{ padding: "11px 14px", fontSize: "0.85rem", color: "#374151", fontFamily: "monospace" }}>{order.size}</td>
      <td style={{ padding: "11px 14px", fontSize: "0.85rem", color: "#374151", textAlign: "center" }}>{order.quantity}</td>
      <td style={{ padding: "11px 14px", fontSize: "0.8rem", color: "#374151", whiteSpace: "nowrap" }}>{order.shippingService}</td>
      <td style={{ padding: "11px 14px", fontSize: "0.72rem", fontFamily: "monospace", whiteSpace: "nowrap" }}>
        {order.tracking !== "-" ? (
          <span style={{ color: "#374151" }}>{order.tracking}</span>
        ) : (
          <span style={{ color: "#d97706" }}>{tr("noResiShort", lang)}</span>
        )}
      </td>
      <td style={{ padding: "11px 14px" }}>
        <StatusBadge status={order.shippingStatus} />
      </td>
      <td className="sticky-col" style={{ padding: "11px 14px" }}>
        <button
          onClick={() => setSelectedOrder(order)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
          style={{ background: "#dbeafe", color: "#2563eb", fontSize: "0.72rem", fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          {tr("showDetails", lang)} <ChevronRight className="w-3 h-3" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#f3f4f6", border: "none", cursor: "pointer", color: "#374151", fontSize: "0.8rem", fontWeight: 600 }}>
          <ArrowLeft className="w-3.5 h-3.5" /> {tr("back", lang)} — Dashboard
        </button>
      )}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1a1d2e" }}>{tr("productToShipTitle", lang)}</h2>
          <p style={{ color: "#6b7280", fontSize: "0.82rem", marginTop: "0.15rem" }}>
            {tr("shipSubtitle", lang)}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
            <Package className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#92400e" }}>{toShipOrders.length} {tr("needsShipping", lang)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#d1fae5", border: "1px solid #6ee7b7" }}>
            <Truck className="w-3.5 h-3.5" style={{ color: "#059669" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#065f46" }}>{shippedOrders.length} {tr("shipped", lang)}</span>
          </div>
          <button
            onClick={() => exportToExcel(buyerOrders)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg"
            style={{ background: "#166534", color: "#fff", fontSize: "0.8rem", fontWeight: 600, border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#14532d")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#166534")}
          >
            <Download className="w-3.5 h-3.5" />
            {tr("exportExcel", lang)}
          </button>
        </div>
      </div>

      {/* Pending to ship */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full" style={{ background: "#f59e0b" }} />
          <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a1d2e" }}>
            {tr("pendingSection", lang)}
          </h3>
        </div>
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ border: "1.5px solid #fde68a", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="admin-table-wrapper">
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
              <thead>
                <tr style={{ background: "#fffbeb" }}>
                  {TABLE_COLS.map((h, hi) => (
                    <th
                      key={h}
                      className={hi === TABLE_COLS.length - 1 ? "sticky-col" : ""}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        color: "#92400e",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        borderBottom: "1px solid #fde68a",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {toShipOrders.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ padding: "24px", textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
                      {tr("allShipped", lang)}
                    </td>
                  </tr>
                ) : (
                  toShipOrders.map((order, i) => renderRow(order, i, toShipOrders.length, true))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Shipped */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full" style={{ background: "#10b981" }} />
          <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a1d2e" }}>
            {tr("shippedSection", lang)}
          </h3>
        </div>
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <div className="admin-table-wrapper">
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {TABLE_COLS.map((h, hi) => (
                    <th
                      key={h}
                      className={hi === TABLE_COLS.length - 1 ? "sticky-col" : ""}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shippedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ padding: "24px", textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
                      {tr("noData", lang)}
                    </td>
                  </tr>
                ) : (
                  shippedOrders.map((order, i) => renderRow(order, i, shippedOrders.length, false))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        className="rounded-xl p-4 flex items-start gap-3"
        style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
      >
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#2563eb" }} />
        <p style={{ fontSize: "0.8rem", color: "#3b82f6" }}>
          {tr("exportNote", lang)}
        </p>
      </div>

      {selectedOrder && (
        <ShipDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} lang={lang} />
      )}
    </div>
  );
}
