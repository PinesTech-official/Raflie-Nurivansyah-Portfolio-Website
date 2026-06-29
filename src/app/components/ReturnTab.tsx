import { useState } from "react";
import { returnRefundData, ReturnRefundItem } from "./data";
import { formatRupiah, StatusBadge } from "./DashboardTab";
import { Lang, tr } from "./i18n";
import {
  ArrowLeft, ChevronRight, AlertCircle, CheckCircle2, Clock, XCircle,
} from "lucide-react";


const STATUS_MAP: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  "Menunggu Review": { bg: "#fef3c7", color: "#d97706", icon: <Clock className="w-3 h-3" /> },
  "Diproses": { bg: "#dbeafe", color: "#2563eb", icon: <AlertCircle className="w-3 h-3" /> },
  "Disetujui": { bg: "#d1fae5", color: "#059669", icon: <CheckCircle2 className="w-3 h-3" /> },
  "Ditolak": { bg: "#fee2e2", color: "#dc2626", icon: <XCircle className="w-3 h-3" /> },
};

function ReturnStatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { bg: "#f3f4f6", color: "#6b7280", icon: null };
  return (
    <span className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: s.bg, color: s.color, fontSize: "0.7rem", fontWeight: 700 }}>
      {s.icon} {status}
    </span>
  );
}

// Detail modal for an existing return
function ReturnDetailModal({ item, onClose, onUpdateStatus }: {
  item: ReturnRefundItem; onClose: () => void;
  onUpdateStatus: (id: string, status: ReturnRefundItem["status"]) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full sm:max-w-2xl overflow-y-auto" style={{ borderRadius: "1.5rem 1.5rem 0 0", maxHeight: "92vh", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div className="flex items-center gap-3 px-5 py-4 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", zIndex: 10 }}>
          <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#f3f4f6", border: "none", cursor: "pointer", color: "#374151", fontSize: "0.8rem", fontWeight: 600 }}>
            <ArrowLeft className="w-4 h-4" /> Kembali / Back
          </button>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1a1d2e" }}>Return & Refund — {item.id}</h3>
            <p style={{ fontSize: "0.72rem", color: "#6b7280" }}>{item.submittedAt} · {item.orderId}</p>
          </div>
          <ReturnStatusBadge status={item.status} />
        </div>
        <div className="px-5 py-5 space-y-5">
          {/* Order info */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p style={{ fontSize: "0.72rem", color: "#9ca3af" }}>Customer · Order ID</p>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a1d2e" }}>{item.customerName} — {item.orderId}</p>
              </div>
              <p style={{ fontSize: "1rem", fontWeight: 800, color: "#dc2626" }}>{formatRupiah(item.totalPrice)}</p>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#374151" }}>{item.itemName}</p>
          </div>
          {/* Reason */}
          <section>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: 8 }}>Alasan Return / Return Reason</p>
            <div className="rounded-xl px-4 py-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
              <p style={{ fontSize: "0.85rem", color: "#dc2626", fontWeight: 600 }}>{item.reason}</p>
            </div>
          </section>
          {/* Description */}
          <section>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: 8 }}>Deskripsi / Description</p>
            <div className="rounded-xl px-4 py-3" style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.6 }}>{item.description}</p>
            </div>
          </section>
          {/* Photos */}
          <section>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: 8 }}>Foto Item / Item Photos ({item.photos.length})</p>
            {item.photos.length > 0 ? (
              <div className="flex gap-3 flex-wrap">
                {item.photos.map((p, i) => (
                  <img key={i} src={p} alt="" className="rounded-xl object-cover" style={{ width: 100, height: 100, border: "1px solid rgba(0,0,0,0.08)" }} />
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "0.82rem", color: "#9ca3af" }}>Tidak ada foto</p>
            )}
          </section>
          {/* Video */}
          <section>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: 8 }}>Video Unboxing</p>
            {item.videoProof ? (
              <div className="rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: "#f0fdf4", border: "1px solid #86efac" }}>
                <Video className="w-4 h-4" style={{ color: "#16a34a" }} />
                <span style={{ fontSize: "0.82rem", color: "#16a34a" }}>Video tersedia</span>
              </div>
            ) : (
              <p style={{ fontSize: "0.82rem", color: "#9ca3af" }}>Tidak ada video</p>
            )}
          </section>
          {/* Payment proof */}
          <section>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: 8 }}>Bukti Pembayaran / Payment Proof</p>
            {item.paymentProof ? (
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)", maxWidth: 240 }}>
                <img src={item.paymentProof} alt="Bukti pembayaran" className="w-full object-cover" style={{ maxHeight: 280 }} />
              </div>
            ) : (
              <p style={{ fontSize: "0.82rem", color: "#9ca3af" }}>Tidak ada bukti pembayaran</p>
            )}
          </section>
          {/* Admin action */}
          {(item.status === "Menunggu Review" || item.status === "Diproses") && (
            <section className="flex gap-3">
              <button onClick={() => { onUpdateStatus(item.id, "Disetujui"); onClose(); }}
                className="flex-1 py-2.5 rounded-xl"
                style={{ background: "#d1fae5", color: "#059669", fontWeight: 700, fontSize: "0.88rem", border: "none", cursor: "pointer" }}>
                ✓ Setujui Refund
              </button>
              <button onClick={() => { onUpdateStatus(item.id, "Ditolak"); onClose(); }}
                className="flex-1 py-2.5 rounded-xl"
                style={{ background: "#fee2e2", color: "#dc2626", fontWeight: 700, fontSize: "0.88rem", border: "none", cursor: "pointer" }}>
                ✕ Tolak
              </button>
            </section>
          )}
          {(item.status === "Disetujui" || item.status === "Ditolak") && (
            <div className="rounded-xl px-4 py-3 text-center"
              style={{ background: item.status === "Disetujui" ? "#d1fae5" : "#fee2e2", border: `1px solid ${item.status === "Disetujui" ? "#6ee7b7" : "#fca5a5"}` }}>
              <p style={{ fontSize: "0.88rem", fontWeight: 700, color: item.status === "Disetujui" ? "#059669" : "#dc2626" }}>
                {item.status === "Disetujui" ? "✓ Refund telah disetujui" : "✕ Refund telah ditolak"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReturnTab({ lang, onBack }: { lang: Lang; onBack?: () => void }) {
  const [returns, setReturns] = useState<ReturnRefundItem[]>(returnRefundData);
  const [selected, setSelected] = useState<ReturnRefundItem | null>(null);
  const [filter, setFilter] = useState<string>("Semua");

  const updateStatus = (id: string, status: ReturnRefundItem["status"]) =>
    setReturns((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));

  const statusFilters = ["Semua", "Menunggu Review", "Diproses", "Disetujui", "Ditolak"];
  const filtered = returns.filter((r) => filter === "Semua" || r.status === filter);

  return (
    <div className="space-y-5">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#f3f4f6", border: "none", cursor: "pointer", color: "#374151", fontSize: "0.8rem", fontWeight: 600 }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali — Dashboard
        </button>
      )}

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1d2e" }}>Return & Refund</h2>
          <p style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: 2 }}>Kelola pengajuan return dan refund dari customer</p>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        {statusFilters.slice(1).map((s) => {
          const count = returns.filter((r) => r.status === s).length;
          const st = STATUS_MAP[s];
          return (
            <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: st.bg, border: `1px solid ${st.color}40` }}>
              <span style={{ color: st.color }}>{st.icon}</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: st.color }}>{s}: {count}</span>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className="px-3 py-1.5 rounded-full"
            style={{ background: filter === s ? "#dc2626" : "#f3f4f6", color: filter === s ? "#fff" : "#374151", fontSize: "0.75rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="admin-table-wrapper">
          <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["ID", "Order ID", "Customer", "Nama Barang", "Alasan", "Nilai", "Tanggal", "Status", "Aksi"].map((h, hi) => (
                  <th key={h} className={hi === 8 ? "sticky-col" : ""}
                    style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.68rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(0,0,0,0.06)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f9fafb")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}>
                  <td style={{ padding: "11px 14px", fontSize: "0.72rem", color: "#6b7280", fontFamily: "monospace", whiteSpace: "nowrap" }}>{item.id}</td>
                  <td style={{ padding: "11px 14px", fontSize: "0.75rem", color: "#6b7280", fontFamily: "monospace" }}>{item.orderId}</td>
                  <td style={{ padding: "11px 14px", fontSize: "0.85rem", color: "#1a1d2e", fontWeight: 600, whiteSpace: "nowrap" }}>{item.customerName}</td>
                  <td style={{ padding: "11px 14px", fontSize: "0.82rem", color: "#374151" }}>{item.itemName}</td>
                  <td style={{ padding: "11px 14px", fontSize: "0.75rem", color: "#dc2626", maxWidth: 160 }}>
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.reason}</span>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: "0.85rem", color: "#1a1d2e", fontWeight: 700, whiteSpace: "nowrap" }}>{formatRupiah(item.totalPrice)}</td>
                  <td style={{ padding: "11px 14px", fontSize: "0.75rem", color: "#6b7280", whiteSpace: "nowrap" }}>{item.submittedAt}</td>
                  <td style={{ padding: "11px 14px" }}><ReturnStatusBadge status={item.status} /></td>
                  <td className="sticky-col" style={{ padding: "11px 14px" }}>
                    <button onClick={() => setSelected(item)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                      style={{ background: "#fee2e2", color: "#dc2626", fontSize: "0.72rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
                      Detail <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Tidak ada pengajuan return</p>
          </div>
        )}
      </div>

      {selected && (
        <ReturnDetailModal
          item={returns.find((r) => r.id === selected.id) ?? selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  );
}
