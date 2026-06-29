import { useState } from "react";
import { ChatThread, ChatMessage, BuyerOrder, SellerItem, buyerOrders, sellerItems } from "./data";
import { Lang, tr } from "./i18n";
import { Send, ArrowLeft, Package, MapPin, Truck, CheckSquare, Square } from "lucide-react";
import { StatusBadge, formatRupiah } from "./DashboardTab";

// Inline order card referenced in chat
function OrderCard({ orderId, type }: { orderId: string; type: "buyer" | "seller" }) {
  if (type === "buyer") {
    const order = buyerOrders.find((o) => o.id === orderId);
    if (!order) return null;
    return (
      <div className="rounded-xl overflow-hidden mt-2" style={{ background: "#fff", border: "1.5px solid #bfdbfe", maxWidth: 280 }}>
        <div className="px-3 py-2" style={{ background: "#eff6ff", borderBottom: "1px solid #bfdbfe" }}>
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" style={{ color: "#2563eb" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1d4ed8" }}>{tr("followUpOrder", "id")} — {order.id}</span>
          </div>
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
        <div className="px-3 py-2" style={{ background: "#faf5ff", borderBottom: "1px solid #ddd6fe" }}>
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" style={{ color: "#7c3aed" }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6d28d9" }}>{tr("followUpOrder", "id")} — {item.id}</span>
          </div>
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

interface ChatSectionProps {
  threads: ChatThread[];
  type: "buyer" | "seller";
  lang: Lang;
}

export function ChatSection({ threads: initialThreads, type, lang }: ChatSectionProps) {
  const [threads, setThreads] = useState<ChatThread[]>(initialThreads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const active = threads.find((t) => t.id === activeId);

  const sendMessage = () => {
    if (!input.trim() || !activeId) return;
    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      sender: "admin",
      text: input.trim(),
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? { ...t, messages: [...t.messages, msg], lastMessage: input.trim(), lastTime: msg.time, unread: 0 }
          : t
      )
    );
    setInput("");
  };

  const markRead = (id: string) => {
    setThreads((prev) => prev.map((t) => t.id === id ? { ...t, unread: 0 } : t));
    setActiveId(id);
  };

  return (
    <div className="flex" style={{ height: "calc(100vh - 160px)", minHeight: 400, background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      {/* Thread list */}
      <div
        className="flex-shrink-0"
        style={{
          width: active && window.innerWidth < 640 ? 0 : 260,
          borderRight: "1px solid rgba(0,0,0,0.06)",
          overflowY: "auto",
          transition: "width 0.2s",
          display: active && window.innerWidth < 640 ? "none" : "flex",
          flexDirection: "column",
        }}
      >
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a1d2e" }}>{tr("chatTitle", lang)}</h3>
          <p style={{ fontSize: "0.72rem", color: "#6b7280" }}>{tr("chatSubtitle", lang)}</p>
        </div>
        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => markRead(thread.id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "12px 14px",
              background: activeId === thread.id ? "#eff6ff" : "transparent",
              borderBottom: "1px solid rgba(0,0,0,0.04)",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (activeId !== thread.id) (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
            onMouseLeave={(e) => { if (activeId !== thread.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: type === "buyer" ? "#dbeafe" : "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: type === "buyer" ? "#2563eb" : "#7c3aed" }}>{thread.avatar}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1d2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{thread.customerName}</p>
                <span style={{ fontSize: "0.65rem", color: "#9ca3af", flexShrink: 0, marginLeft: 4 }}>{thread.lastTime}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                <p style={{ fontSize: "0.72rem", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{thread.lastMessage}</p>
                {thread.unread > 0 && (
                  <span style={{ background: "#2563eb", color: "#fff", fontSize: "0.6rem", fontWeight: 700, borderRadius: 99, padding: "1px 6px", marginLeft: 4, flexShrink: 0 }}>{thread.unread}</span>
                )}
              </div>
            </div>
          </button>
        ))}
        {threads.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-8">
            <p style={{ fontSize: "0.82rem", color: "#9ca3af", textAlign: "center" }}>{tr("noChat", lang)}</p>
          </div>
        )}
      </div>

      {/* Conversation */}
      {active ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}>
            <button onClick={() => setActiveId(null)} className="sm:hidden p-1" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <ArrowLeft className="w-4 h-4" style={{ color: "#6b7280" }} />
            </button>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: type === "buyer" ? "#dbeafe" : "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 800, color: type === "buyer" ? "#2563eb" : "#7c3aed" }}>{active.avatar}</span>
            </div>
            <div>
              <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a1d2e" }}>{active.customerName}</p>
              <p style={{ fontSize: "0.68rem", color: "#22c55e" }}>● {tr("online", lang)}</p>
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
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: type === "buyer" ? "#dbeafe" : "#ede9fe", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: "0.55rem", fontWeight: 800, color: type === "buyer" ? "#2563eb" : "#7c3aed" }}>{active.avatar}</span>
                      </div>
                    )}
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: isAdmin ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                        background: isAdmin ? "#1e2a4a" : "#fff",
                        color: isAdmin ? "#e2e8f0" : "#1a1d2e",
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      {msg.text}
                      {msg.orderRef && <OrderCard orderId={msg.orderRef} type={type} />}
                    </div>
                    <p style={{ fontSize: "0.62rem", color: "#9ca3af", marginTop: 3, textAlign: isAdmin ? "right" : "left" }}>{msg.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={tr("typeMessage", lang)}
              className="flex-1 px-3 py-2.5 rounded-xl outline-none"
              style={{ border: "1.5px solid #e5e7eb", fontSize: "0.85rem", background: "#f8fafc", color: "#1a1d2e" }}
              onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
            <button
              onClick={sendMessage}
              style={{ background: "#1e2a4a", border: "none", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
            >
              <Send className="w-4 h-4" style={{ color: "#e2e8f0" }} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>{tr("selectChat", lang)}</p>
        </div>
      )}
    </div>
  );
}
