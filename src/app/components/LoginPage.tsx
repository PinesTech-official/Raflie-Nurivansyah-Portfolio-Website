import { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";

interface LoginPageProps {
  onLogin: (role: "admin" | "buyer_admin" | "seller_admin" | "marketing_admin") => void;
}

const USERS = [
  { username: "admin", password: "admin123", role: "admin" as const, label: "Super Admin" },
  { username: "buyer", password: "buyer123", role: "buyer_admin" as const, label: "Admin Buyer" },
  { username: "seller", password: "seller123", role: "seller_admin" as const, label: "Admin Seller" },
  { username: "marketing", password: "mkt123", role: "marketing_admin" as const, label: "Admin Marketing" },
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const user = USERS.find((u) => u.username === username && u.password === password);
    if (user) {
      onLogin(user.role);
    } else {
      setError("Username atau password salah.");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #1e2a4a 0%, #2d3f6b 50%, #1e3a5f 100%)" }}
    >
      <div className="w-full max-w-md px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white" style={{ fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
            Admin Panel
          </h1>
          <p style={{ color: "#94a3b8", marginTop: "0.2rem", fontSize: "0.85rem" }}>
            Dashboard Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-8">
            <h2 className="mb-1" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1a1d2e" }}>
              Masuk ke Dashboard
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
              Masukkan kredensial akun Anda
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  className="block mb-1.5"
                  style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}
                >
                  Username
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "#9ca3af" }}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all"
                    style={{
                      border: "1.5px solid #e5e7eb",
                      fontSize: "0.88rem",
                      background: "#f9fafb",
                      color: "#1a1d2e",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className="block mb-1.5"
                  style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: "#9ca3af" }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg outline-none transition-all"
                    style={{
                      border: "1.5px solid #e5e7eb",
                      fontSize: "0.88rem",
                      background: "#f9fafb",
                      color: "#1a1d2e",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="rounded-lg px-4 py-3"
                  style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
                >
                  <p style={{ color: "#dc2626", fontSize: "0.82rem" }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg transition-all mt-2"
                style={{
                  background: loading ? "#93c5fd" : "#2563eb",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) =>
                  !loading && ((e.target as HTMLElement).style.background = "#1d4ed8")
                }
                onMouseLeave={(e) =>
                  !loading && ((e.target as HTMLElement).style.background = "#2563eb")
                }
              >
                {loading ? "Memverifikasi..." : "Masuk"}
              </button>
            </form>
          </div>

          {/* Demo accounts */}
          <div
            className="px-8 py-4"
            style={{ background: "#f8fafc", borderTop: "1px solid #e5e7eb" }}
          >
            <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
              Demo akun:
            </p>
            <div className="flex flex-wrap gap-2">
              {USERS.map((u) => (
                <button
                  key={u.username}
                  type="button"
                  onClick={() => {
                    setUsername(u.username);
                    setPassword(u.password);
                    setError("");
                  }}
                  className="px-3 py-1 rounded-full transition-all"
                  style={{
                    background: "#e0e7ff",
                    color: "#3730a3",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
