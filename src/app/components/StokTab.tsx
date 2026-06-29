import { useState, useRef } from "react";
import { marketingItems, MarketingItem, SizeQty, ItemCategory, ItemCondition } from "./data";
import { formatRupiah } from "./DashboardTab";
import { Lang } from "./i18n";
import { ArrowLeft, Plus, Edit2, Package, AlertTriangle, ImageIcon, X } from "lucide-react";

export type StokProduct = {
  id: string;
  name: string;
  category: ItemCategory | string;
  condition: ItemCondition | string;
  sizes: SizeQty[];
  price: number;
  photos: string[];
};

export function buildStokList(items: MarketingItem[]): StokProduct[] {
  const result: StokProduct[] = [];
  items.forEach((item) => {
    if (item.frameCount === 1) {
      result.push({
        id: item.id,
        name: item.itemName,
        category: item.category,
        condition: item.condition,
        sizes: item.sizes.length > 0 ? item.sizes : [{ size: "Free Size", quantity: item.totalQuantity }],
        price: item.frameSlots[0]?.price ?? 0,
        photos: item.frameSlots[0]?.photo ? [item.frameSlots[0].photo] : [],
      });
    } else {
      item.frameSlots.forEach((slot, i) => {
        result.push({
          id: `${item.id}-slot${i}`,
          name: slot.itemName || `${item.itemName} (${slot.positionLabel})`,
          category: slot.category ?? item.category,
          condition: slot.condition ?? item.condition,
          sizes: slot.sizes && slot.sizes.length > 0 ? slot.sizes : [{ size: "Free Size", quantity: slot.quantity }],
          price: slot.price,
          photos: slot.photo ? [slot.photo] : [],
        });
      });
    }
  });
  return result;
}

// ── Size row with inline +/- ──────────────────────────────────────────────────
function SizeStokRow({ sq, onChange }: { sq: SizeQty; onChange: (sq: SizeQty) => void }) {
  const isHabis = sq.quantity === 0;
  return (
    <div className="flex items-center gap-2 py-1.5 px-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151", minWidth: 48 }}>{sq.size}</span>
      {isHabis && (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "#fee2e2", color: "#dc2626", fontSize: "0.62rem", fontWeight: 700 }}>
          <AlertTriangle className="w-2.5 h-2.5" /> Stok Habis
        </span>
      )}
      <div style={{ flex: 1 }} />
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onChange({ ...sq, quantity: Math.max(0, sq.quantity - 1) })}
          style={{ width: 28, height: 28, borderRadius: 8, background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
        <span style={{ fontSize: "0.95rem", fontWeight: 800, color: isHabis ? "#dc2626" : "#1a1d2e", minWidth: 24, textAlign: "center" }}>
          {sq.quantity}
        </span>
        <button type="button" onClick={() => onChange({ ...sq, quantity: sq.quantity + 1 })}
          style={{ width: 28, height: 28, borderRadius: 8, background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────
function StokCard({ product, onUpdateSizes, onEdit }: {
  product: StokProduct;
  onUpdateSizes: (sizes: SizeQty[]) => void;
  onEdit: () => void;
}) {
  const totalStok = product.sizes.reduce((a, s) => a + s.quantity, 0);
  const allHabis = totalStok === 0;
  const thumb = product.photos[0];

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1.5px solid ${allHabis ? "#fecaca" : "rgba(0,0,0,0.06)"}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: allHabis ? "#fef2f2" : "#f8fafc" }}>
        {/* Thumbnail */}
        <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {thumb
            ? <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <Package className="w-5 h-5" style={{ color: allHabis ? "#dc2626" : "#93c5fd" }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a1d2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</p>
          <div className="flex gap-1.5 mt-0.5 flex-wrap">
            <span className="px-1.5 py-0.5 rounded-full" style={{ background: "#e0e7ff", color: "#3730a3", fontSize: "0.58rem", fontWeight: 600 }}>{product.category}</span>
            <span className="px-1.5 py-0.5 rounded-full" style={{ background: "#f3f4f6", color: "#6b7280", fontSize: "0.58rem", fontWeight: 600 }}>{product.condition}</span>
            <span className="px-1.5 py-0.5 rounded-full" style={{ background: allHabis ? "#fee2e2" : "#d1fae5", color: allHabis ? "#dc2626" : "#059669", fontSize: "0.58rem", fontWeight: 700 }}>
              {allHabis ? "Stok Habis" : `${totalStok} stok`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {product.price > 0 && (
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb" }}>{formatRupiah(product.price)}</span>
          )}
          <button onClick={onEdit}
            style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#374151" }}>
            <Edit2 className="w-3 h-3" /> Edit
          </button>
        </div>
      </div>

      {/* Photos strip (if more than 1) */}
      {product.photos.length > 1 && (
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto" style={{ background: "#fafafa", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
          {product.photos.map((ph, i) => (
            <img key={i} src={ph} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(0,0,0,0.08)" }} />
          ))}
        </div>
      )}

      {/* Size rows */}
      <div>
        {product.sizes.map((sq, i) => (
          <SizeStokRow key={i} sq={sq}
            onChange={(updated) => {
              const newSizes = product.sizes.map((s, idx) => idx === i ? updated : s);
              onUpdateSizes(newSizes);
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Edit modal (sizes only) ───────────────────────────────────────────────────
function EditSizeModal({ product, onClose, onSave }: {
  product: StokProduct; onClose: () => void; onSave: (sizes: SizeQty[]) => void;
}) {
  const [sizes, setSizes] = useState<SizeQty[]>(product.sizes.map((s) => ({ ...s })));
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full sm:max-w-md overflow-y-auto" style={{ borderRadius: "1.5rem 1.5rem 0 0", maxHeight: "80vh" }}>
        <div className="flex items-center gap-3 px-5 py-4 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowLeft className="w-4 h-4" /> Batal
          </button>
          <h3 style={{ flex: 1, fontSize: "0.92rem", fontWeight: 700, color: "#1a1d2e" }}>Edit Stok — {product.name}</h3>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="space-y-2">
            {sizes.map((sq, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={sq.size} onChange={(e) => setSizes((p) => p.map((s, idx) => idx === i ? { ...s, size: e.target.value } : s))}
                  placeholder="S / M / 36" className="flex-1 px-3 py-2 rounded-lg outline-none"
                  style={{ border: "1.5px solid #e5e7eb", fontSize: "0.85rem", background: "#f9fafb", color: "#1a1d2e" }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
                <button type="button" onClick={() => setSizes((p) => p.map((s, idx) => idx === i ? { ...s, quantity: Math.max(0, s.quantity - 1) } : s))}
                  style={{ width: 32, height: 32, borderRadius: 8, background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "1rem" }}>−</button>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: sq.quantity === 0 ? "#dc2626" : "#1a1d2e", minWidth: 24, textAlign: "center" }}>{sq.quantity}</span>
                <button type="button" onClick={() => setSizes((p) => p.map((s, idx) => idx === i ? { ...s, quantity: s.quantity + 1 } : s))}
                  style={{ width: 32, height: 32, borderRadius: 8, background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "1rem" }}>+</button>
                {sizes.length > 1 && (
                  <button type="button" onClick={() => setSizes((p) => p.filter((_, idx) => idx !== i))}
                    style={{ width: 32, height: 32, borderRadius: 8, background: "#fee2e2", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "#dc2626" }}>✕</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setSizes((p) => [...p, { size: "", quantity: 1 }])}
            style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <Plus className="w-3.5 h-3.5" /> Tambah Ukuran
          </button>
          <button type="button" onClick={() => { onSave(sizes); onClose(); }}
            style={{ width: "100%", background: "#1e2a4a", color: "#e2e8f0", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: "0.92rem", cursor: "pointer" }}>
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add product modal ─────────────────────────────────────────────────────────
const CATS: ItemCategory[] = ["Clothes", "Mens", "Women", "Pants", "Bags", "Electronics", "Miscellaneous"];
const CONDS: { key: ItemCondition; color: string; bg: string }[] = [
  { key: "Brand New", color: "#059669", bg: "#d1fae5" },
  { key: "Like New",  color: "#2563eb", bg: "#dbeafe" },
  { key: "Used",      color: "#d97706", bg: "#fef3c7" },
];

export function AddProductModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (p: StokProduct) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState<SizeQty[]>([{ size: "", quantity: 1 }]);
  const [cat, setCat] = useState<ItemCategory>("Clothes");
  const [cond, setCond] = useState<ItemCondition>("Like New");
  const [photos, setPhotos] = useState<string[]>([]);
  const photoRef = useRef<HTMLInputElement>(null);

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - photos.length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotos((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white w-full sm:max-w-md overflow-y-auto" style={{ borderRadius: "1.5rem 1.5rem 0 0", maxHeight: "90vh" }}>
        <div className="flex items-center gap-3 px-5 py-4 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowLeft className="w-4 h-4" /> Batal
          </button>
          <h3 style={{ flex: 1, fontSize: "0.92rem", fontWeight: 700, color: "#1a1d2e" }}>Tambah Produk Baru</h3>
        </div>
        <div className="px-5 py-5 space-y-5">
          {/* Photos */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
              Foto Produk ({photos.length}/10)
            </label>
            <div className="flex flex-wrap gap-2">
              {photos.map((ph, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={ph} alt="" style={{ width: 68, height: 68, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }} />
                  <button type="button" onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                    style={{ position: "absolute", top: -6, right: -6, background: "#dc2626", border: "none", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X className="w-2.5 h-2.5" style={{ color: "#fff" }} />
                  </button>
                </div>
              ))}
              {photos.length < 10 && (
                <button type="button" onClick={() => photoRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-xl"
                  style={{ width: 68, height: 68, border: "2px dashed #d1d5db", background: "#f9fafb", cursor: "pointer" }}>
                  <ImageIcon className="w-4 h-4" style={{ color: "#9ca3af" }} />
                  <span style={{ fontSize: "0.58rem", color: "#9ca3af", marginTop: 3 }}>Tambah</span>
                </button>
              )}
            </div>
            <input ref={photoRef} type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display: "none" }} />
          </div>

          {/* Name */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Nama Produk *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama produk..."
              className="w-full px-3 py-2.5 rounded-lg outline-none"
              style={{ border: "1.5px solid #e5e7eb", fontSize: "0.88rem", background: "#f9fafb", color: "#1a1d2e" }}
              onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
          </div>

          {/* Price */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Harga (IDR)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="185000"
              className="w-full px-3 py-2.5 rounded-lg outline-none"
              style={{ border: "1.5px solid #e5e7eb", fontSize: "0.88rem", background: "#f9fafb", color: "#1a1d2e" }}
              onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Jenis Item</label>
            <div className="flex flex-wrap gap-2">
              {CATS.map((c) => (
                <button key={c} type="button" onClick={() => setCat(c)}
                  style={{ background: cat === c ? "#1e2a4a" : "#f3f4f6", color: cat === c ? "#e2e8f0" : "#374151", border: "none", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Kondisi Item</label>
            <div className="flex gap-2 flex-wrap">
              {CONDS.map((c) => (
                <button key={c.key} type="button" onClick={() => setCond(c.key)}
                  style={{ background: cond === c.key ? c.bg : "#f3f4f6", border: `1.5px solid ${cond === c.key ? c.color : "transparent"}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, color: cond === c.key ? c.color : "#374151" }}>
                  {c.key}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Ukuran &amp; Stok *</label>
            <div className="space-y-2">
              {sizes.map((sq, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={sq.size} onChange={(e) => setSizes((p) => p.map((s, idx) => idx === i ? { ...s, size: e.target.value } : s))}
                    placeholder="S / M / 36" className="flex-1 px-3 py-2 rounded-lg outline-none"
                    style={{ border: "1.5px solid #e5e7eb", fontSize: "0.85rem", background: "#f9fafb", color: "#1a1d2e" }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")} onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />
                  <button type="button" onClick={() => setSizes((p) => p.map((s, idx) => idx === i ? { ...s, quantity: Math.max(0, s.quantity - 1) } : s))}
                    style={{ width: 32, height: 32, borderRadius: 8, background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "1rem" }}>−</button>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a1d2e", minWidth: 22, textAlign: "center" }}>{sq.quantity}</span>
                  <button type="button" onClick={() => setSizes((p) => p.map((s, idx) => idx === i ? { ...s, quantity: s.quantity + 1 } : s))}
                    style={{ width: 32, height: 32, borderRadius: 8, background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: "1rem" }}>+</button>
                  {sizes.length > 1 && (
                    <button type="button" onClick={() => setSizes((p) => p.filter((_, idx) => idx !== i))}
                      style={{ width: 32, height: 32, borderRadius: 8, background: "#fee2e2", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "#dc2626" }}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setSizes((p) => [...p, { size: "", quantity: 1 }])}
              style={{ marginTop: 8, background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <Plus className="w-3.5 h-3.5" /> Tambah Ukuran
            </button>
          </div>

          <button type="button"
            onClick={() => {
              if (!name.trim()) return;
              onAdd({ id: `STOK-${Date.now()}`, name, category: cat, condition: cond, sizes, price: parseInt(price) || 0, photos });
              onClose();
            }}
            style={{ width: "100%", background: "#1e2a4a", color: "#e2e8f0", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: "0.92rem", cursor: "pointer" }}>
            Tambah Produk
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main StokTab ──────────────────────────────────────────────────────────────
export function StokTab({ lang, onBack }: { lang: Lang; onBack?: () => void }) {
  const [products, setProducts] = useState<StokProduct[]>(() => buildStokList(marketingItems));
  const [editingProduct, setEditingProduct] = useState<StokProduct | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toString().toLowerCase().includes(search.toLowerCase())
  );

  const updateSizes = (id: string, sizes: SizeQty[]) =>
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, sizes } : p));

  const totalStok = products.reduce((a, p) => a + p.sizes.reduce((b, s) => b + s.quantity, 0), 0);
  const habisCount = products.filter((p) => p.sizes.every((s) => s.quantity === 0)).length;

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
            {lang === "id" ? "Stok Produk" : "Product Stock"}
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: 2 }}>
            {lang === "id" ? "Kelola ukuran dan jumlah stok per produk" : "Manage sizes and stock per product"}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg"
          style={{ background: "#1e2a4a", color: "#e2e8f0", fontSize: "0.82rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
          <Plus className="w-4 h-4" /> Tambah Produk Baru
        </button>
      </div>

      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#dbeafe", border: "1px solid #93c5fd" }}>
          <Package className="w-3.5 h-3.5" style={{ color: "#2563eb" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1e40af" }}>{products.length} produk</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#d1fae5", border: "1px solid #6ee7b7" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#065f46" }}>{totalStok} total stok</span>
        </div>
        {habisCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}>
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#dc2626" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#b91c1c" }}>{habisCount} stok habis</span>
          </div>
        )}
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder={lang === "id" ? "Cari produk..." : "Search products..."}
        className="rounded-lg px-3 py-2 outline-none w-full sm:w-72"
        style={{ border: "1.5px solid #e5e7eb", fontSize: "0.85rem", background: "#fff", color: "#1a1d2e" }}
        onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")} />

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {filtered.map((p) => (
          <StokCard key={p.id} product={p}
            onUpdateSizes={(sizes) => updateSizes(p.id, sizes)}
            onEdit={() => setEditingProduct(p)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
              {lang === "id" ? "Tidak ada produk ditemukan" : "No products found"}
            </p>
          </div>
        )}
      </div>

      {editingProduct && (
        <EditSizeModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={(sizes) => { updateSizes(editingProduct.id, sizes); setEditingProduct(null); }}
        />
      )}
      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onAdd={(p) => setProducts((prev) => [p, ...prev])}
        />
      )}
    </div>
  );
}
