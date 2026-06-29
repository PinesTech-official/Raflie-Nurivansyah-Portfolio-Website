/* MARKER-MAKE-KIT-INVOKED */
import { useState, useEffect } from "react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import photo1 from "../imports/IMG_2975.JPG";
import photo2 from "../imports/eda86f7a-4ee2-46b0-9120-4c91a4668ef7.jpg";
import photo3 from "../imports/IMG_2551.JPG";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:      "#0c0c10",
  surface: "#13131a",
  lift:    "#1a1a24",
  border:  "rgba(255,255,255,0.06)",
  text:    "#e8e8f2",
  muted:   "#5a5a72",
  dim:     "#8888a8",
  accent:  "#818cf8",
  accentD: "#6366f1",
  green:   "#4ade80",
};

const display: React.CSSProperties = { fontFamily: "'DM Serif Display', Georgia, serif" };
const sans: React.CSSProperties    = { fontFamily: "'DM Sans', system-ui, sans-serif" };

// ── Responsive CSS ────────────────────────────────────────────────────────────
const STYLES = `
  /* Section padding */
  .f-section {
    padding: 80px clamp(20px, 6vw, 100px);
    max-width: 1100px;
    margin: 0 auto;
  }

  /* Hero two-col: text | photo */
  .f-hero-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: clamp(32px, 5vw, 80px);
    align-items: center;
  }
  .f-hero-photo {
    width: clamp(160px, 20vw, 260px);
    aspect-ratio: 3/4;
    border-radius: 18px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.06);
  }

  /* Stats 3-col */
  .f-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    margin-top: 64px;
    background: rgba(255,255,255,0.06);
    border-radius: 16px;
    overflow: hidden;
  }

  /* Generic two-column section grid */
  .f-two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(32px, 5vw, 72px);
    align-items: start;
  }
  .f-two-col-center {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(32px, 5vw, 72px);
    align-items: center;
  }

  /* IISMA photos grid */
  .f-photos {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 10px;
  }

  /* Experience expanded indent */
  .f-exp-body { padding-left: 48px; padding-bottom: 32px; }

  /* Nav desktop links visible */
  .f-nav-links { display: flex; gap: 32px; }
  /* Nav burger hidden on desktop */
  .f-nav-burger { display: none; }

  /* Contact buttons */
  .f-contact-btns {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 64px;
  }

  /* ── Tablet: ≤ 900px ─────────────────────────────────────────────────────── */
  @media (max-width: 900px) {
    .f-section { padding: 64px clamp(20px, 5vw, 48px); }

    .f-hero-grid {
      grid-template-columns: 1fr;
    }
    .f-hero-photo {
      width: 160px;
      aspect-ratio: 1/1;
      border-radius: 50%;
      margin: 0 auto;
      order: -1;
    }

    .f-stats { grid-template-columns: 1fr 1fr; }

    .f-two-col,
    .f-two-col-center {
      grid-template-columns: 1fr;
      gap: 36px;
    }

    .f-photos {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .f-photos > * {
      flex: 0 0 160px;
      height: 200px;
      grid-column: unset !important;
      grid-row: unset !important;
      aspect-ratio: unset !important;
    }

    .f-nav-links { display: none; }
    .f-nav-burger { display: flex; flex-direction: column; gap: 5px; }
  }

  /* ── Mobile: ≤ 600px ──────────────────────────────────────────────────────── */
  @media (max-width: 600px) {
    .f-section { padding: 56px 20px; }

    .f-stats { grid-template-columns: 1fr; }

    .f-hero-photo {
      width: 120px;
    }

    .f-exp-body { padding-left: 16px; padding-bottom: 24px; }

    .f-contact-btns { flex-direction: column; align-items: stretch; }
    .f-contact-btns a { justify-content: center; }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function Chip({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <span style={{
      ...sans,
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: 99,
      fontSize: "0.72rem",
      fontWeight: 600,
      letterSpacing: "0.03em",
      background: highlight ? C.accent + "20" : "rgba(255,255,255,0.06)",
      color: highlight ? C.accent : C.dim,
      border: `1px solid ${highlight ? C.accent + "40" : "rgba(255,255,255,0.08)"}`,
    }}>
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 44 }}>
      <span style={{ width: 28, height: 2, background: C.accent, display: "block", borderRadius: 2, flexShrink: 0 }} />
      <span style={{ ...sans, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.accent }}>
        {children}
      </span>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  const links = [
    { id: "about",      label: "About" },
    { id: "iisma",      label: "IISMA" },
    { id: "experience", label: "Experience" },
    { id: "projects",   label: "Projects" },
    { id: "education",  label: "Education" },
    { id: "contact",    label: "Contact" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 clamp(20px, 6vw, 100px)", height: 60,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(12,12,16,0.94)" : "transparent",
      borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      transition: "all 0.3s ease",
    }}>
      {/* Wordmark */}
      <button onClick={() => go("hero")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        <span style={{ ...display, fontSize: "1.15rem", fontWeight: 400, color: C.text }}>
          Raflie<em style={{ fontStyle: "italic", color: C.accent }}>.</em>
        </span>
      </button>

      {/* Desktop links */}
      <div className="f-nav-links">
        {links.map((l) => (
          <button key={l.id} onClick={() => go(l.id)}
            style={{ background: "none", border: "none", cursor: "pointer", ...sans, fontSize: "0.82rem", fontWeight: 500, color: C.muted, padding: 0, transition: "color 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = C.text)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = C.muted)}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Mobile burger */}
      <button onClick={() => setOpen(!open)} className="f-nav-burger"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}
        aria-label="Toggle menu">
        {open
          ? <span style={{ ...sans, fontSize: "1.1rem", color: C.text, lineHeight: 1 }}>✕</span>
          : [0,1,2].map((i) => (
              <span key={i} style={{ width: 22, height: 1.5, background: C.text, display: "block", borderRadius: 2 }} />
            ))
        }
      </button>

      {/* Mobile menu overlay */}
      {open && (
        <div style={{
          position: "fixed", top: 60, left: 0, right: 0,
          background: "rgba(12,12,16,0.98)", backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${C.border}`,
          padding: "16px 20px 24px",
          display: "flex", flexDirection: "column", gap: 0,
        }}>
          {links.map((l) => (
            <button key={l.id} onClick={() => go(l.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                ...sans, fontSize: "1.1rem", fontWeight: 500, color: C.dim,
                padding: "14px 0", textAlign: "left",
                borderBottom: `1px solid ${C.border}`,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = C.text)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = C.dim)}>
              {l.label}
            </button>
          ))}
          {/* Contact shortcut in mobile menu */}
          <a href="mailto:raflie01a@gmail.com"
            style={{
              ...sans, marginTop: 20, display: "block", textAlign: "center",
              padding: "13px 0", borderRadius: 10,
              background: C.accent, color: C.bg,
              fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
            }}>
            ✉ Get in touch
          </a>
        </div>
      )}
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="hero" style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center",
      padding: "80px clamp(20px, 6vw, 100px) 60px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        {/* Name + photo */}
        <div className="f-hero-grid">
          <div style={{ minWidth: 0 }}>
            {/* Status dot */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "block", boxShadow: `0 0 8px ${C.green}` }} />
              <span style={{ ...sans, fontSize: "0.72rem", color: C.muted, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Open to opportunities
              </span>
            </div>

            {/* Name */}
            <h1 style={{
              ...display,
              fontSize: "clamp(2.8rem, 8.5vw, 6.5rem)",
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: "-0.01em",
              color: C.text,
              marginBottom: 24,
            }}>
              Raflie<br />
              <em style={{ fontStyle: "italic", color: C.accent }}>Nurivansyah</em>
            </h1>

            {/* Role chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              <Chip highlight>IISMA Awardee '23</Chip>
              <Chip>Tech Enthusiast</Chip>
              <Chip>UI Designer</Chip>
              <Chip>Apple Technician</Chip>
            </div>

            {/* Bio */}
            <p style={{ ...sans, fontSize: "0.98rem", color: C.dim, lineHeight: 1.82, maxWidth: 500, marginBottom: 36 }}>
              D3 Industrial Electrical Engineering at Madura State Polytechnic, GPA 3.58/4.00.
              IISMA 2023 awardee — exchange student at{" "}
              <strong style={{ color: C.text, fontWeight: 600 }}>University of Strathclyde, Glasgow</strong>.
              Building at the intersection of technology and design.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="mailto:raflie01a@gmail.com"
                style={{
                  ...sans,
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 10,
                  background: C.accent, color: C.bg,
                  fontWeight: 700, fontSize: "0.88rem",
                  textDecoration: "none",
                  transition: "background 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = C.accentD; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = C.accent; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
                Get in touch ↗
              </a>
              <a href="https://www.linkedin.com/in/raflie-nurivansyah" target="_blank" rel="noopener"
                style={{
                  ...sans,
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 10,
                  background: "rgba(255,255,255,0.06)", color: C.text,
                  fontWeight: 600, fontSize: "0.88rem",
                  textDecoration: "none", border: `1px solid ${C.border}`,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")}>
                LinkedIn ↗
              </a>
            </div>
          </div>

          {/* Photo */}
          <div className="f-hero-photo" style={{ background: C.surface }}>
            <ImageWithFallback
              src={photo1}
              alt="Raflie at University of Strathclyde, Glasgow"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="f-stats">
          {[
            { value: "3.58", label: "GPA / 4.00",          sub: "Madura State Polytechnic" },
            { value: "550+", label: "Weekly Customers",     sub: "Apple Service Provider" },
            { value: "90%",  label: "Customer Satisfaction",sub: "Across all roles" },
          ].map(({ value, label, sub }) => (
            <div key={label} style={{ background: C.surface, padding: "clamp(20px, 3vw, 36px)", textAlign: "center" }}>
              <p style={{ ...display, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 400, color: C.accent, lineHeight: 1 }}>{value}</p>
              <p style={{ ...sans, fontSize: "0.82rem", fontWeight: 600, color: C.text, marginTop: 8 }}>{label}</p>
              <p style={{ ...sans, fontSize: "0.7rem", color: C.muted, marginTop: 4 }}>{sub}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" style={{ borderTop: `1px solid ${C.border}` }}>
      <div className="f-section">
        <SectionLabel>About</SectionLabel>
        <div className="f-two-col">
          {/* Left: bio */}
          <div>
            <h2 style={{ ...display, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 400, lineHeight: 1.2, color: C.text, marginBottom: 24 }}>
              Tech meets<br /><em style={{ fontStyle: "italic", color: C.accent }}>creativity.</em>
            </h2>
            <p style={{ ...sans, fontSize: "0.95rem", color: C.dim, lineHeight: 1.85, marginBottom: 18 }}>
              I am a tech enthusiast who consistently stays up to date with the latest advancements in technology. With a strong background as a technician, I possess extensive experience in troubleshooting and repairing Apple products.
            </p>
            <p style={{ ...sans, fontSize: "0.95rem", color: C.dim, lineHeight: 1.85 }}>
              In addition to my technical expertise, I have experience working as a store manager and administrator. Having frequently interacted with customers, I have developed strong interpersonal and communication skills.
            </p>
          </div>

          {/* Right: skills + contact card */}
          <div>
            <div style={{ ...sans, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 16 }}>
              Skills &amp; Competencies
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
              {[
                "Apple Product Repair", "Troubleshooting", "Customer Service",
                "Store Operations", "UI/UX Design", "Figma", "Microsoft Office",
                "Inventory Management", "Team Leadership", "Communication",
                "Product Knowledge", "Database Management",
              ].map((skill) => (
                <span key={skill} style={{
                  ...sans, display: "inline-block", padding: "6px 12px", borderRadius: 8,
                  background: C.lift, color: C.dim, fontSize: "0.78rem", fontWeight: 500,
                  border: `1px solid ${C.border}`,
                }}>
                  {skill}
                </span>
              ))}
            </div>

            <div style={{ padding: "20px 24px", borderRadius: 14, background: C.surface, border: `1px solid ${C.border}` }}>
              {[
                { icon: "📍", primary: "Bangkalan, Jawa Timur, Indonesia", secondary: "+62 857 3164 8703 · raflie01a@gmail.com" },
              ].map(({ icon, primary, secondary }) => (
                <div key={primary} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 1 }}>{icon}</span>
                  <div>
                    <p style={{ ...sans, fontSize: "0.87rem", fontWeight: 600, color: C.text }}>{primary}</p>
                    <p style={{ ...sans, fontSize: "0.74rem", color: C.muted, marginTop: 2 }}>{secondary}</p>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 1 }}>🌐</span>
                <a href="https://www.linkedin.com/in/raflie-nurivansyah" target="_blank" rel="noopener"
                  style={{ ...sans, fontSize: "0.87rem", fontWeight: 600, color: C.accent, textDecoration: "none" }}>
                  linkedin.com/in/raflie-nurivansyah ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── IISMA ─────────────────────────────────────────────────────────────────────
function IISMA() {
  return (
    <section id="iisma" style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}>
      <div className="f-section">
        <SectionLabel>Achievement Spotlight</SectionLabel>
        <div className="f-two-col-center">

          {/* Text */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 8,
              background: C.accent + "15", border: `1px solid ${C.accent}30`,
              marginBottom: 22,
            }}>
              <span style={{ fontSize: "0.9rem" }}>🏆</span>
              <span style={{ ...sans, fontSize: "0.7rem", fontWeight: 700, color: C.accent, letterSpacing: "0.06em", textTransform: "uppercase" }}>IISMA Awardee 2023</span>
            </div>

            <h2 style={{ ...display, fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)", fontWeight: 400, lineHeight: 1.2, color: C.text, marginBottom: 18 }}>
              Indonesian International<br />
              <em style={{ fontStyle: "italic", color: C.accent }}>Student Mobility Awards</em>
            </h2>

            <p style={{ ...sans, fontSize: "0.93rem", color: C.dim, lineHeight: 1.85, marginBottom: 16 }}>
              Selected as one of the competitive IISMA awardees, representing Indonesia at the
              <strong style={{ color: C.text }}> University of Strathclyde, Glasgow, Scotland</strong> for one semester in 2023.
            </p>
            <p style={{ ...sans, fontSize: "0.93rem", color: C.dim, lineHeight: 1.85, marginBottom: 28 }}>
              Studied alongside students from across Indonesia and around the world, gaining international academic exposure. Also visited the Indonesian Embassy in London during the program.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "🎓", text: "University of Strathclyde — Glasgow, Scotland" },
                { icon: "📜", text: "TOEIC certified — used to qualify for IISMA selection" },
                { icon: "🌍", text: "Studied alongside students from Indonesia & around the world" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: 1 }}>{icon}</span>
                  <span style={{ ...sans, fontSize: "0.87rem", color: C.dim, lineHeight: 1.65 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="f-photos">
            <div style={{ gridColumn: "1", gridRow: "1", borderRadius: 14, overflow: "hidden", aspectRatio: "3/4", background: C.lift }}>
              <ImageWithFallback
                src={photo3}
                alt="Raflie at Indonesian Embassy, London"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ gridColumn: "2", gridRow: "1 / 3", borderRadius: 14, overflow: "hidden", background: C.lift }}>
              <ImageWithFallback
                src={photo2}
                alt="IISMA Indonesia students at University of Strathclyde"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
              />
            </div>
            <div style={{
              gridColumn: "1", gridRow: "2",
              borderRadius: 14, padding: "14px 16px",
              background: C.accent + "18", border: `1px solid ${C.accent}30`,
              display: "flex", flexDirection: "column", justifyContent: "center",
            }}>
              <p style={{ ...display, fontSize: "1.7rem", fontWeight: 400, color: C.accent, lineHeight: 1 }}>2023</p>
              <p style={{ ...sans, fontSize: "0.7rem", color: C.dim, marginTop: 4, fontWeight: 500 }}>IISMA Cohort</p>
              <p style={{ ...sans, fontSize: "0.7rem", color: C.muted, marginTop: 2 }}>Glasgow, Scotland</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── Experience ────────────────────────────────────────────────────────────────
const experiences = [
  {
    company: "Luckycat Supply",
    role: "Store Manager",
    period: "Jan 2025 – Nov 2025",
    location: "East Jakarta, Indonesia",
    highlights: [
      "Managed daily store operations — offline & online — achieving 90% customer satisfaction",
      "Developed a customer database system for the buy–sell–trade business model",
      "Supervised storekeeper staff and ensured accurate inventory handling",
      "Coordinated store maintenance, facility management, and vendor relations",
      "Handled customer complaints with effective service recovery",
    ],
  },
  {
    company: "CV. iFixied Global Indonesia",
    role: "Apple Product Technician",
    period: "Mar 2024 – Sep 2024",
    location: "South Jakarta, Indonesia",
    highlights: [
      "Supported 550+ weekly customers with troubleshooting, repairs, and complaint resolution",
      "95% repair success rate — fast service without compromising quality",
      "Managed dual technical and administrative responsibilities during peak hours",
      "Worked overtime to meet urgent customer deadlines — including overnight repairs",
      "Consistently exceeded role scope by handling front-desk operations seamlessly",
    ],
  },
  {
    company: "Zhang Palace Restaurant",
    role: "Cook Helper",
    period: "Jun 2020 – Jul 2020",
    location: "Surabaya, Indonesia",
    highlights: [
      "Assisted chefs with kitchen tasks for efficient workflow and timely meal prep",
      "Prepared plates, garnishes, and dressings during service hours",
      "Maintained kitchen cleanliness to hygiene and safety standards",
    ],
  },
];

function Experience() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <section id="experience" style={{ borderTop: `1px solid ${C.border}` }}>
      <div className="f-section">
        <SectionLabel>Work Experience</SectionLabel>
        <div>
          {experiences.map((exp, i) => {
            const isOpen = expanded === i;
            return (
              <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  style={{
                    width: "100%", background: "none", border: "none", cursor: "pointer",
                    padding: "24px 0",
                    display: "flex", alignItems: "center", gap: 16,
                    textAlign: "left",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.75")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}>

                  <span style={{ ...sans, fontSize: "0.68rem", fontWeight: 700, color: C.muted, minWidth: 24, letterSpacing: "0.05em" }}>
                    0{i + 1}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ ...display, fontSize: "clamp(1rem, 2.5vw, 1.45rem)", fontWeight: 400, color: C.text }}>
                        {exp.company}
                      </span>
                      <span style={{ ...sans, fontSize: "0.8rem", color: C.muted, whiteSpace: "nowrap" }}>— {exp.role}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <span style={{ ...sans, fontSize: "0.75rem", color: C.muted, display: "none", whiteSpace: "nowrap" }}
                      className="f-exp-period">{exp.period}</span>
                    <span style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: isOpen ? C.accent : C.lift,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: isOpen ? C.bg : C.muted,
                      fontSize: "1rem",
                      transition: "all 0.2s", flexShrink: 0,
                    }}>
                      {isOpen ? "−" : "+"}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="f-exp-body">
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                      <Chip>{exp.period}</Chip>
                      <Chip>{exp.location}</Chip>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                      {exp.highlights.map((h, j) => (
                        <li key={j} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent, flexShrink: 0, marginTop: 9 }} />
                          <span style={{ ...sans, fontSize: "0.9rem", color: C.dim, lineHeight: 1.72 }}>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Projects ──────────────────────────────────────────────────────────────────
const projects = [
  {
    number: "01",
    title: "Sneakers Hype",
    desc: "A modern sneaker culture landing page — bold typography, product showcasing, and a streetwear-forward visual identity built for hype-driven audiences.",
    url: "https://sneakers-hype.vercel.app/",
    tags: ["Landing Page", "E-Commerce", "React"],
    emoji: "👟",
  },
  {
    number: "02",
    title: "Luxury Customer",
    desc: "A premium customer-facing experience for a luxury brand — refined layouts, high-end aesthetics, and a seamless browsing journey that communicates exclusivity.",
    url: "https://luxury-customer.vercel.app/",
    tags: ["Luxury Brand", "UI Design", "React"],
    emoji: "✦",
  },
  {
    number: "03",
    title: "Luxury Website",
    desc: "A second iteration of a luxury web presence — exploring alternative compositions, typography hierarchy, and visual storytelling for premium brand positioning.",
    url: "https://luxury-website-2.vercel.app/",
    tags: ["Brand Identity", "Web Design", "React"],
    emoji: "◆",
  },
];

function Projects() {
  return (
    <section id="projects" style={{ borderTop: `1px solid ${C.border}` }}>
      <div className="f-section">
        <SectionLabel>Design Projects</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
          {projects.map((p) => (
            <a key={p.number} href={p.url} target="_blank" rel="noopener" style={{ textDecoration: "none", display: "block" }}>
              <div
                style={{
                  borderRadius: 16, background: C.surface, border: `1px solid ${C.border}`,
                  padding: "clamp(20px, 3vw, 32px)", height: "100%",
                  display: "flex", flexDirection: "column",
                  transition: "border-color 0.25s, transform 0.2s, background 0.25s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = C.accent + "45";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.background = "#15151e";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = C.border;
                  (e.currentTarget as HTMLElement).style.transform = "none";
                  (e.currentTarget as HTMLElement).style.background = C.surface;
                }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <span style={{ ...sans, fontSize: "0.65rem", fontWeight: 700, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Project {p.number}
                  </span>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: C.accent + "12", border: `1px solid ${C.accent}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", color: C.accent,
                  }}>↗</div>
                </div>

                <div style={{
                  borderRadius: 10, overflow: "hidden",
                  background: `linear-gradient(140deg, ${C.lift} 0%, #16162a 100%)`,
                  aspectRatio: "16/9", marginBottom: 20,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${C.border}`, gap: 8,
                }}>
                  <span style={{ fontSize: "2rem" }}>{p.emoji}</span>
                  <span style={{ ...sans, fontSize: "0.68rem", color: C.muted, letterSpacing: "0.06em" }}>View live ↗</span>
                </div>

                <h3 style={{ ...display, fontSize: "1.15rem", fontWeight: 400, color: C.text, marginBottom: 10 }}>
                  {p.title}
                </h3>
                <p style={{ ...sans, fontSize: "0.83rem", color: C.dim, lineHeight: 1.72, flex: 1, marginBottom: 18 }}>{p.desc}</p>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {p.tags.map((t) => (
                    <span key={t} style={{
                      ...sans, fontSize: "0.67rem", fontWeight: 600,
                      padding: "3px 10px", borderRadius: 6,
                      background: C.lift, color: C.muted, border: `1px solid ${C.border}`,
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Education ─────────────────────────────────────────────────────────────────
function Education() {
  return (
    <section id="education" style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}>
      <div className="f-section">
        <SectionLabel>Education</SectionLabel>
        <div className="f-two-col" style={{ alignItems: "stretch" }}>

          {/* Madura State Polytechnic */}
          <div style={{
            borderRadius: 18, padding: "clamp(24px, 3vw, 36px)",
            background: C.bg, border: `1px solid ${C.border}`,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, right: 0, width: 100, height: 100,
              background: `radial-gradient(circle at top right, ${C.accent}10 0%, transparent 70%)`,
            }} />
            <div style={{ ...sans, fontSize: "0.68rem", fontWeight: 700, color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              Current · 2021 – Apr 2026
            </div>
            <h3 style={{ ...display, fontSize: "clamp(1.05rem, 2.5vw, 1.4rem)", fontWeight: 400, color: C.text, lineHeight: 1.25, marginBottom: 8 }}>
              Madura State Polytechnic
            </h3>
            <p style={{ ...sans, fontSize: "0.84rem", color: C.dim, marginBottom: 5 }}>D3 Industrial Electrical Engineering</p>
            <p style={{ ...sans, fontSize: "0.76rem", color: C.muted, marginBottom: 20 }}>Sampang, Madura, East Java</p>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{
                ...sans, fontSize: "0.8rem", fontWeight: 700,
                padding: "5px 14px", borderRadius: 8,
                background: C.accent + "18", color: C.accent,
                border: `1px solid ${C.accent}30`,
              }}>
                GPA 3.58 / 4.00
              </span>
              <span style={{ ...sans, fontSize: "0.76rem", color: C.muted }}>🏅 IISMA Awardee</span>
            </div>
          </div>

          {/* SMAN 1 Arosbaya */}
          <div style={{
            borderRadius: 18, padding: "clamp(24px, 3vw, 36px)",
            background: C.bg, border: `1px solid ${C.border}`,
          }}>
            <div style={{ ...sans, fontSize: "0.68rem", fontWeight: 700, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              2016 – 2019
            </div>
            <h3 style={{ ...display, fontSize: "clamp(1.05rem, 2.5vw, 1.4rem)", fontWeight: 400, color: C.text, lineHeight: 1.25, marginBottom: 8 }}>
              SMAN 1 Arosbaya
            </h3>
            <p style={{ ...sans, fontSize: "0.84rem", color: C.dim, marginBottom: 5 }}>Senior High School, IPA — 78.00/100</p>
            <p style={{ ...sans, fontSize: "0.76rem", color: C.muted, marginBottom: 20 }}>Bangkalan, Madura, East Java</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {["Student Council member", "Chief of Music's extracurricular", "Chief of Basketball team"].map((act) => (
                <div key={act} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.muted, flexShrink: 0 }} />
                  <span style={{ ...sans, fontSize: "0.83rem", color: C.dim }}>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────
function Contact() {
  return (
    <section id="contact" style={{ borderTop: `1px solid ${C.border}` }}>
      <div className="f-section" style={{ textAlign: "center" }}>
        <SectionLabel>Contact</SectionLabel>

        <h2 style={{
          ...display,
          fontSize: "clamp(2.2rem, 7vw, 5rem)",
          fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.01em",
          color: C.text, marginBottom: 16,
        }}>
          Let's work<br /><em style={{ fontStyle: "italic", color: C.accent }}>together.</em>
        </h2>

        <p style={{ ...sans, fontSize: "0.97rem", color: C.dim, lineHeight: 1.78, maxWidth: 440, margin: "0 auto 44px" }}>
          Open to internships, collaborations, and full-time opportunities. Feel free to reach out anytime.
        </p>

        <div className="f-contact-btns">
          <a href="mailto:raflie01a@gmail.com"
            style={{
              ...sans,
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 28px", borderRadius: 12,
              background: C.accent, color: "#0c0c10",
              fontWeight: 700, fontSize: "0.92rem",
              textDecoration: "none",
              transition: "background 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = C.accentD; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = C.accent; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
            ✉ raflie01a@gmail.com
          </a>
          <a href="https://www.linkedin.com/in/raflie-nurivansyah" target="_blank" rel="noopener"
            style={{
              ...sans,
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 28px", borderRadius: 12,
              background: C.lift, color: C.text,
              fontWeight: 600, fontSize: "0.92rem",
              textDecoration: "none", border: `1px solid ${C.border}`,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.surface)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = C.lift)}>
            LinkedIn ↗
          </a>
          <a href="tel:+6285731648703"
            style={{
              ...sans,
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 28px", borderRadius: 12,
              background: C.lift, color: C.text,
              fontWeight: 600, fontSize: "0.92rem",
              textDecoration: "none", border: `1px solid ${C.border}`,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = C.surface)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = C.lift)}>
            📞 +62 857 3164 8703
          </a>
        </div>

        {/* Footer */}
        <div style={{
          paddingTop: 32, borderTop: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
          textAlign: "left",
        }}>
          <span style={{ ...display, fontSize: "1.1rem", fontWeight: 400, color: C.muted }}>
            Raflie<em style={{ fontStyle: "italic", color: C.accent }}>.</em>
          </span>
          <span style={{ ...sans, fontSize: "0.73rem", color: C.muted }}>
            © 2025 Raflie Nurivansyah · Bangkalan, Indonesia
          </span>
          <span style={{ ...sans, fontSize: "0.73rem", color: C.muted }}>
            Built with Figma Make
          </span>
        </div>
      </div>
    </section>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    document.title = "Raflie Nurivansyah's Portfolio";
  }, []);

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{STYLES}</style>
      <Nav />
      <Hero />
      <About />
      <IISMA />
      <Experience />
      <Projects />
      <Education />
      <Contact />
    </div>
  );
}
