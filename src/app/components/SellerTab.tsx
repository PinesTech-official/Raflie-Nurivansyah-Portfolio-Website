import { useState } from "react";
import { sellerItems, SellerItem } from "./data";
import { formatRupiah } from "./DashboardTab";
import { Lang, tr } from "./i18n";
import { CheckSquare, Square, CheckCircle2, ChevronRight, ArrowLeft, X, Package, MapPin, User, FileText, Image } from "lucide-react";

function SellerDetailModal({ item, onClose, lang }: { item: SellerItem; onClose: () => void; lang: Lang }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full sm:max-w-2xl overflow-y-auto" style={{ borderRadius: "1.5rem 1.5rem 0 0", maxHeight: "92vh", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div className="flex items-center gap-3 px-5 py-4 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", zIndex: 10 }}>
          <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#f3f4f6", border: "none", cursor: "pointer", color: "#374151", fontSize: "0.8rem", fontWeight: 600 }}>
            <ArrowLeft className="w-4 h-4" /> {tr("back", lang)}
          </button>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1a1d2e" }}>{tr("sellerDetail", lang)} — {item.id}</h3>
            <p style={{ fontSize: "0.72rem", color: "#6b7280" }}>{item.submitDate}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2" style={{ background: "#f3f4f6", border: "none", cursor: "pointer" }}>
            <X className="w-4 h-4" style={{ color: "#6b7280" }} />
          </button>
        </div>
        <div className="px-5 py-5 space-y-5">
          {/* Seller info */}
          <section>
            <div className="flex items-center gap-2 mb-2"><User className="w-4 h-4" style={{ color: "#8b5cf6" }} /><h4 style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{tr("sellerInfo", lang)}</h4></div>
            <div className="rounded-xl p-3 space-y-1.5" style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1a1d2e" }}>{item.customerName}</p>
              <div className="flex gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#9ca3af" }} /><p style={{ fontSize: "0.8rem", color: "#6b7280" }}>{item.address}</p></div>
            </div>
          </section>
          {/* Product detail */}
          <section>
            <div className="flex items-center gap-2 mb-2"><Package className="w-4 h-4" style={{ color: "#8b5cf6" }} /><h4 style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{tr("productDetail", lang)}</h4></div>
            <div className="grid grid-cols-2 gap-2">
              {[["Nama / Name", item.itemName], ["Jenis / Type", item.itemType], ["Ukuran / Size", item.size], ["Jumlah / Qty", `${item.quantity} pcs`], ["Harga/Item", formatRupiah(item.sellingPrice)], [tr("totalValue", lang), formatRupiah(item.sellingPrice * item.quantity)]].map(([label, val]) => (
                <div key={label} className="rounded-lg px-3 py-2.5" style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)" }}>
                  <p style={{ fontSize: "0.65rem", color: "#9ca3af", fontWeight: 500 }}>{label}</p>
                  <p style={{ fontSize: "0.85rem", color: "#1a1d2e", fontWeight: 600, marginTop: 2 }}>{val}</p>
                </div>
              ))}
            </div>
          </section>
          {/* Photos */}
          <section>
            <div className="flex items-center gap-2 mb-2"><Image className="w-4 h-4" style={{ color: "#8b5cf6" }} /><h4 style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{tr("productPhotos", lang)}</h4></div>
            {item.itemPhotos.length > 0
              ? <div className="flex gap-3 flex-wrap">{item.itemPhotos.map((p, i) => <img key={i} src={p} alt="" className="rounded-xl object-cover" style={{ width: 100, height: 100, border: "1px solid rgba(0,0,0,0.08)" }} />)}</div>
              : <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{tr("noItemPhotos", lang)}</p>}
          </section>
          {/* Condition notes */}
          {item.notes && (
            <section>
              <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4" style={{ color: "#8b5cf6" }} /><h4 style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{tr("itemCondNotes", lang)}</h4></div>
              <div className="rounded-xl px-3 py-2.5" style={{ background: "#faf5ff", border: "1px solid #ddd6fe" }}><p style={{ fontSize: "0.82rem", color: "#6d28d9" }}>{item.notes}</p></div>
            </section>
          )}
          {/* Disbursement */}
          <section>
            <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: item.disbursed ? "#f0fdf4" : "#fffbeb", border: `1px solid ${item.disbursed ? "#6ee7b7" : "#fde68a"}` }}>
              {item.disbursed ? <CheckCircle2 className="w-5 h-5" style={{ color: "#059669" }} /> : <Square className="w-5 h-5" style={{ color: "#d97706" }} />}
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: item.disbursed ? "#065f46" : "#92400e" }}>{tr("disbursementStatus", lang)}: {item.disbursed ? tr("disbursed", lang) : tr("notDisbursed", lang)}</p>
                <p style={{ fontSize: "0.72rem", color: item.disbursed ? "#059669" : "#d97706" }}>{item.disbursed ? tr("disbursedMsg", lang) : tr("pendingDisbursement", lang)}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function SellerTab({ lang, onBack }: { lang: Lang; onBack?: () => void }) {
  const [items, setItems] = useState(sellerItems);
  const [selectedItem, setSelectedItem] = useState<SellerItem | null>(null);
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (s) => s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.itemName.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDisbursed = (id: string) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, disbursed: !i.disbursed } : i));
  const disbursedCount = items.filter((i) => i.disbursed).length;
  const pendingCount = items.filter((i) => !i.disbursed).length;

  const COLS = [
    { key: "id", label: tr("orderID", lang), w: 90 },
    { key: "customer", label: tr("customer", lang), w: 130 },
    { key: "address", label: tr("address", lang), w: 160 },
    { key: "item", label: tr("itemName", lang), w: 130 },
    { key: "type", label: tr("type", lang), w: 80 },
    { key: "size", label: tr("size", lang), w: 70 },
    { key: "qty", label: tr("qty", lang), w: 50 },
    { key: "price", label: tr("priceToStore", lang), w: 110 },
    { key: "date", label: tr("submitDate", lang), w: 90 },
    { key: "disburse", label: tr("disbursement", lang), w: 110 },
    { key: "action", label: tr("action", lang), w: 80 },
  ];

  return (
    <div className="space-y-4">
      {/* Back button */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#f3f4f6", border: "none", cursor: "pointer", color: "#374151", fontSize: "0.8rem", fontWeight: 600 }}>
          <ArrowLeft className="w-3.5 h-3.5" /> {tr("back", lang)} — Dashboard
        </button>
      )}
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1d2e" }}>{tr("sellerManagement", lang)}</h2>
          <p style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: 2 }}>{tr("sellerSubtitle", lang)}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#d1fae5", border: "1px solid #6ee7b7" }}>
          <CheckCircle2 className="w-4 h-4" style={{ color: "#059669" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#065f46" }}>{tr("disbursed", lang)}: {disbursedCount}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
          <Square className="w-4 h-4" style={{ color: "#d97706" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#92400e" }}>{tr("notDisbursed", lang)}: {pendingCount}</span>
        </div>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr("search", lang)}
        className="rounded-lg px-3 py-2 outline-none w-full sm:w-64"
        style={{ border: "1.5px solid #e5e7eb", fontSize: "0.85rem", background: "#fff", color: "#1a1d2e" }}
        onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="admin-table-wrapper">
          <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {COLS.map((col) => (
                  <th key={col.key} className={col.key === "action" ? "sticky-col" : ""} style={{ padding: "10px 12px", textAlign: "left", fontSize: "0.65rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(0,0,0,0.06)", whiteSpace: "nowrap", minWidth: col.w }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id} className={item.disbursed ? "row-disbursed" : ""}
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none", transition: "background 0.15s" }}
                  onMouseEnter={(e) => { if (!item.disbursed) (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                  <td style={{ padding: "11px 12px", fontSize: "0.7rem", color: "#6b7280", fontFamily: "monospace", whiteSpace: "nowrap" }}>{item.id}</td>
                  <td style={{ padding: "11px 12px", fontSize: "0.82rem", color: "#1a1d2e", fontWeight: 600, whiteSpace: "nowrap" }}>{item.customerName}</td>
                  <td style={{ padding: "11px 12px", fontSize: "0.72rem", color: "#6b7280", maxWidth: 160 }}>
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.address}</span>
                  </td>
                  <td style={{ padding: "11px 12px", fontSize: "0.82rem", color: "#374151", whiteSpace: "nowrap" }}>{item.itemName}</td>
                  <td style={{ padding: "11px 12px" }}><span className="px-2 py-0.5 rounded-full" style={{ background: "#e0e7ff", color: "#3730a3", fontSize: "0.65rem", fontWeight: 600 }}>{item.itemType}</span></td>
                  <td style={{ padding: "11px 12px", fontSize: "0.82rem", color: "#374151", fontFamily: "monospace" }}>{item.size}</td>
                  <td style={{ padding: "11px 12px", fontSize: "0.82rem", color: "#374151", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "11px 12px", fontSize: "0.82rem", color: "#1a1d2e", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {formatRupiah(item.sellingPrice * item.quantity)}
                    {item.quantity > 1 && <div style={{ fontSize: "0.65rem", color: "#9ca3af", fontWeight: 400 }}>@{formatRupiah(item.sellingPrice)}</div>}
                  </td>
                  <td style={{ padding: "11px 12px", fontSize: "0.72rem", color: "#6b7280", whiteSpace: "nowrap" }}>{item.submitDate}</td>
                  <td style={{ padding: "11px 12px" }}>
                    <button onClick={() => toggleDisbursed(item.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                      style={{ background: item.disbursed ? "#d1fae5" : "#f3f4f6", border: "none", cursor: "pointer", color: item.disbursed ? "#059669" : "#6b7280", fontSize: "0.72rem", fontWeight: 600 }}>
                      {item.disbursed ? <><CheckSquare className="w-3 h-3" /> {tr("disbursed", lang)}</> : <><Square className="w-3 h-3" /> {tr("notDisbursed", lang)}</>}
                    </button>
                  </td>
                  <td className="sticky-col" style={{ padding: "11px 12px" }}>
                    <button onClick={() => setSelectedItem(item)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                      style={{ background: "#ede9fe", color: "#7c3aed", fontSize: "0.72rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
                      {tr("showDetails", lang)} <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="py-12 text-center"><p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>{tr("noData", lang)}</p></div>}
      </div>

      {selectedItem && <SellerDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} lang={lang} />}
    </div>
  );
}
