import { useState, useRef } from "react";
import { marketingItems, MarketingItem, ItemCondition, ItemCategory, SizeQty, FrameSlot, FrameCount, getFrameSlots } from "./data";
import { formatRupiah } from "./DashboardTab";
import { CustomerPage } from "./CustomerPage";
import { buildStokList, StokProduct } from "./StokTab";
import { Lang, tr } from "./i18n";
import { Upload, Plus, X, Eye, Check, ImageIcon, ArrowLeft, AlertTriangle, Edit2, Trash2, Boxes } from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────
const CONDITIONS: { key: ItemCondition; color: string; bg: string }[] = [
  { key: "Brand New", color: "#059669", bg: "#d1fae5" },
  { key: "Like New",  color: "#2563eb", bg: "#dbeafe" },
  { key: "Used",      color: "#d97706", bg: "#fef3c7" },
];

const CATEGORIES: { key: ItemCategory }[] = [
  { key: "Clothes" },
  { key: "Mens" },
  { key: "Women" },
  { key: "Pants" },
  { key: "Bags" },
  { key: "Electronics" },
  { key: "Miscellaneous" },
];

const CAT_LABELS: Record<ItemCategory, keyof typeof import("./i18n").t> = {
  Clothes: "catClothes", Mens: "catMens", Women: "catWomen",
  Pants: "catPants", Bags: "catBags", Electronics: "catElectronics", Miscellaneous: "catMisc",
};

function condStyle(c: ItemCondition) {
  return CONDITIONS.find((x) => x.key === c) ?? CONDITIONS[1];
}

// ── Frame layout grid preview ─────────────────────────────────────────────────
function FrameGrid({ count, slots, active, onSelect }: {
  count: FrameCount; slots: FrameSlot[]; active?: number; onSelect?: (i: number) => void;
}) {
  const gridStyle: Record<FrameCount, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-2",
    4: "grid-cols-2",
    5: "grid-cols-2",
    6: "grid-cols-3",
  };

  // For count=3 and 5: last item spans full width (not for 6 which is a 3x2 grid)
  const isLastSpan = (count === 3 || count === 5);

  return (
    <div className={`grid gap-1 ${gridStyle[count]}`} style={{ aspectRatio: count === 1 ? "1/1" : "4/3" }}>
      {slots.map((slot, i) => {
        const isSpanned = isLastSpan && i === slots.length - 1;
        return (
          <div
            key={slot.positionKey}
            onClick={() => onSelect?.(i)}
            className={`relative rounded overflow-hidden flex items-center justify-center cursor-pointer ${isSpanned ? "col-span-2" : ""}`}
            style={{
              background: slot.photo ? "transparent" : "#f1f5f9",
              border: active === i ? "2px solid #2563eb" : "1px solid #e5e7eb",
              minHeight: 60,
            }}
          >
            {slot.photo ? (
              <img src={slot.photo} alt={slot.positionLabel} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
            ) : (
              <ImageIcon className="w-5 h-5" style={{ color: "#cbd5e1" }} />
            )}
            <div
              className="absolute bottom-0 left-0 right-0 text-center py-0.5"
              style={{ background: "rgba(0,0,0,0.55)", fontSize: "0.55rem", color: "#fff", fontWeight: 700 }}
            >
              {slot.positionLabel}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ draftCount, lang, onConfirm, onCancel }: {
  draftCount: number; lang: Lang; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
        <div className="p-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full" style={{ background: "#fef3c7" }}>
            <AlertTriangle className="w-7 h-7" style={{ color: "#d97706" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1a1d2e" }}>{tr("confirmUploadAll", lang)}</h3>
            <p style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: 8, lineHeight: 1.6 }}>{tr("confirmUploadBody", lang)}</p>
            <p style={{ fontSize: "0.85rem", color: "#d97706", fontWeight: 700, marginTop: 8 }}>{draftCount} {tr("draftItems", lang)}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl" style={{ background: "#f3f4f6", color: "#374151", fontWeight: 600, fontSize: "0.88rem", border: "none", cursor: "pointer" }}>
              {tr("cancel", lang)}
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl" style={{ background: "#1e2a4a", color: "#e2e8f0", fontWeight: 700, fontSize: "0.88rem", border: "none", cursor: "pointer" }}>
              {tr("confirm", lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stock Picker Modal ────────────────────────────────────────────────────────
function StockPickerModal({ lang, onClose, onSelect }: {
  lang: Lang; onClose: () => void;
  onSelect: (p: StokProduct) => void;
}) {
  const [search, setSearch] = useState("");
  const allStock = buildStokList(marketingItems);
  const filtered = allStock.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toString().toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full sm:max-w-lg overflow-hidden" style={{ borderRadius: "1.5rem 1.5rem 0 0", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowLeft className="w-4 h-4" /> Batal
          </button>
          <h3 style={{ flex: 1, fontSize: "0.92rem", fontWeight: 700, color: "#1a1d2e" }}>Pilih Produk dari Stok</h3>
        </div>
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", flexShrink: 0 }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..."
            className="w-full px-3 py-2 rounded-lg outline-none"
            style={{ border: "1.5px solid #e5e7eb", fontSize: "0.85rem", background: "#f9fafb", color: "#1a1d2e" }}
            onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
        </div>
        <div className="overflow-y-auto flex-1">
          {filtered.map((p) => {
            const totalStok = p.sizes.reduce((a, s) => a + s.quantity, 0);
            return (
              <button key={p.id} onClick={() => { onSelect(p); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                style={{ background: "transparent", border: "none", cursor: "pointer", borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#f0f9ff")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                {/* Thumbnail */}
                <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {p.photos[0]
                    ? <img src={p.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <Boxes className="w-4 h-4" style={{ color: "#9ca3af" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a1d2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                  <div className="flex gap-1.5 mt-0.5">
                    <span style={{ fontSize: "0.62rem", color: "#3730a3", background: "#e0e7ff", padding: "1px 6px", borderRadius: 99, fontWeight: 600 }}>{p.category}</span>
                    <span style={{ fontSize: "0.62rem", color: "#6b7280", background: "#f3f4f6", padding: "1px 6px", borderRadius: 99 }}>{p.condition}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {p.price > 0 && <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb" }}>{formatRupiah(p.price)}</p>}
                  <p style={{ fontSize: "0.68rem", color: totalStok === 0 ? "#dc2626" : "#059669", fontWeight: 600 }}>
                    {totalStok === 0 ? "Stok Habis" : `${totalStok} stok`}
                  </p>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center"><p style={{ fontSize: "0.82rem", color: "#9ca3af" }}>Tidak ada produk ditemukan</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Item Form Modal ───────────────────────────────────────────────────────────
function SlotSizeEditor({ sizes, onChange }: {
  sizes: SizeQty[]; onChange: (sizes: SizeQty[]) => void;
}) {
  const add = () => onChange([...sizes, { size: "", quantity: 1 }]);
  const remove = (i: number) => onChange(sizes.filter((_, idx) => idx !== i));
  const update = (i: number, f: "size" | "quantity", v: string | number) =>
    onChange(sizes.map((s, idx) => idx === i ? { ...s, [f]: v } : s));

  return (
    <div>
      <div className="space-y-2">
        {sizes.map((sq, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={sq.size} onChange={(e) => update(i, "size", e.target.value)} placeholder="S / M / L / 36"
              className="flex-1 px-2.5 py-2 rounded-lg outline-none"
              style={{ border: "1.5px solid #e5e7eb", fontSize: "0.82rem", background: "#f9fafb", color: "#1a1d2e" }}
              onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
            <button type="button" onClick={() => update(i, "quantity", Math.max(0, sq.quantity - 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "1rem" }}>−</button>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: sq.quantity === 0 ? "#dc2626" : "#1a1d2e", minWidth: 20, textAlign: "center" }}>
              {sq.quantity === 0 ? "0" : sq.quantity}
            </span>
            <button type="button" onClick={() => update(i, "quantity", sq.quantity + 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "1rem" }}>+</button>
            {sizes.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#fee2e2", border: "none", cursor: "pointer" }}>
                <Trash2 className="w-3 h-3" style={{ color: "#dc2626" }} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
        style={{ background: "#eff6ff", color: "#2563eb", fontSize: "0.75rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
        <Plus className="w-3 h-3" /> Tambah Ukuran
      </button>
    </div>
  );
}

function ItemFormModal({ lang, initial, onClose, onSave }: {
  lang: Lang; initial?: MarketingItem; onClose: () => void; onSave: (item: MarketingItem) => void;
}) {
  const [description, setDescription] = useState(initial?.description ?? "");
  const [frameCount, setFrameCount] = useState<FrameCount>(initial?.frameCount ?? 1);
  const [frameSlots, setFrameSlots] = useState<FrameSlot[]>(() => {
    if (initial?.frameSlots) return initial.frameSlots;
    return getFrameSlots(1).map((s) => ({ ...s, itemName: "", condition: "Like New" as ItemCondition, category: "Clothes" as ItemCategory, sizes: [{ size: "", quantity: 1 }] }));
  });
  const [totalQuantity, setTotalQuantity] = useState(initial?.totalQuantity ?? 1);
  const [activeSlot, setActiveSlot] = useState(0);
  const [showStockPicker, setShowStockPicker] = useState(false);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateSlot = <K extends keyof FrameSlot>(i: number, key: K, val: FrameSlot[K]) =>
    setFrameSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s));

  const handleFrameCountChange = (count: FrameCount) => {
    setFrameCount(count);
    const newSlots = getFrameSlots(count);
    const merged = newSlots.map((slot, i) => ({
      ...slot,
      photo: frameSlots[i]?.photo ?? null,
      price: frameSlots[i]?.price ?? 0,
      quantity: frameSlots[i]?.quantity ?? 1,
      itemName: frameSlots[i]?.itemName ?? "",
      condition: frameSlots[i]?.condition ?? ("Like New" as ItemCondition),
      category: frameSlots[i]?.category ?? ("Clothes" as ItemCategory),
      sizes: frameSlots[i]?.sizes ?? [{ size: "", quantity: 1 }],
    }));
    setFrameSlots(merged);
    setActiveSlot(0);
  };

  const handleSlotFile = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateSlot(i, "photo", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const firstSlot = frameSlots[0];
    onSave({
      id: initial?.id ?? `MKT-${Date.now()}`,
      itemName: firstSlot?.itemName || firstSlot?.positionLabel || "Produk Baru",
      category: firstSlot?.category ?? "Clothes",
      condition: firstSlot?.condition ?? "Like New",
      sizes: firstSlot?.sizes ?? [{ size: "Free", quantity: totalQuantity }],
      frameCount, frameSlots,
      description,
      uploadedAt: initial?.uploadedAt ?? new Date().toISOString().split("T")[0],
      uploaded: initial?.uploaded ?? false,
      totalQuantity: frameCount === 1 ? totalQuantity : frameSlots.reduce((acc, s) => acc + (s.sizes?.reduce((a, sz) => a + sz.quantity, 0) ?? s.quantity), 0),
    });
    onClose();
  };

  const slot = frameSlots[activeSlot];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full sm:max-w-xl overflow-y-auto" style={{ borderRadius: "1.5rem 1.5rem 0 0", maxHeight: "92vh" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", zIndex: 10 }}>
          <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#f3f4f6", border: "none", cursor: "pointer", color: "#374151", fontSize: "0.8rem", fontWeight: 600 }}>
            <ArrowLeft className="w-4 h-4" /> {tr("back", lang)}
          </button>
          <h3 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1a1d2e", flex: 1 }}>
            {initial ? tr("editItem", lang) : tr("uploadNew", lang)}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X className="w-4 h-4" style={{ color: "#6b7280" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-6">
          {/* Step 1: Frame count selector */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
              {tr("frameCount", lang)}
            </label>
            <div className="flex gap-2 flex-wrap">
              {([1, 2, 3, 4, 5, 6] as FrameCount[]).map((n) => (
                <button key={n} type="button" onClick={() => handleFrameCountChange(n)}
                  className="px-4 py-2 rounded-xl"
                  style={{ background: frameCount === n ? "#1e2a4a" : "#f3f4f6", color: frameCount === n ? "#e2e8f0" : "#374151", fontSize: "0.82rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
                  {n} {tr("framePhoto", lang)}
                </button>
              ))}
            </div>
          </div>

          {/* Frame grid preview */}
          <div className="rounded-xl p-3" style={{ background: "#f8fafc", border: "1px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginBottom: 8, fontWeight: 600 }}>Preview Frame — klik slot untuk edit</p>
            <div style={{ maxWidth: 240, margin: "0 auto" }}>
              <FrameGrid count={frameCount} slots={frameSlots} active={activeSlot} onSelect={setActiveSlot} />
            </div>
          </div>

          {/* Per-slot editor */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid #2563eb22" }}>
            {/* Slot tabs */}
            <div className="flex overflow-x-auto" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", background: "#f8fafc" }}>
              {frameSlots.map((s, i) => (
                <button key={s.positionKey} type="button" onClick={() => setActiveSlot(i)}
                  style={{ padding: "8px 14px", background: activeSlot === i ? "#fff" : "transparent", color: activeSlot === i ? "#2563eb" : "#6b7280", fontSize: "0.75rem", fontWeight: activeSlot === i ? 700 : 500, border: "none", cursor: "pointer", borderBottom: activeSlot === i ? "2px solid #2563eb" : "2px solid transparent", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {s.positionLabel}
                  {s.photo && <span style={{ marginLeft: 4, color: "#059669", fontSize: "0.6rem" }}>●</span>}
                </button>
              ))}
            </div>

            {slot && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a1d2e", marginBottom: 0 }}>
                    Item {activeSlot + 1}: <span style={{ color: "#2563eb" }}>{slot.positionLabel}</span>
                  </p>
                  <button type="button" onClick={() => setShowStockPicker(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ background: "#ede9fe", color: "#7c3aed", fontSize: "0.72rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
                    <Boxes className="w-3 h-3" /> Pilih dari Stok
                  </button>
                </div>

                {/* Photo upload */}
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, fontWeight: 600 }}>Foto Item</p>
                  <div onClick={() => fileRefs.current[activeSlot]?.click()}
                    className="rounded-xl overflow-hidden cursor-pointer flex items-center justify-center"
                    style={{ height: 100, background: slot.photo ? "transparent" : "#f1f5f9", border: "1.5px dashed #d1d5db", position: "relative" }}>
                    {slot.photo ? (
                      <img src={slot.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-6 h-6 mx-auto" style={{ color: "#cbd5e1" }} />
                        <p style={{ fontSize: "0.65rem", color: "#9ca3af", marginTop: 4 }}>{tr("clickToUpload", lang)}</p>
                      </div>
                    )}
                  </div>
                  <input ref={(el) => (fileRefs.current[activeSlot] = el)} type="file" accept="image/*"
                    onChange={(e) => handleSlotFile(activeSlot, e)} style={{ display: "none" }} />
                </div>

                {/* Nama produk per slot */}
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, fontWeight: 600 }}>Nama Produk *</p>
                  <input value={slot.itemName ?? ""} onChange={(e) => updateSlot(activeSlot, "itemName", e.target.value)}
                    placeholder="Nama item ini..." className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ border: "1.5px solid #e5e7eb", fontSize: "0.85rem", background: "#f9fafb", color: "#1a1d2e" }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
                </div>

                {/* Price per slot */}
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4, fontWeight: 600 }}>{tr("framePrice", lang)} (IDR) *</p>
                  <input type="number" value={slot.price || ""}
                    onChange={(e) => updateSlot(activeSlot, "price", parseInt(e.target.value) || 0)}
                    placeholder="185000" className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{ border: "1.5px solid #e5e7eb", fontSize: "0.85rem", background: "#f9fafb", color: "#1a1d2e" }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
                </div>

                {/* Jenis / Category per slot */}
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>{tr("itemType_label", lang)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((c) => (
                      <button key={c.key} type="button" onClick={() => updateSlot(activeSlot, "category", c.key)}
                        className="px-2.5 py-1 rounded-lg"
                        style={{ background: slot.category === c.key ? "#1e2a4a" : "#f3f4f6", color: slot.category === c.key ? "#e2e8f0" : "#374151", fontSize: "0.72rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
                        {tr(CAT_LABELS[c.key] as any, lang)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kondisi per slot */}
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>{tr("condition", lang)}</p>
                  <div className="flex flex-wrap gap-2">
                    {CONDITIONS.map((c) => (
                      <button key={c.key} type="button" onClick={() => updateSlot(activeSlot, "condition", c.key)}
                        className="px-3 py-1.5 rounded-lg"
                        style={{ background: slot.condition === c.key ? c.bg : "#f3f4f6", border: `1.5px solid ${slot.condition === c.key ? c.color : "transparent"}`, cursor: "pointer" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: slot.condition === c.key ? c.color : "#374151" }}>{c.key}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ukuran & Stok per slot */}
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>Ukuran &amp; Stok</p>
                  <SlotSizeEditor
                    sizes={slot.sizes ?? [{ size: "", quantity: 1 }]}
                    onChange={(sz) => updateSlot(activeSlot, "sizes", sz)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* All slots summary */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
            {frameSlots.map((s, i) => (
              <div key={s.positionKey} onClick={() => setActiveSlot(i)} className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                style={{ background: activeSlot === i ? "#eff6ff" : i % 2 === 0 ? "#fff" : "#f9fafb", borderBottom: i < frameSlots.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0" style={{ background: "#f1f5f9" }}>
                  {s.photo ? <img src={s.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-3 h-3" style={{ color: "#d1d5db" }} /></div>}
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", flex: 1 }}>{s.itemName || s.positionLabel}</span>
                <span style={{ fontSize: "0.68rem", color: "#9ca3af", marginRight: 4 }}>
                  {s.sizes ? s.sizes.reduce((a, sz) => a + sz.quantity, 0) + " stok" : `×${s.quantity}`}
                </span>
                <span style={{ fontSize: "0.78rem", color: s.price ? "#2563eb" : "#9ca3af", fontWeight: 600 }}>
                  {s.price ? formatRupiah(s.price) : "–"}
                </span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              {tr("descLabel", lang)}
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder={tr("descPH", lang)}
              className="w-full px-3 py-2.5 rounded-lg outline-none resize-none"
              style={{ border: "1.5px solid #e5e7eb", fontSize: "0.88rem", background: "#f9fafb", color: "#1a1d2e" }}
              onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
          </div>

          {/* Total Stok — only shown for single-photo frame */}
          {frameCount === 1 && (
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                Total Stok Keseluruhan / Total Stock <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setTotalQuantity(Math.max(1, totalQuantity - 1))}
                  className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>−</button>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: "#1a1d2e", minWidth: 32, textAlign: "center" }}>{totalQuantity}</span>
                <button type="button" onClick={() => setTotalQuantity(totalQuantity + 1)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>+</button>
                <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>item</span>
              </div>
            </div>
          )}

          <button type="submit" className="w-full py-3 rounded-xl"
            style={{ background: "#1e2a4a", color: "#e2e8f0", fontWeight: 700, fontSize: "0.92rem", border: "none", cursor: "pointer" }}>
            {tr("saveProduct", lang)}
          </button>
        </form>
      </div>
      {showStockPicker && (
        <StockPickerModal lang={lang} onClose={() => setShowStockPicker(false)}
          onSelect={(p) => {
            setFrameSlots((prev) => prev.map((s, i) => i === activeSlot ? {
              ...s,
              itemName: p.name,
              category: p.category as ItemCategory,
              condition: p.condition as ItemCondition,
              sizes: p.sizes,
              price: p.price > 0 ? p.price : s.price,
              photo: p.photos[0] ?? s.photo,
            } : s));
          }}
        />
      )}
    </div>
  );
}

// ── Main Marketing Tab ────────────────────────────────────────────────────────
export function MarketingTab({ lang, onBack }: { lang: Lang; onBack?: () => void }) {
  const [items, setItems] = useState<MarketingItem[]>(marketingItems);
  const [showUpload, setShowUpload] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketingItem | undefined>(undefined);
  const [showConfirm, setShowConfirm] = useState(false);
  const [filterCat, setFilterCat] = useState<ItemCategory | "All">("All");

  const filtered = items.filter((i) => filterCat === "All" || i.category === filterCat);
  const uploadedCount = items.filter((i) => i.uploaded).length;
  const draftItems = items.filter((i) => !i.uploaded);

  const toggleUpload = (id: string) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, uploaded: !i.uploaded } : i));
  const handleUploadAll = () => { setItems((prev) => prev.map((i) => ({ ...i, uploaded: true }))); setShowConfirm(false); };
  const handleSave = (item: MarketingItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      return idx >= 0 ? prev.map((i) => i.id === item.id ? item : i) : [item, ...prev];
    });
    setEditingItem(undefined);
  };

  return (
    <div className="space-y-5">
      {/* Back button */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#f3f4f6", border: "none", cursor: "pointer", color: "#374151", fontSize: "0.8rem", fontWeight: 600 }}>
          <ArrowLeft className="w-3.5 h-3.5" /> {tr("back", lang)} — Dashboard
        </button>
      )}
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1d2e" }}>{tr("marketingTitle", lang)}</h2>
          <p style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: 2 }}>{tr("marketingSubtitle", lang)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: "#1e2a4a", color: "#e2e8f0", fontSize: "0.8rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
            <Eye className="w-3.5 h-3.5" /> {tr("previewCustomer", lang)}
          </button>
          {draftItems.length > 0 && (
            <button onClick={() => setShowConfirm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: "#d97706", color: "#fff", fontSize: "0.8rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
              <Upload className="w-3.5 h-3.5" /> {tr("uploadAll", lang)} ({draftItems.length})
            </button>
          )}
          <button onClick={() => { setEditingItem(undefined); setShowUpload(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: "#2563eb", color: "#fff", fontSize: "0.8rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
            <Plus className="w-3.5 h-3.5" /> {tr("uploadNew", lang)}
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#dbeafe", border: "1px solid #93c5fd" }}>
          <Upload className="w-3.5 h-3.5" style={{ color: "#2563eb" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1e40af" }}>{uploadedCount} {tr("displayed", lang)}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
          <ImageIcon className="w-3.5 h-3.5" style={{ color: "#6b7280" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>{draftItems.length} {tr("draft", lang)}</span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterCat("All")} className="px-3 py-1.5 rounded-full"
          style={{ background: filterCat === "All" ? "#1e2a4a" : "#f3f4f6", color: filterCat === "All" ? "#e2e8f0" : "#374151", fontSize: "0.75rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
          {tr("all", lang)}
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.key} onClick={() => setFilterCat(c.key)} className="px-3 py-1.5 rounded-full"
            style={{ background: filterCat === c.key ? "#1e2a4a" : "#f3f4f6", color: filterCat === c.key ? "#e2e8f0" : "#374151", fontSize: "0.75rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
            {tr(CAT_LABELS[c.key] as any, lang)}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {filtered.map((item) => {
          const cond = condStyle(item.condition);
          return (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {/* Frame preview */}
              <div className="p-2" style={{ background: "#f8fafc" }}>
                <FrameGrid count={item.frameCount} slots={item.frameSlots} />
              </div>

              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a1d2e", lineHeight: 1.3, flex: 1 }}>{item.itemName}</p>
                  {item.uploaded
                    ? <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full" style={{ background: "#d1fae5", color: "#059669", fontSize: "0.6rem", fontWeight: 700, whiteSpace: "nowrap" }}><Check className="w-2.5 h-2.5" /> Live</span>
                    : <span className="px-1.5 py-0.5 rounded-full" style={{ background: "#f3f4f6", color: "#9ca3af", fontSize: "0.6rem", fontWeight: 700 }}>Draft</span>}
                </div>

                {/* Condition + category */}
                <div className="flex gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full" style={{ background: cond.bg, color: cond.color, fontSize: "0.6rem", fontWeight: 700 }}>{item.condition}</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ background: "#e0e7ff", color: "#3730a3", fontSize: "0.6rem", fontWeight: 600 }}>
                    {tr(CAT_LABELS[item.category] as any, lang)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full" style={{ background: "#f0fdf4", color: "#16a34a", fontSize: "0.6rem", fontWeight: 700 }}>
                    Stok: {item.totalQuantity}
                  </span>
                </div>

                {/* Frame slot prices */}
                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
                  {item.frameSlots.map((slot, i) => (
                    <div key={slot.positionKey} className="flex items-center justify-between px-2 py-1" style={{ borderBottom: i < item.frameSlots.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                      <span style={{ fontSize: "0.65rem", color: "#6b7280" }}>{slot.positionLabel}</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#2563eb" }}>{formatRupiah(slot.price)}</span>
                    </div>
                  ))}
                </div>

                {/* Sizes */}
                <div className="flex flex-wrap gap-1">
                  {item.sizes.map((sq) => (
                    <span key={sq.size} className="px-1.5 py-0.5 rounded" style={{ background: sq.quantity > 0 ? "#f0fdf4" : "#f9fafb", color: sq.quantity > 0 ? "#16a34a" : "#9ca3af", fontSize: "0.6rem", fontWeight: 700, border: `1px solid ${sq.quantity > 0 ? "#86efac" : "#e5e7eb"}` }}>
                      {sq.size} ×{sq.quantity}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => { setEditingItem(item); setShowUpload(true); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg flex-1 justify-center"
                    style={{ background: "#f3f4f6", color: "#374151", fontSize: "0.72rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
                    <Edit2 className="w-3 h-3" /> {tr("editItem", lang)}
                  </button>
                  <button onClick={() => toggleUpload(item.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg flex-1 justify-center"
                    style={{ background: item.uploaded ? "#d1fae5" : "#1e2a4a", color: item.uploaded ? "#059669" : "#e2e8f0", fontSize: "0.72rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
                    {item.uploaded ? <><Check className="w-3 h-3" /> Live</> : <><Upload className="w-3 h-3" /> Upload</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add card */}
        <button onClick={() => { setEditingItem(undefined); setShowUpload(true); }} className="bg-white rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer"
          style={{ border: "2px dashed #d1d5db", minHeight: 280 }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#2563eb")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#d1d5db")}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#eff6ff" }}>
            <Plus className="w-6 h-6" style={{ color: "#2563eb" }} />
          </div>
          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#6b7280" }}>{tr("uploadNew", lang)}</p>
        </button>
      </div>

      {showUpload && <ItemFormModal lang={lang} initial={editingItem} onClose={() => { setShowUpload(false); setEditingItem(undefined); }} onSave={handleSave} />}
      {showConfirm && <ConfirmDialog lang={lang} draftCount={draftItems.length} onConfirm={handleUploadAll} onCancel={() => setShowConfirm(false)} />}
      {showPreview && <CustomerPage items={items} onClose={() => setShowPreview(false)} />}
    </div>
  );
}
