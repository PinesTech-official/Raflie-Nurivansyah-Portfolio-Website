import { useState } from "react";
import { MarketingItem, ItemCategory, ItemCondition, SizeQty } from "./data";
import { ArrowLeft, Search, X, MessageCircle, Heart, Share2, Truck, Tag, ChevronRight, Star } from "lucide-react";

const CATS: { key: ItemCategory | "All"; label: string; icon: string }[] = [
  { key: "All",           label: "All",         icon: "✦" },
  { key: "Clothes",       label: "Clothes",      icon: "👕" },
  { key: "Mens",          label: "Men's",        icon: "👔" },
  { key: "Women",         label: "Women's",      icon: "👗" },
  { key: "Pants",         label: "Pants",        icon: "👖" },
  { key: "Bags",          label: "Bags",         icon: "👜" },
  { key: "Electronics",   label: "Electronics",  icon: "📱" },
  { key: "Miscellaneous", label: "Misc",         icon: "📦" },
];

function condColor(c: ItemCondition) {
  if (c === "Brand New") return { color: "#22c55e", bg: "rgba(34,197,94,0.18)" };
  if (c === "Like New")  return { color: "#60a5fa", bg: "rgba(96,165,250,0.18)" };
  return { color: "#fbbf24", bg: "rgba(251,191,36,0.18)" };
}

function fmt(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

// Visual frame grid (as shown on customer page)
function FramePreview({ item }: { item: MarketingItem }) {
  const { frameCount, frameSlots } = item;
  const gridCols = frameCount === 1 ? "1fr" : "1fr 1fr";
  const isLastFull = frameCount === 3 || frameCount === 5;

  return (
    <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 3, height: "100%", width: "100%" }}>
      {frameSlots.map((slot, i) => {
        const isSpan = isLastFull && i === frameSlots.length - 1;
        return (
          <div key={slot.positionKey}
            style={{
              gridColumn: isSpan ? "1 / -1" : undefined,
              position: "relative",
              background: "#0a0f1e",
              overflow: "hidden",
            }}
          >
            {slot.photo && (
              <img src={slot.photo} alt={slot.positionLabel} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
            )}
            {/* Position label overlay */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "3px 6px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.5rem", color: "#e2e8f0", fontWeight: 700 }}>{slot.positionLabel}</span>
                <span style={{ fontSize: "0.55rem", color: "#60a5fa", fontWeight: 800 }}>{fmt(slot.price)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Detail sheet
function ItemSheet({ item, onClose }: { item: MarketingItem; onClose: () => void }) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const cond = condColor(item.condition);
  const availableSizes = item.sizes.filter((s) => s.quantity > 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#0a0f1e" }} onClick={onClose}>
      <div className="flex-1 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Frame display */}
        <div style={{ position: "relative", height: 340, background: "#0a0f1e" }}>
          {/* Main frame grid */}
          <div style={{ display: "grid", gridTemplateColumns: item.frameCount === 1 ? "1fr" : "1fr 1fr", gap: 3, height: "100%" }}>
            {item.frameSlots.map((slot, i) => {
              const isSpan = (item.frameCount === 3 || item.frameCount === 5) && i === item.frameSlots.length - 1;
              const isSelected = selectedSlot === i;
              return (
                <div key={slot.positionKey}
                  onClick={() => setSelectedSlot(isSelected ? null : i)}
                  style={{
                    gridColumn: isSpan ? "1 / -1" : undefined,
                    position: "relative",
                    background: "#131929",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: isSelected ? "2px solid #60a5fa" : "none",
                  }}
                >
                  {slot.photo && <img src={slot.photo} alt={slot.positionLabel} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />}
                  <div style={{ position: "absolute", inset: 0, background: isSelected ? "rgba(96,165,250,0.1)" : "transparent" }} />
                  {/* Position chip */}
                  <div style={{ position: "absolute", bottom: 8, left: 8 }}>
                    <div style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", borderRadius: 8, padding: "4px 10px", border: isSelected ? "1px solid #60a5fa" : "none" }}>
                      <p style={{ fontSize: "0.6rem", color: "#e2e8f0", fontWeight: 700 }}>{slot.positionLabel}</p>
                      <p style={{ fontSize: "0.72rem", color: isSelected ? "#60a5fa" : "#94a3b8", fontWeight: 800 }}>{fmt(slot.price)}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{ position: "absolute", top: 8, right: 8, background: "#60a5fa", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 800 }}>✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Top bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
            <button onClick={onClose} style={{ background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
              <ArrowLeft style={{ width: 16, height: 16, color: "#fff" }} />
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setLiked(!liked)} style={{ background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
                <Heart style={{ width: 16, height: 16, color: liked ? "#f43f5e" : "#fff", fill: liked ? "#f43f5e" : "none" }} />
              </button>
              <button style={{ background: "rgba(0,0,0,0.5)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
                <Share2 style={{ width: 16, height: 16, color: "#fff" }} />
              </button>
            </div>
          </div>

          {/* Condition badge */}
          <div style={{ position: "absolute", top: 56, left: 14 }}>
            <span style={{ background: cond.bg, color: cond.color, fontSize: "0.65rem", fontWeight: 800, padding: "4px 10px", borderRadius: 99, backdropFilter: "blur(8px)", border: `1px solid ${cond.color}40` }}>
              {item.condition}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ background: "#0f172a", minHeight: "100vh" }}>
          <div style={{ padding: "20px 16px" }}>
            {/* Title + category */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {CATS.find((c) => c.key === item.category)?.icon} {CATS.find((c) => c.key === item.category)?.label}
                </p>
                <h2 style={{ color: "#f1f5f9", fontSize: "1.2rem", fontWeight: 800, lineHeight: 1.3, marginTop: 4 }}>{item.itemName}</h2>
              </div>
              <div style={{ background: cond.bg, borderRadius: 10, padding: "6px 10px", textAlign: "center", flexShrink: 0 }}>
                <p style={{ color: cond.color, fontSize: "0.62rem", fontWeight: 700 }}>{item.condition}</p>
              </div>
            </div>

            {/* Selected slot price highlight */}
            {selectedSlot !== null ? (
              <div style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
                <p style={{ color: "#64748b", fontSize: "0.7rem", marginBottom: 4 }}>Kamu memilih posisi:</p>
                <p style={{ color: "#e2e8f0", fontWeight: 800, fontSize: "0.95rem" }}>{item.frameSlots[selectedSlot].positionLabel}</p>
                <p style={{ color: "#60a5fa", fontWeight: 900, fontSize: "1.4rem", marginTop: 2 }}>{fmt(item.frameSlots[selectedSlot].price)}</p>
              </div>
            ) : (
              <div style={{ background: "#1e293b", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ color: "#64748b", fontSize: "0.72rem" }}>Tap foto di atas untuk memilih posisi</p>
                <p style={{ color: "#e2e8f0", fontSize: "0.8rem", fontWeight: 600, marginTop: 2 }}>Harga mulai dari <span style={{ color: "#60a5fa" }}>{fmt(Math.min(...item.frameSlots.map((s) => s.price)))}</span></p>
              </div>
            )}

            {/* All positions */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Pilih Posisi</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {item.frameSlots.map((slot, i) => (
                  <button key={slot.positionKey} onClick={() => setSelectedSlot(selectedSlot === i ? null : i)}
                    style={{
                      background: selectedSlot === i ? "rgba(96,165,250,0.15)" : "#1e293b",
                      border: selectedSlot === i ? "1.5px solid #60a5fa" : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12,
                      padding: "10px 14px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}>
                    <p style={{ color: "#94a3b8", fontSize: "0.65rem", fontWeight: 600 }}>{slot.positionLabel}</p>
                    <p style={{ color: selectedSlot === i ? "#60a5fa" : "#f1f5f9", fontSize: "0.9rem", fontWeight: 800, marginTop: 2 }}>{fmt(slot.price)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Ukuran / Size</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {item.sizes.map((sq) => {
                  const avail = sq.quantity > 0;
                  const isSel = selectedSize === sq.size;
                  return (
                    <button key={sq.size} disabled={!avail} onClick={() => avail && setSelectedSize(isSel ? null : sq.size)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: 10,
                        border: isSel ? "2px solid #60a5fa" : "1px solid rgba(255,255,255,0.1)",
                        background: !avail ? "#0f172a" : isSel ? "rgba(96,165,250,0.2)" : "#1e293b",
                        color: !avail ? "#334155" : isSel ? "#60a5fa" : "#e2e8f0",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        cursor: avail ? "pointer" : "not-allowed",
                        position: "relative",
                      }}>
                      {sq.size}
                      {avail && sq.quantity <= 2 && (
                        <span style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", color: "#fff", fontSize: "0.5rem", fontWeight: 700, padding: "1px 5px", borderRadius: 99 }}>
                          {sq.quantity}
                        </span>
                      )}
                      {!avail && <span style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "#334155", transform: "translateY(-50%)" }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div style={{ background: "#1e293b", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
                <p style={{ color: "#64748b", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Deskripsi</p>
                <p style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: 1.7 }}>{item.description}</p>
              </div>
            )}

            {/* Shipping info */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)", borderRadius: 12, padding: "10px 14px", marginBottom: 24 }}>
              <Truck style={{ width: 16, height: 16, color: "#60a5fa", flexShrink: 0 }} />
              <p style={{ color: "#93c5fd", fontSize: "0.78rem" }}>Pengiriman ke seluruh Indonesia · JNE · SiCepat · J&T · Pos</p>
            </div>

            {/* CTA */}
            <button style={{
              width: "100%",
              padding: "16px",
              borderRadius: 16,
              background: availableSizes.length > 0 ? "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)" : "#1e293b",
              color: availableSizes.length > 0 ? "#fff" : "#475569",
              fontWeight: 800,
              fontSize: "0.95rem",
              border: "none",
              cursor: availableSizes.length > 0 ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              letterSpacing: "0.01em",
            }}>
              <MessageCircle style={{ width: 18, height: 18 }} />
              {selectedSlot !== null
                ? `Order ${item.frameSlots[selectedSlot].positionLabel} — ${fmt(item.frameSlots[selectedSlot].price)}`
                : "Order via WhatsApp"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product card on customer storefront
function ProductCard({ item, onClick }: { item: MarketingItem; onClick: () => void }) {
  const cond = condColor(item.condition);
  const catInfo = CATS.find((c) => c.key === item.category);
  const minPrice = Math.min(...item.frameSlots.map((s) => s.price));
  const maxPrice = Math.max(...item.frameSlots.map((s) => s.price));
  const availableSizes = item.sizes.filter((s) => s.quantity > 0);

  return (
    <div onClick={onClick} style={{ background: "#131929", borderRadius: 16, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.2s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
      {/* Frame preview */}
      <div style={{ position: "relative", paddingBottom: "100%", background: "#0a0f1e" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <FramePreview item={item} />
        </div>
        {/* Condition badge */}
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <span style={{ background: cond.bg, color: cond.color, fontSize: "0.58rem", fontWeight: 800, padding: "3px 8px", borderRadius: 99, backdropFilter: "blur(6px)" }}>
            {item.condition}
          </span>
        </div>
        {/* Frame count badge */}
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <span style={{ background: "rgba(0,0,0,0.6)", color: "#e2e8f0", fontSize: "0.58rem", fontWeight: 700, padding: "3px 8px", borderRadius: 99, backdropFilter: "blur(6px)" }}>
            {item.frameCount} foto
          </span>
        </div>
      </div>

      <div style={{ padding: "12px 12px 14px" }}>
        <p style={{ color: "#64748b", fontSize: "0.62rem", fontWeight: 600 }}>{catInfo?.icon} {catInfo?.label}</p>
        <p style={{ color: "#f1f5f9", fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.3, marginTop: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {item.itemName}
        </p>

        {/* Available sizes */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
          {availableSizes.slice(0, 4).map((sq) => (
            <span key={sq.size} style={{ background: "rgba(96,165,250,0.15)", color: "#60a5fa", fontSize: "0.58rem", fontWeight: 700, padding: "2px 7px", borderRadius: 6 }}>
              {sq.size}
            </span>
          ))}
          {item.sizes.filter((s) => s.quantity === 0).map((sq) => (
            <span key={sq.size} style={{ background: "rgba(255,255,255,0.04)", color: "#334155", fontSize: "0.58rem", fontWeight: 600, padding: "2px 7px", borderRadius: 6, textDecoration: "line-through" }}>
              {sq.size}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div>
            <p style={{ color: "#64748b", fontSize: "0.6rem" }}>mulai dari</p>
            <p style={{ color: "#60a5fa", fontWeight: 900, fontSize: "0.95rem" }}>
              {fmt(minPrice)}{minPrice !== maxPrice ? ` – ${fmt(maxPrice)}` : ""}
            </p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
            Pilih
          </button>
        </div>
      </div>
    </div>
  );
}

export function CustomerPage({ items, onClose }: { items: MarketingItem[]; onClose: () => void }) {
  const [category, setCategory] = useState<ItemCategory | "All">("All");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MarketingItem | null>(null);

  const liveItems = items.filter((i) => i.uploaded);
  const filtered = liveItems.filter((i) => {
    if (category !== "All" && i.category !== category) return false;
    if (search && !i.itemName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: "#0a0f1e", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 20 }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px" }}>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, padding: "7px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: "0.78rem", fontWeight: 600, flexShrink: 0 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Admin
          </button>

          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: "0.9rem", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Produk</p>
          </div>

          <div style={{ background: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 8, padding: "4px 10px", flexShrink: 0 }}>
            <p style={{ fontSize: "0.6rem", fontWeight: 800, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.05em" }}>Preview</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: "0 16px 10px" }}>
          <div style={{ position: "relative" }}>
            <Search style={{ width: 14, height: 14, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..."
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "#1e293b", fontSize: "0.85rem", color: "#f1f5f9", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 8, padding: "0 16px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
          {CATS.map((c) => (
            <button key={c.key} onClick={() => setCategory(c.key as ItemCategory | "All")}
              style={{ padding: "6px 14px", borderRadius: 99, border: category === c.key ? "none" : "1px solid rgba(255,255,255,0.08)", background: category === c.key ? "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)" : "#1e293b", color: category === c.key ? "#fff" : "#94a3b8", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ overflowY: "auto", height: "calc(100vh - 148px)" }}>
        {/* Hero */}
        {category === "All" && !search && (
          <div style={{ margin: "14px 16px 0", borderRadius: 20, overflow: "hidden", position: "relative", height: 150, background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%)" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 24px" }}>
              <div>
                <h2 style={{ color: "#f1f5f9", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1.15 }}>
                  Thrift with<br /><span style={{ background: "linear-gradient(90deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Character</span>
                </h2>
                <p style={{ color: "#475569", fontSize: "0.75rem", marginTop: 8 }}>{liveItems.length} item tersedia</p>
              </div>
            </div>
          </div>
        )}

        {/* How it works note */}
        <div style={{ margin: "12px 16px 0", background: "#1e293b", borderRadius: 12, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Tag style={{ width: 14, height: 14, color: "#60a5fa", flexShrink: 0, marginTop: 2 }} />
          <p style={{ color: "#64748b", fontSize: "0.72rem", lineHeight: 1.6 }}>
            Setiap frame bisa berisi beberapa produk. Tap foto untuk memilih posisi dan melihat harga per produk.
          </p>
        </div>

        {/* Count */}
        <div style={{ padding: "10px 16px 4px" }}>
          <p style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 500 }}>{filtered.length} produk</p>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, padding: "4px 16px 80px" }}>
          {filtered.map((item) => (
            <ProductCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", color: "#334155", fontSize: "0.88rem" }}>
              Belum ada produk untuk kategori ini
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(15,23,42,0.95)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(12px)" }}>
        <p style={{ fontSize: "0.7rem", color: "#475569" }}>Thrift Store · All items pre-owned</p>
      </div>

      {selectedItem && <ItemSheet item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}
