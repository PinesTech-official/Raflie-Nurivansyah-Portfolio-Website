import { useState } from "react";
import { buyerChatThreads, sellerChatThreads, ChatThread, ChatMessage, buyerOrders, sellerItems } from "./data";
import { StatusBadge, formatRupiah } from "./DashboardTab";
import { Lang, tr } from "./i18n";
import {
  Send, ArrowLeft, Package, MapPin, Truck, CheckSquare, Square,
  ShoppingCart, Store, DollarSign, X, Check,
} from "lucide-react";

// Inline order card inside chat
function OrderCard({ orderId, type }: { orderId: string; type: "buyer" | "seller" }) {
  if (type === "buyer") {
    const order = buyerOrders.find((o) => o.id === orderId);
    if (!order) return null;
    return (
      <div className="rounded-xl overflow-hidden mt-2" style={{ background: "#fff", border: "1.5px solid #bfdbfe", maxWidth: 280 }}>
        <div className="px-3 py-2 flex items-center gap-1.5" style={{ background: "#eff6ff", borderBottom: "1px solid #bfdbfe" }}>
          <Package className="w-3.5 h-3.5" style={{ color: "#2563eb" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1d4ed8" }}>{orderId}</span>
        </div>
        <div className="px-3 py-2.5 space-y-1.5">
          <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1d2e" }}>{order.itemName}</p>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" style={{ color: "#9ca3af" }} />
            <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>{order.city}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3 h-3" style={{ color: "#9ca3af" }} />
              <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{order.shippingService}</span>
            </div>
            <StatusBadge status={order.shippingStatus} />
          </div>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#16a34a" }}>{formatRupiah(order.totalPrice)}</p>
        </div>
      </div>
    );
  } else {
    const item = sellerItems.find((s) => s.id === orderId);
    if (!item) return null;
    return (
      <div className="rounded-xl overflow-hidden mt-2" style={{ background: "#fff", border: "1.5px solid #ddd6fe", maxWidth: 280 }}>
        <div className="px-3 py-2 flex items-center gap-1.5" style={{ background: "#faf5ff", borderBottom: "1px solid #ddd6fe" }}>
          <Package className="w-3.5 h-3.5" style={{ color: "#7c3aed" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6d28d9" }}>{orderId}</span>
        </div>
        <div className="px-3 py-2.5 space-y-1.5">
          <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1d2e" }}>{item.itemName}</p>
          <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>Size {item.size} · Qty {item.quantity}</p>
          <div className="flex items-center gap-1.5">
            {item.disbursed
              ? <><CheckSquare className="w-3 h-3" style={{ color: "#059669" }} /><span style={{ fontSize: "0.7rem", color: "#059669", fontWeight: 600 }}>Sudah Cair</span></>
              : <><Square className="w-3 h-3" style={{ color: "#d97706" }} /><span style={{ fontSize: "0.7rem", color: "#d97706", fontWeight: 600 }}>Belum Cair</span></>}
          </div>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#7c3aed" }}>{formatRupiah(item.sellingPrice * item.quantity)}</p>
        </div>
      </div>
    );
  }
}

// Negotiate offer card in chat
function NegotiateCard({ amount }: { amount: number }) {
  return (
    <div className="rounded-xl overflow-hidden mt-2" style={{ background: "#fff", border: "1.5px solid #fde68a", maxWidth: 220 }}>
      <div className="px-3 py-2 flex items-center gap-1.5" style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a" }}>
        <DollarSign className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#92400e" }}>Penawaran Harga / Price Offer</span>
      </div>
      <div className="px-3 py-2.5">
        <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "#d97706" }}>{formatRupiah(amount)}</p>
        <p style={{ fontSize: "0.68rem", color: "#9ca3af", marginTop: 2 }}>Negosiasi dari seller</p>
      </div>
    </div>
  );
}

type AdminRole = "admin" | "buyer_admin" | "seller_admin" | "marketing_admin";

interface ChatTabProps {
  lang: Lang;
  onBack?: () => void;
  userRole?: AdminRole;
}

export function ChatTab({ lang, onBack, userRole = "admin" }: ChatTabProps) {
  // Filter available threads based on admin role
  const availableThreads = (() => {
    if (userRole === "buyer_admin") return buyerChatThreads;
    if (userRole === "seller_admin") return sellerChatThreads;
    return [...buyerChatThreads, ...sellerChatThreads];
  })();

  const [threads, setThreads] = useState<ChatThread[]>(availableThreads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const isSuperAdmin = userRole === "admin";
  const [filterType, setFilterType] = useState<"all" | "buyer" | "seller">(
    userRole === "buyer_admin" ? "buyer" : userRole === "seller_admin" ? "seller" : "all"
  );
  // Negotiate panel state
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [negotiateAmount, setNegotiateAmount] = useState("");

  const active = threads.find((t) => t.id === activeId);

  const filteredThreads = threads.filter((t) => {
    if (filterType === "all") return true;
    return t.threadType === filterType;
  });

  const sendMessage = (text?: string, negotiationOffer?: number) => {
    const msgText = text ?? input.trim();
    if (!msgText && !negotiationOffer) return;
    if (!activeId) return;
    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      sender: "admin",
      text: msgText || (negotiationOffer ? `Penawaran harga: ${formatRupiah(negotiationOffer)}` : ""),
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      negotiationOffer,
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? { ...t, messages: [...t.messages, msg], lastMessage: msg.text, lastTime: msg.time, unread: 0 }
          : t
      )
    );
    setInput("");
  };

  const sendNegotiate = () => {
    const amount = parseInt(negotiateAmount.replace(/\D/g, ""));
    if (!amount || amount <= 0) return;
    sendMessage(undefined, amount);
    setNegotiateAmount("");
    setShowNegotiate(false);
  };

  const markRead = (id: string) => {
    setThreads((prev) => prev.map((t) => t.id === id ? { ...t, unread: 0 } : t));
    setActiveId(id);
    setShowNegotiate(false);
  };

  const totalUnread = threads.reduce((a, t) => a + t.unread, 0);

  return (
    <div className="space-y-4" style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ flexShrink: 0 }}>
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: "#f3f4f6", border: "none", cursor: "pointer", color: "#374151", fontSize: "0.8rem", fontWeight: 600 }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </button>
          )}
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1d2e" }}>
              {lang === "id" ? "Chat Customer" : "Customer Chat"}
              {totalUnread > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full" style={{ background: "#2563eb", color: "#fff", fontSize: "0.68rem", fontWeight: 700 }}>
                  {totalUnread}
                </span>
              )}
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>
              {userRole === "buyer_admin"
                ? (lang === "id" ? "Pesan dari buyer" : "Messages from buyers")
                : userRole === "seller_admin"
                ? (lang === "id" ? "Pesan dari seller" : "Messages from sellers")
                : (lang === "id" ? "Semua pesan dari buyer dan seller" : "All messages from buyers and sellers")}
            </p>
          </div>
        </div>
        {/* Type filter — only shown for super admin who sees both types */}
        {isSuperAdmin && (
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px solid #e5e7eb" }}>
            {(["all", "buyer", "seller"] as const).map((t) => (
              <button key={t} onClick={() => setFilterType(t)}
                className="flex items-center gap-1.5 px-3 py-2"
                style={{ background: filterType === t ? "#1e2a4a" : "#fff", color: filterType === t ? "#fff" : "#6b7280", fontSize: "0.78rem", fontWeight: 600, border: "none", cursor: "pointer" }}>
                {t === "buyer" && <ShoppingCart className="w-3 h-3" />}
                {t === "seller" && <Store className="w-3 h-3" />}
                {t === "all" ? (lang === "id" ? "Semua" : "All") : t === "buyer" ? "Buyer" : "Seller"}
                {(() => {
                  const count = threads.filter((th) => th.threadType === t || t === "all").reduce((a, th) => a + th.unread, 0);
                  return count > 0 ? (
                    <span style={{ background: "#2563eb", color: "#fff", fontSize: "0.58rem", fontWeight: 700, borderRadius: 99, padding: "0 5px" }}>{count}</span>
                  ) : null;
                })()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat layout */}
      <div className="flex flex-1 min-h-0 bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {/* Thread list */}
        <div style={{ width: 260, borderRight: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 }}>
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", flexShrink: 0 }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b7280" }}>
              {filteredThreads.length} {lang === "id" ? "percakapan" : "conversations"}
            </p>
          </div>
          {filteredThreads.map((thread) => {
            const isBuyer = thread.threadType === "buyer";
            return (
              <button key={thread.id} onClick={() => markRead(thread.id)}
                style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: activeId === thread.id ? "#eff6ff" : "transparent", borderBottom: "1px solid rgba(0,0,0,0.04)", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
                onMouseEnter={(e) => { if (activeId !== thread.id) (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                onMouseLeave={(e) => { if (activeId !== thread.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: isBuyer ? "#dbeafe" : "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: isBuyer ? "#2563eb" : "#7c3aed" }}>{thread.avatar}</span>
                  </div>
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: isBuyer ? "#2563eb" : "#7c3aed", border: "1.5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isBuyer ? <ShoppingCart style={{ width: 5, height: 5, color: "#fff" }} /> : <Store style={{ width: 5, height: 5, color: "#fff" }} />}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1d2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{thread.customerName}</p>
                    <span style={{ fontSize: "0.62rem", color: "#9ca3af", flexShrink: 0, marginLeft: 4 }}>{thread.lastTime}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: "0.72rem", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{thread.lastMessage}</p>
                    {thread.unread > 0 && (
                      <span style={{ background: "#2563eb", color: "#fff", fontSize: "0.6rem", fontWeight: 700, borderRadius: 99, padding: "1px 6px", marginLeft: 4, flexShrink: 0 }}>{thread.unread}</span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.6rem", color: isBuyer ? "#2563eb" : "#7c3aed", fontWeight: 600 }}>
                    {isBuyer ? "Buyer" : "Seller"}
                  </span>
                </div>
              </button>
            );
          })}
          {filteredThreads.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-8">
              <p style={{ fontSize: "0.82rem", color: "#9ca3af", textAlign: "center" }}>Tidak ada percakapan</p>
            </div>
          )}
        </div>

        {/* Conversation */}
        {active ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fff", flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: active.threadType === "buyer" ? "#dbeafe" : "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: active.threadType === "buyer" ? "#2563eb" : "#7c3aed" }}>{active.avatar}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a1d2e" }}>{active.customerName}</p>
                <p style={{ fontSize: "0.68rem", color: active.threadType === "buyer" ? "#2563eb" : "#7c3aed", fontWeight: 600 }}>
                  {active.threadType === "buyer" ? "● Buyer" : "● Seller"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: "#f8fafc" }}>
              {active.messages.map((msg) => {
                const isAdmin = msg.sender === "admin";
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: isAdmin ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "75%" }}>
                      {!isAdmin && (
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: active.threadType === "buyer" ? "#dbeafe" : "#ede9fe", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: "0.5rem", fontWeight: 800, color: active.threadType === "buyer" ? "#2563eb" : "#7c3aed" }}>{active.avatar}</span>
                        </div>
                      )}
                      <div style={{
                        padding: "10px 14px",
                        borderRadius: isAdmin ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                        background: isAdmin ? "#1e2a4a" : "#fff",
                        color: isAdmin ? "#e2e8f0" : "#1a1d2e",
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}>
                        {msg.text}
                        {msg.orderRef && <OrderCard orderId={msg.orderRef} type={active.threadType} />}
                        {msg.negotiationOffer && <NegotiateCard amount={msg.negotiationOffer} />}
                      </div>
                      <p style={{ fontSize: "0.6rem", color: "#9ca3af", marginTop: 3, textAlign: isAdmin ? "right" : "left" }}>{msg.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Negotiate panel (seller only) */}
            {active.threadType === "seller" && showNegotiate && (
              <div className="px-4 py-3" style={{ background: "#fffbeb", borderTop: "1px solid #fde68a", flexShrink: 0 }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#92400e", marginBottom: 8 }}>
                  💰 Kirim Penawaran Harga / Send Price Offer
                </p>
                <div className="flex gap-2">
                  <div style={{ position: "relative", flex: 1 }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: "0.82rem", color: "#6b7280" }}>Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={negotiateAmount}
                      onChange={(e) => setNegotiateAmount(e.target.value.replace(/\D/g, ""))}
                      placeholder="0"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg outline-none"
                      style={{ border: "1.5px solid #fde68a", fontSize: "0.88rem", background: "#fff", color: "#1a1d2e" }}
                    />
                  </div>
                  <button onClick={sendNegotiate}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg"
                    style={{ background: "#d97706", color: "#fff", fontSize: "0.82rem", fontWeight: 700, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                    <Check className="w-3.5 h-3.5" /> Kirim
                  </button>
                  <button onClick={() => setShowNegotiate(false)}
                    style={{ background: "#f3f4f6", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}>
                    <X className="w-4 h-4" style={{ color: "#6b7280" }} />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "#fff", flexShrink: 0 }}>
              {/* Negotiate button (seller only) */}
              {active.threadType === "seller" && (
                <button
                  onClick={() => setShowNegotiate(!showNegotiate)}
                  title={lang === "id" ? "Kirim penawaran harga" : "Send price offer"}
                  style={{
                    background: showNegotiate ? "#fef3c7" : "#f3f4f6",
                    border: showNegotiate ? "1.5px solid #fde68a" : "1.5px solid transparent",
                    borderRadius: 10,
                    width: 38,
                    height: 38,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.15s",
                  }}
                >
                  <DollarSign className="w-4 h-4" style={{ color: showNegotiate ? "#d97706" : "#6b7280" }} />
                </button>
              )}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={lang === "id" ? "Ketik pesan..." : "Type a message..."}
                className="flex-1 px-3 py-2.5 rounded-xl outline-none"
                style={{ border: "1.5px solid #e5e7eb", fontSize: "0.85rem", background: "#f8fafc", color: "#1a1d2e" }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button onClick={() => sendMessage()}
                style={{ background: "#1e2a4a", border: "none", borderRadius: 12, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <Send className="w-4 h-4" style={{ color: "#e2e8f0" }} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.88rem", color: "#9ca3af" }}>
                {lang === "id" ? "Pilih percakapan untuk mulai balas" : "Select a conversation to start replying"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
