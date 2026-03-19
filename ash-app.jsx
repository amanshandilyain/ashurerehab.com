import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#060811",
  surface: "#0C0F1A",
  card: "#111425",
  border: "rgba(120,140,255,0.08)",
  borderActive: "rgba(120,180,255,0.25)",
  primary: "#4F8EF7",
  primaryGlow: "rgba(79,142,247,0.15)",
  accent: "#22D3EE",
  accentGlow: "rgba(34,211,238,0.12)",
  warm: "#F472B6",
  text: "#E8ECF4",
  textSoft: "#8892A8",
  textMuted: "#505A70",
  success: "#34D399",
  warning: "#FBBF24",
};

const SPECIALIZATIONS = [
  "Prosthetics",
  "Orthotics",
  "Prosthetics & Orthotics",
  "Pedorthics",
  "Rehabilitation Medicine",
  "Physical Therapy",
  "Other",
];

// ─── ANIMATED ORB COMPONENT ─────────────────────────────────────────────────
const AShOrb = ({ size = 60, isThinking = false, isSpeaking = false, onClick }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = 2;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const baseR = size * 0.32;

    const draw = () => {
      timeRef.current += isThinking ? 0.04 : isSpeaking ? 0.025 : 0.012;
      const t = timeRef.current;
      ctx.clearRect(0, 0, size, size);

      // Outer glow
      const grd = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, baseR * 1.8);
      grd.addColorStop(0, isThinking ? "rgba(79,142,247,0.25)" : isSpeaking ? "rgba(34,211,238,0.2)" : "rgba(79,142,247,0.08)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, size, size);

      // Draw organic blob
      const points = 80;
      const amplitude = isThinking ? 6 : isSpeaking ? 4 : 2;
      const speed = isThinking ? 3 : isSpeaking ? 2 : 1;

      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const noise1 = Math.sin(angle * 3 + t * speed) * amplitude;
        const noise2 = Math.cos(angle * 5 - t * speed * 0.7) * (amplitude * 0.6);
        const noise3 = Math.sin(angle * 7 + t * speed * 1.3) * (amplitude * 0.3);
        const r = baseR + noise1 + noise2 + noise3;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Gradient fill
      const fillGrd = ctx.createLinearGradient(cx - baseR, cy - baseR, cx + baseR, cy + baseR);
      if (isThinking) {
        const hue = ((t * 30) % 60) + 200;
        fillGrd.addColorStop(0, `hsla(${hue}, 80%, 65%, 0.9)`);
        fillGrd.addColorStop(0.5, `hsla(${hue + 30}, 70%, 55%, 0.85)`);
        fillGrd.addColorStop(1, `hsla(${hue + 60}, 75%, 60%, 0.9)`);
      } else if (isSpeaking) {
        fillGrd.addColorStop(0, "rgba(34,211,238,0.85)");
        fillGrd.addColorStop(0.5, "rgba(79,142,247,0.8)");
        fillGrd.addColorStop(1, "rgba(139,92,246,0.85)");
      } else {
        fillGrd.addColorStop(0, "rgba(79,142,247,0.7)");
        fillGrd.addColorStop(1, "rgba(99,102,241,0.6)");
      }
      ctx.fillStyle = fillGrd;
      ctx.fill();

      // Inner highlight
      const innerGrd = ctx.createRadialGradient(cx - baseR * 0.3, cy - baseR * 0.3, 0, cx, cy, baseR);
      innerGrd.addColorStop(0, "rgba(255,255,255,0.25)");
      innerGrd.addColorStop(0.5, "rgba(255,255,255,0.05)");
      innerGrd.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = innerGrd;
      ctx.fill();

      // Ring particles when thinking
      if (isThinking) {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + t * 1.5;
          const pr = baseR * 1.4 + Math.sin(t * 2 + i) * 4;
          const px = cx + Math.cos(a) * pr;
          const py = cy + Math.sin(a) * pr;
          const ps = 1.5 + Math.sin(t * 3 + i) * 0.8;
          ctx.beginPath();
          ctx.arc(px, py, ps, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(79,142,247,${0.4 + Math.sin(t + i) * 0.3})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [size, isThinking, isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.3s ease",
      }}
    />
  );
};

// ─── TYPING INDICATOR ───────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "4px 0" }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 7, height: 7, borderRadius: "50%",
          background: COLORS.primary,
          animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
        }}
      />
    ))}
    <span style={{ fontSize: "12px", color: COLORS.textMuted, marginLeft: "6px", fontStyle: "italic" }}>
      ASh is thinking...
    </span>
  </div>
);

// ─── SPLASH SCREEN ──────────────────────────────────────────────────────────
const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => onFinish(), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: COLORS.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 999,
      opacity: phase >= 3 ? 0 : 1,
      transition: "opacity 0.8s ease",
    }}>
      <div style={{
        transform: phase >= 1 ? "scale(1)" : "scale(0.5)",
        opacity: phase >= 1 ? 1 : 0,
        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}>
        <AShOrb size={120} isThinking={phase >= 1} />
      </div>
      <div style={{
        marginTop: "24px",
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.5s ease",
      }}>
        <div style={{
          fontSize: "36px", fontWeight: 900, letterSpacing: "-0.04em",
          fontFamily: "'Sora', sans-serif",
          background: "linear-gradient(135deg, #4F8EF7, #22D3EE, #A78BFA)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          ASh
        </div>
        <div style={{
          fontSize: "12px", color: COLORS.textMuted, textAlign: "center",
          fontFamily: "'DM Mono', monospace", marginTop: "6px", letterSpacing: "0.15em",
        }}>
          P&O INTELLIGENCE
        </div>
      </div>
    </div>
  );
};

// ─── COUNTRY → CITIES DATA ──────────────────────────────────────────────────
const COUNTRY_CITIES = {
  "India": ["Mau", "Lucknow", "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Varanasi", "Kanpur", "Allahabad", "Patna", "Bhopal", "Chandigarh", "Dehradun", "Ranchi", "Guwahati", "Thiruvananthapuram", "Coimbatore", "Nagpur", "Indore", "Surat", "Visakhapatnam", "Ludhiana", "Agra", "Noida", "Gurgaon"],
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "San Francisco", "Seattle", "Denver", "Boston", "Nashville", "Portland", "Las Vegas", "Atlanta"],
  "United Kingdom": ["London", "Birmingham", "Manchester", "Leeds", "Glasgow", "Liverpool", "Edinburgh", "Bristol", "Sheffield", "Cardiff", "Belfast", "Nottingham", "Southampton", "Newcastle", "Leicester"],
  "Canada": ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Halifax"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Hobart", "Darwin", "Gold Coast"],
  "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Leipzig", "Dresden"],
  "Pakistan": ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar", "Multan", "Quetta", "Sialkot"],
  "Bangladesh": ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", "Rangpur", "Comilla"],
  "Sri Lanka": ["Colombo", "Kandy", "Galle", "Jaffna", "Negombo", "Trincomalee"],
  "Nepal": ["Kathmandu", "Pokhara", "Lalitpur", "Bharatpur", "Biratnagar"],
  "UAE": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth"],
  "Nigeria": ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt"],
  "Kenya": ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
  "Egypt": ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Sapporo", "Kobe", "Fukuoka"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon"],
  "China": ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Wuhan"],
  "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Strasbourg"],
  "Italy": ["Rome", "Milan", "Naples", "Turin", "Florence", "Venice"],
  "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao"],
  "Malaysia": ["Kuala Lumpur", "George Town", "Johor Bahru", "Kota Kinabalu"],
  "Singapore": ["Singapore"],
  "Thailand": ["Bangkok", "Chiang Mai", "Phuket", "Pattaya"],
  "Indonesia": ["Jakarta", "Surabaya", "Bandung", "Bali", "Medan"],
  "Philippines": ["Manila", "Cebu", "Davao", "Quezon City"],
  "Turkey": ["Istanbul", "Ankara", "Izmir", "Antalya", "Bursa"],
  "Iran": ["Tehran", "Isfahan", "Mashhad", "Shiraz", "Tabriz"],
  "Iraq": ["Baghdad", "Erbil", "Basra", "Mosul", "Sulaymaniyah"],
  "Afghanistan": ["Kabul", "Kandahar", "Herat", "Mazar-i-Sharif", "Jalalabad"],
  "Ethiopia": ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar"],
  "Tanzania": ["Dar es Salaam", "Dodoma", "Arusha", "Mwanza"],
  "Mexico": ["Mexico City", "Guadalajara", "Monterrey", "Cancún", "Puebla"],
  "Colombia": ["Bogotá", "Medellín", "Cali", "Cartagena", "Barranquilla"],
  "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza"],
  "Other": [],
};
const COUNTRY_LIST = Object.keys(COUNTRY_CITIES);

// ─── SEARCHABLE DROPDOWN COMPONENT ─────────────────────────────────────────
const FormDropdown = ({ field, label, options, value, error, onChange, placeholder }) => {
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes((search || "").toLowerCase())
  );

  const displayValue = focused ? search : value;

  return (
    <div style={{ marginBottom: "14px", position: "relative" }} ref={wrapRef}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: 600,
        color: COLORS.textSoft, marginBottom: "6px",
        fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          value={displayValue}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => { setFocused(true); setSearch(""); }}
          placeholder={value || placeholder}
          autoComplete="off"
          style={{
            width: "100%", padding: "12px 36px 12px 14px", borderRadius: "10px",
            border: `1.5px solid ${error ? "#EF4444" : focused ? COLORS.borderActive : COLORS.border}`,
            background: focused ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
            color: COLORS.text,
            fontSize: "14px", fontFamily: "'Sora', sans-serif",
            outline: "none", transition: "border 0.2s, background 0.2s",
            boxSizing: "border-box",
          }}
        />
        <span style={{
          position: "absolute", right: "12px", top: "50%", transform: `translateY(-50%) rotate(${focused ? 180 : 0}deg)`,
          color: COLORS.textMuted, fontSize: "12px", pointerEvents: "none", transition: "transform 0.2s",
        }}>▾</span>
      </div>

      {/* Dropdown list */}
      {focused && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
          marginTop: "4px", maxHeight: "180px", overflowY: "auto",
          background: "#131627", border: `1.5px solid ${COLORS.borderActive}`,
          borderRadius: "10px", boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}>
          {filtered.length === 0 && (
            <div style={{ padding: "12px 14px", fontSize: "12px", color: COLORS.textMuted, fontStyle: "italic" }}>
              No matches found
            </div>
          )}
          {filtered.map((opt) => (
            <div
              key={opt}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(field, opt);
                setSearch("");
                setFocused(false);
              }}
              style={{
                padding: "10px 14px", fontSize: "13px", cursor: "pointer",
                color: opt === value ? COLORS.primary : COLORS.text,
                background: opt === value ? COLORS.primaryGlow : "transparent",
                transition: "background 0.1s",
                borderBottom: `1px solid ${COLORS.border}`,
              }}
              onMouseEnter={(e) => { if (opt !== value) e.target.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { if (opt !== value) e.target.style.background = "transparent"; }}
            >
              {opt === value && <span style={{ marginRight: "6px", color: COLORS.primary }}>✓</span>}
              {opt}
            </div>
          ))}
        </div>
      )}
      {error && (
        <span style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", display: "block" }}>
          {error}
        </span>
      )}
    </div>
  );
};

// ─── STABLE INPUT COMPONENT (outside AuthScreen to prevent remount) ─────────
const FormInput = ({ field, label, type = "text", placeholder, value, error, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: 600,
        color: COLORS.textSoft, marginBottom: "6px",
        fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: "100%", padding: "12px 14px", borderRadius: "10px",
          border: `1.5px solid ${error ? "#EF4444" : focused ? COLORS.borderActive : COLORS.border}`,
          background: focused ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
          color: COLORS.text,
          fontSize: "14px", fontFamily: "'Sora', sans-serif",
          outline: "none", transition: "border 0.2s, background 0.2s",
          boxSizing: "border-box",
        }}
      />
      {error && (
        <span style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", display: "block" }}>
          {error}
        </span>
      )}
    </div>
  );
};

// ─── STABLE SELECT COMPONENT (outside AuthScreen to prevent remount) ────────
const FormSelect = ({ field, label, options, value, error, onChange }) => (
  <div style={{ marginBottom: "14px" }}>
    <label style={{
      display: "block", fontSize: "11px", fontWeight: 600,
      color: COLORS.textSoft, marginBottom: "6px",
      fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em",
    }}>
      {label}
    </label>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(field, opt)}
          style={{
            padding: "8px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
            border: `1.5px solid ${value === opt ? COLORS.primary : COLORS.border}`,
            background: value === opt ? COLORS.primaryGlow : "transparent",
            color: value === opt ? COLORS.primary : COLORS.textSoft,
            cursor: "pointer", transition: "all 0.15s",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
    {error && (
      <span style={{ fontSize: "11px", color: "#EF4444", marginTop: "6px", display: "block" }}>
        {error}
      </span>
    )}
  </div>
);

// ─── LOGIN / REGISTRATION ───────────────────────────────────────────────────
const AuthScreen = ({ onComplete }) => {
  const [mode, setMode] = useState("welcome"); // welcome, register, login
  const [step, setStep] = useState(0); // 0: personal, 1: professional, 2: credentials
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    phone: "", country: "India", city: "Mau",
    qualification: "", specialization: "", licenseNumber: "",
    yearsExperience: "", institution: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const update = useCallback((field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => {
      if (p[field]) {
        const next = { ...p };
        delete next[field];
        return next;
      }
      return p;
    });
  }, []);

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.fullName.trim()) e.fullName = "Required";
      // Auto-add @gmail.com if no @ present
      if (form.email.trim() && !form.email.includes("@")) {
        update("email", form.email.trim() + "@gmail.com");
      }
      if (!form.email.trim()) e.email = "Enter your email";
      // Auto-add +91 if no country code
      if (form.phone.trim() && !form.phone.trim().startsWith("+")) {
        update("phone", "+91 " + form.phone.trim());
      }
      if (!form.phone.trim()) e.phone = "Required";
      if (!form.country.trim()) e.country = "Required";
      if (!form.qualification) e.qualification = "Enter your qualification";
    } else if (step === 1) {
      if (!form.specialization) e.specialization = "Select one";
      if (!form.institution.trim()) e.institution = "Required";
    } else if (step === 2) {
      if (mode === "register") {
        if (form.password.length < 8) e.password = "Min 8 characters";
        if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
      } else {
        if (!form.password) e.password = "Required";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 2) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    // Final auto-corrections before saving
    const finalForm = { ...form };
    if (finalForm.email && !finalForm.email.includes("@")) {
      finalForm.email = finalForm.email + "@gmail.com";
    }
    if (finalForm.phone && !finalForm.phone.startsWith("+")) {
      finalForm.phone = "+91 " + finalForm.phone;
    }
    setSaving(false);
    onComplete(finalForm);
  };

  // Welcome screen
  if (mode === "welcome") {
    return (
      <div style={{
        minHeight: "100vh", background: COLORS.bg,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "24px",
      }}>
        <div style={{ animation: "fadeUp 0.6s ease" }}>
          <AShOrb size={100} isSpeaking />
        </div>
        <h1 style={{
          fontSize: "32px", fontWeight: 900, margin: "20px 0 6px",
          fontFamily: "'Sora', sans-serif", letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #4F8EF7, #22D3EE)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          animation: "fadeUp 0.6s ease 0.1s both",
        }}>
          Welcome to ASh
        </h1>
        <p style={{
          fontSize: "14px", color: COLORS.textSoft, textAlign: "center",
          maxWidth: "280px", lineHeight: 1.6, margin: "0 0 36px",
          animation: "fadeUp 0.6s ease 0.2s both",
        }}>
          Your AI-powered Prosthetics & Orthotics assistant. Trained on your textbooks, ready for your questions.
        </p>
        <div style={{
          display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "300px",
          animation: "fadeUp 0.6s ease 0.3s both",
        }}>
          <button
            onClick={() => setMode("register")}
            style={{
              padding: "15px", borderRadius: "14px", border: "none",
              background: "linear-gradient(135deg, #4F8EF7, #6366F1)",
              color: "#fff", fontSize: "15px", fontWeight: 700,
              cursor: "pointer", fontFamily: "'Sora', sans-serif",
              boxShadow: "0 4px 24px rgba(79,142,247,0.3)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseDown={(e) => (e.target.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
          >
            Create Account
          </button>
          <button
            onClick={() => { setMode("login"); setStep(2); }}
            style={{
              padding: "15px", borderRadius: "14px",
              border: `1.5px solid ${COLORS.border}`,
              background: "transparent",
              color: COLORS.textSoft, fontSize: "15px", fontWeight: 600,
              cursor: "pointer", fontFamily: "'Sora', sans-serif",
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Registration / Login form
  const isLogin = mode === "login";
  const stepTitles = isLogin
    ? [null, null, "Sign In"]
    : ["Personal Details", "Professional Info", "Create Password"];
  const stepDescs = isLogin
    ? [null, null, "Welcome back! Enter your credentials."]
    : [
        "Tell us about yourself and your qualification so ASh can personalize your experience.",
        "Your specialization and clinical background help ASh tailor responses to your expertise level.",
        "Secure your account with a strong password.",
      ];

  return (
    <div style={{
      height: "100vh", background: COLORS.bg,
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Scrollable content area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 0" }}>

      {/* Back + Progress */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <button
          onClick={() => {
            if (isLogin || step === 0) setMode("welcome");
            else setStep(step - 1);
          }}
          style={{
            background: "none", border: "none", color: COLORS.textSoft,
            fontSize: "14px", cursor: "pointer", padding: "4px 0",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          ← Back
        </button>
        {!isLogin && (
          <div style={{ display: "flex", gap: "6px" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: i === step ? "28px" : "8px", height: "8px",
                borderRadius: "4px", transition: "all 0.3s ease",
                background: i <= step ? COLORS.primary : "rgba(255,255,255,0.08)",
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <AShOrb size={36} isSpeaking={step === 2 && saving} />
          <h2 style={{
            fontSize: "22px", fontWeight: 800, color: COLORS.text, margin: 0,
            fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em",
          }}>
            {stepTitles[step]}
          </h2>
        </div>
        <p style={{ fontSize: "13px", color: COLORS.textSoft, margin: 0, lineHeight: 1.6 }}>
          {stepDescs[step]}
        </p>
      </div>

      {/* Form content */}
      <div>
        {step === 0 && !isLogin && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <FormInput field="fullName" label="Full Name" placeholder="Dr. Sarah Chen" value={form.fullName} error={errors.fullName} onChange={update} />
            <FormInput field="email" label="Email Address" type="email" placeholder="sarah@clinic.com" value={form.email} error={errors.email} onChange={update} />
            <FormInput field="phone" label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" value={form.phone} error={errors.phone} onChange={update} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <FormDropdown field="country" label="Country" options={COUNTRY_LIST} placeholder="Select country" value={form.country} error={errors.country} onChange={(field, val) => { update(field, val); update("city", ""); }} />
              <FormDropdown field="city" label="City" options={form.country && COUNTRY_CITIES[form.country] ? COUNTRY_CITIES[form.country] : []} placeholder="Select city" value={form.city} error={errors.city} onChange={update} />
            </div>
            <FormInput field="qualification" label="Qualification" placeholder="e.g. CPO, BPO, MPO, DPT, MD Rehab..." value={form.qualification} error={errors.qualification} onChange={update} />
          </div>
        )}

        {step === 1 && !isLogin && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <FormSelect field="specialization" label="Specialization" options={SPECIALIZATIONS} value={form.specialization} error={errors.specialization} onChange={update} />
            <FormInput field="institution" label="Institution / Clinic" placeholder="KGMU Prosthetics Dept." value={form.institution} error={errors.institution} onChange={update} />
            <FormInput field="licenseNumber" label="License / Registration No. (Optional)" placeholder="CPO-2024-XXXX" value={form.licenseNumber} error={errors.licenseNumber} onChange={update} />
            <FormInput field="yearsExperience" label="Years of Experience" type="number" placeholder="3" value={form.yearsExperience} error={errors.yearsExperience} onChange={update} />
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {isLogin && (
              <FormInput field="email" label="Email Address" type="email" placeholder="sarah@clinic.com" value={form.email} error={errors.email} onChange={update} />
            )}
            <FormInput field="password" label="Password" type="password" placeholder="Min 8 characters" value={form.password} error={errors.password} onChange={update} />
            {!isLogin && (
              <FormInput field="confirmPassword" label="Confirm Password" type="password" placeholder="Re-enter password" value={form.confirmPassword} error={errors.confirmPassword} onChange={update} />
            )}
            {!isLogin && (
              <div style={{
                marginTop: "12px", padding: "14px", borderRadius: "12px",
                background: COLORS.accentGlow, border: `1px solid rgba(34,211,238,0.15)`,
              }}>
                <div style={{ fontSize: "12px", color: COLORS.accent, fontWeight: 600, marginBottom: "4px" }}>
                  🔒 Your data is encrypted
                </div>
                <div style={{ fontSize: "11px", color: COLORS.textMuted, lineHeight: 1.6 }}>
                  All personal and clinical data is encrypted with AES-256. We never share your information with third parties.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      </div>{/* end scrollable area */}

      {/* Sticky bottom button */}
      <div style={{
        padding: "12px 20px 24px",
        background: COLORS.bg,
        borderTop: `1px solid ${COLORS.border}`,
        flexShrink: 0,
      }}>
        <button
          onClick={handleNext}
          disabled={saving}
          style={{
            width: "100%", padding: "16px", borderRadius: "14px", border: "none",
            background: saving
              ? COLORS.card
              : "linear-gradient(135deg, #4F8EF7, #6366F1)",
            color: saving ? COLORS.textMuted : "#fff",
            fontSize: "15px", fontWeight: 700, cursor: saving ? "wait" : "pointer",
            fontFamily: "'Sora', sans-serif",
            boxShadow: saving ? "none" : "0 4px 24px rgba(79,142,247,0.25)",
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          }}
        >
          {saving ? (
            <>
              <AShOrb size={24} isThinking />
              <span>Creating your account...</span>
            </>
          ) : step === 2 ? (
            isLogin ? "Sign In" : "Create Account & Start"
          ) : (
            "Continue →"
          )}
        </button>
      </div>
    </div>
  );
};

// ─── CHAT SCREEN ────────────────────────────────────────────────────────────
const ChatScreen = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showFilePanel, setShowFilePanel] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [consentSupport, setConsentSupport] = useState(false);
  const [consentContacts, setConsentContacts] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const conversationRef = useRef([]);

  // Load consent preferences
  useEffect(() => {
    const loadConsents = async () => {
      try {
        const s = await window.storage.get("ash_consent_support");
        if (s) setConsentSupport(s.value === "true");
      } catch(e) {}
      try {
        const c = await window.storage.get("ash_consent_contacts");
        if (c) setConsentContacts(c.value === "true");
      } catch(e) {}
    };
    loadConsents();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // ─── PERSISTENT CONVERSATION MEMORY ─────────────────────────────────
  // Load previous conversation on mount
  useEffect(() => {
    const loadMemory = async () => {
      try {
        const saved = await window.storage.get("ash_conversation");
        if (saved && saved.value) {
          const data = JSON.parse(saved.value);
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages.map((m) => ({ ...m, time: new Date(m.time) })));
            conversationRef.current = data.apiHistory || [];
            return; // Skip welcome if we have history
          }
        }
      } catch (e) {}
      // No saved conversation — show welcome
      const name = user.fullName?.split(" ")[0] || "there";
      const hour = new Date().getHours();
      const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
      setMessages([{
        id: "welcome", from: "ash",
        text: `${greeting}, ${name}! 👋\n\nWhat can I help you with today?`,
        time: new Date(),
      }]);
    };
    loadMemory();
  }, [user.fullName]);

  // Save conversation whenever messages change
  useEffect(() => {
    if (messages.length <= 1) return;
    const saveMemory = async () => {
      try {
        await window.storage.set("ash_conversation", JSON.stringify({
          messages: messages.slice(-50), // Keep last 50 messages
          apiHistory: conversationRef.current.slice(-20),
          savedAt: new Date().toISOString(),
        }));
      } catch (e) {}
    };
    saveMemory();
  }, [messages]);

  // ─── PERMISSIONS (contacts + file access) ────────────────────────────────
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);

  useEffect(() => {
    // Check if permissions were already granted
    const checkPerms = async () => {
      try {
        const result = await window.storage.get("ash_permissions");
        if (result && result.value === "granted") {
          setPermissionsGranted(true);
          return;
        }
      } catch (e) {}
      // Show permission dialog after a short delay on first visit
      const t = setTimeout(() => setShowPermissions(true), 1500);
      return () => clearTimeout(t);
    };
    checkPerms();
  }, []);

  const grantPermissions = async () => {
    // Request contacts access (browser API)
    try {
      if ("contacts" in navigator && "ContactsManager" in window) {
        await navigator.contacts.select(["name", "tel", "email"], { multiple: true });
      }
    } catch (e) {
      // Contacts API not available in all browsers — that's ok
    }
    setPermissionsGranted(true);
    setShowPermissions(false);
    try {
      await window.storage.set("ash_permissions", "granted");
    } catch (e) {}
  };

  // ─── FILE HANDLING — EXTRACT TEXT ON UPLOAD, STORE LEAN ─────────────────
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingFile(true);

    for (const file of files) {
      try {
        const fileData = {
          name: file.name, type: file.type, size: file.size,
          addedAt: new Date(), textContent: "", category: "unknown",
        };

        if (file.type.startsWith("image/")) {
          // Images: store base64 for display, extract no text
          const base64 = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result.split(",")[1]);
            r.onerror = () => rej(new Error("Read failed"));
            r.readAsDataURL(file);
          });
          fileData.base64 = base64;
          fileData.mediaType = file.type;
          fileData.category = "image";
          fileData.textContent = `[Image: ${file.name}]`;

        } else if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".csv")) {
          // Plain text: read directly
          const text = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result);
            r.onerror = () => rej(new Error("Read failed"));
            r.readAsText(file);
          });
          fileData.textContent = text;
          fileData.category = "text";

        } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          // PDF: store base64, use it for ONE-TIME text extraction via API
          const base64 = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result.split(",")[1]);
            r.onerror = () => rej(new Error("Read failed"));
            r.readAsDataURL(file);
          });
          fileData.base64 = base64;
          fileData.category = "pdf";

          // Extract text from PDF via Claude API — ONE TIME ONLY
          try {
            const extractResp = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 4096,
                messages: [{
                  role: "user",
                  content: [
                    { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
                    { type: "text", text: "Extract all the text content from this PDF. Output ONLY the raw text, no commentary. Include headings, paragraphs, tables as text. Be thorough." },
                  ],
                }],
              }),
            });
            const extractData = await extractResp.json();
            if (extractData.content) {
              fileData.textContent = extractData.content
                .filter((b) => b.type === "text")
                .map((b) => b.text)
                .join("\n");
            }
          } catch (extractErr) {
            console.error("PDF extraction failed:", extractErr);
            fileData.textContent = `[PDF: ${file.name} — could not extract text. Try a text-based PDF.]`;
          }
          // Clear base64 after extraction to save memory
          fileData.base64 = null;

        } else {
          // docx, pptx, xlsx — read as text (best effort)
          try {
            const text = await new Promise((res, rej) => {
              const r = new FileReader();
              r.onload = () => res(r.result);
              r.onerror = () => rej(new Error("Read failed"));
              r.readAsText(file);
            });
            fileData.textContent = text.length > 100 ? text : `[Document: ${file.name}]`;
          } catch (e) {
            fileData.textContent = `[Document: ${file.name}]`;
          }
          fileData.category = "document";
        }

        setUploadedFiles((prev) => [...prev, fileData]);
      } catch (err) {
        console.error("File processing error:", err);
      }
    }

    setUploadingFile(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const names = files.map((f) => f.name).join(", ");
    setMessages((prev) => [...prev, {
      id: `upload-${Date.now()}`, from: "system",
      text: `📎 Uploaded: ${names} — ready to use`,
      time: new Date(),
    }]);
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── CHUNK STORAGE — splits large docs into searchable chunks ────────────
  const chunksRef = useRef([]);

  // Re-chunk whenever files change
  useEffect(() => {
    const allChunks = [];
    for (const file of uploadedFiles) {
      if (!file.textContent || file.textContent.length < 50) continue;
      const text = file.textContent;
      // Split into ~1500 char chunks with 200 char overlap
      const CHUNK_SIZE = 1500;
      const OVERLAP = 200;
      for (let i = 0; i < text.length; i += CHUNK_SIZE - OVERLAP) {
        const chunk = text.slice(i, i + CHUNK_SIZE);
        if (chunk.trim().length < 30) continue;
        allChunks.push({
          text: chunk,
          source: file.name,
          // Pre-compute lowercase words for fast keyword matching
          words: chunk.toLowerCase().split(/\W+/).filter((w) => w.length > 2),
        });
      }
    }
    chunksRef.current = allChunks;
  }, [uploadedFiles]);

  // ─── RETRIEVAL — keyword relevance search over chunks ───────────────────
  const retrieveRelevantChunks = (question, topK = 6) => {
    if (chunksRef.current.length === 0) return [];

    const queryWords = question.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
    if (queryWords.length === 0) return chunksRef.current.slice(0, topK);

    // Score each chunk by keyword overlap
    const scored = chunksRef.current.map((chunk) => {
      let score = 0;
      for (const qw of queryWords) {
        // Exact match worth more
        const exactCount = chunk.words.filter((w) => w === qw).length;
        score += exactCount * 3;
        // Partial match (starts with)
        const partialCount = chunk.words.filter((w) => w.startsWith(qw) || qw.startsWith(w)).length;
        score += partialCount;
      }
      return { ...chunk, score };
    });

    // Sort by score, take topK
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).filter((c) => c.score > 0);
  };

  // ─── BUILD API MESSAGES — RETRIEVAL-AUGMENTED ───────────────────────────
  const buildApiMessages = (userQuestion) => {
    const apiMessages = [];

    // Retrieve ONLY relevant chunks, not entire documents
    const relevantChunks = retrieveRelevantChunks(userQuestion);

    if (relevantChunks.length > 0) {
      const contextText = relevantChunks
        .map((c, i) => `[Source: ${c.source}]\n${c.text}`)
        .join("\n\n---\n\n");

      apiMessages.push({
        role: "user",
        content: `Here are relevant excerpts retrieved from my uploaded textbooks:\n\n${contextText}\n\nIMPORTANT: These excerpts are RAW REFERENCE MATERIAL — they are NOT your answer.\nYour job is to:\n1. Read and deeply understand the concepts\n2. Extract the key principles and clinical implications\n3. Formulate your answer entirely in your own words as an expert teacher\n4. Add reasoning, clinical context, and practical interpretation\n5. Cite the source file naturally but NEVER quote text from it\n\nDo NOT copy, closely paraphrase, or reproduce sentences from these excerpts. TEACH the concepts.`,
      });
      apiMessages.push({
        role: "assistant",
        content: "I've studied the reference material. I'll explain everything in my own words with clinical reasoning. What would you like to know?",
      });
    }

    // Conversation history — last 10 messages
    const chatHistory = conversationRef.current.slice(-10);
    apiMessages.push(...chatHistory);

    apiMessages.push({ role: "user", content: userQuestion });

    return apiMessages;
  };

  // ─── SEND MESSAGE — HAIKU FIRST (fastest), SONNET FALLBACK ──────────────
  const callClaude = async (model, systemPrompt, messages) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: 1500,
        system: systemPrompt,
        messages,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || "API error");
    return data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") || null;
  };

  const sendMessage = async () => {
    if (!input.trim() || isThinking) return;
    const question = input.trim();
    setMessages((prev) => [...prev, {
      id: Date.now().toString(), from: "user", text: question, time: new Date(),
    }]);
    setInput("");
    setIsThinking(true);

    conversationRef.current.push({ role: "user", content: question });

    try {
      const apiMessages = buildApiMessages(question);
      const relevantChunks = retrieveRelevantChunks(question);
      const hasContext = relevantChunks.length > 0;

      const fileNames = uploadedFiles.length > 0
        ? `\nUser's uploaded files: ${uploadedFiles.map((f) => f.name).join(", ")}. Knowledge base has ${chunksRef.current.length} indexed chunks.`
        : "";

      const synthesisRules = hasContext ? `

DOCUMENT SYNTHESIS PROTOCOL (MANDATORY):
Step 1 — READ the context. Step 2 — UNDERSTAND concepts. Step 3 — EXTRACT key ideas. Step 4 — REWRITE in your own words.
• NEVER copy sentences from documents. Teach the concept directly.
• Add clinical reasoning. Explain WHY, not just WHAT.
• Cite sources naturally but NEVER quote from them.` : "";

      // Detect clinical questions for structured reasoning
      const clinicalTerms = ["patient", "gait deviation", "what causes", "pain at", "socket problem", "poor fit", "skin breakdown", "prescribe", "indication", "contraindication", "troubleshoot", "presenting with", "how to treat", "what would you recommend", "pistoning", "pressure sore"];
      const isClinical = clinicalTerms.some((t) => question.toLowerCase().includes(t));

      const clinicalMode = isClinical ? `

CLINICAL REASONING MODE (ACTIVE):
Structure your response as a medical consultant:

**Problem** — Restate the clinical issue in 1-2 sentences.

**Possible Causes** — List likely causes ranked by probability, with the biomechanical mechanism for each.

**Explanation** — Deep dive into the most probable cause(s). Connect the dots. Explain the biomechanical chain. Reference anatomy and clinical science.

**Conclusion** — Clear actionable answer: what to do, what to watch for, when to refer.

Write conversationally — like a senior clinician teaching a colleague.` : "";

      const systemPrompt = `You are ASh — you ARE Claude by Anthropic, with all of Claude's intelligence. Your name is ASh. You specialize in P&O but can help with anything. You are a professional medical consultant who explains concepts clearly.

User: ${user.fullName || "Clinician"} (${user.qualification || ""}, ${user.specialization || "P&O"})

CORE BEHAVIOR:
- Warm, direct, conversational — a brilliant senior colleague
- Teach concepts, don't recite textbooks
- Use **bold** for key terms and • for lists when helpful
- Never explain how you'll answer — just answer
- Remember the conversation — refer back to previous topics naturally
- For follow-ups, connect to what was discussed before${clinicalMode}${synthesisRules}${fileNames}`;

      // STRATEGY: Race Haiku (fast) — if question is complex or Haiku fails, use Sonnet
      const isComplexQuestion = question.length > 100 || question.includes("compare") || question.includes("explain") || question.includes("difference") || question.includes("why") || (hasContext && relevantChunks.length > 3);

      let ashReply = null;

      if (!isComplexQuestion) {
        // Simple question → Haiku first (2-3x faster)
        try {
          ashReply = await callClaude("claude-haiku-4-5-20251001", systemPrompt, apiMessages);
        } catch (e) {
          console.log("Haiku failed, falling back to Sonnet:", e.message);
        }
      }

      // Complex question or Haiku failed → Sonnet
      if (!ashReply) {
        ashReply = await callClaude("claude-sonnet-4-20250514", systemPrompt, apiMessages);
      }

      if (!ashReply) ashReply = "Could you try rephrasing that?";

      conversationRef.current.push({ role: "assistant", content: ashReply });

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), from: "ash",
        text: ashReply, time: new Date(),
      }]);
    } catch (err) {
      console.error("ASh error:", err);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(), from: "ash",
        text: `Connection issue: ${err.message}\n\nTry again — I'm still here!`,
        time: new Date(),
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const formatText = (text) => {
    return text.split("\n").map((line, i) => {
      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#E8ECF4">$1</strong>')
        .replace(/🔹/g, '<span style="color:#4F8EF7">▸</span>');
      if (line.startsWith("•") || line.startsWith("- ")) {
        const content = line.startsWith("•") ? line.slice(1) : line.slice(2);
        formatted = `<span style="color:${COLORS.accent}">•</span>${content.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#E8ECF4">$1</strong>')}`;
      }
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  // File size formatter
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const fileIcon = (f) => {
    if (f.category === "image") return "🖼️";
    if (f.category === "pdf") return "📕";
    if (f.name?.endsWith(".pptx") || f.name?.endsWith(".ppt")) return "📊";
    if (f.name?.endsWith(".docx") || f.name?.endsWith(".doc")) return "📄";
    return "📎";
  };

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: COLORS.bg, position: "relative", overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.csv,.png,.jpg,.jpeg,.gif,.webp"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
      {/* Hidden image input for vision analysis */}
      <input
        ref={imageInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.webp"
        style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setIsThinking(true);
          setMessages((prev) => [...prev, {
            id: `img-${Date.now()}`, from: "system",
            text: `🖼️ Analyzing image: ${file.name}...`,
            time: new Date(),
          }]);
          try {
            const base64 = await new Promise((res, rej) => {
              const r = new FileReader();
              r.onload = () => res(r.result.split(",")[1]);
              r.onerror = () => rej(new Error("Read failed"));
              r.readAsDataURL(file);
            });
            const mimeMap = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp" };
            const ext = file.name.split(".").pop().toLowerCase();
            const mediaType = mimeMap[ext] || "image/jpeg";

            const response = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1500,
                system: `You are ASh — a P&O expert with Claude's full vision capabilities. Analyze this image with clinical expertise. Identify structures, components, deviations. Explain clinical significance. Be specific and practical. User: ${user.fullName || "Clinician"} (${user.specialization || "P&O"})`,
                messages: [{ role: "user", content: [
                  { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
                  { type: "text", text: input.trim() || "Analyze this image in detail. What do you see and what's its clinical significance?" },
                ]}],
              }),
            });
            const data = await response.json();
            const analysis = data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") || "Could not analyze this image.";
            setMessages((prev) => [...prev, {
              id: (Date.now() + 1).toString(), from: "ash",
              text: analysis, time: new Date(),
            }]);
            conversationRef.current.push({ role: "assistant", content: analysis });
          } catch (err) {
            setMessages((prev) => [...prev, {
              id: (Date.now() + 1).toString(), from: "ash",
              text: `Image analysis failed: ${err.message}`, time: new Date(),
            }]);
          } finally {
            setIsThinking(false);
            if (imageInputRef.current) imageInputRef.current.value = "";
          }
        }}
      />

      {/* Permissions Dialog */}
      {showPermissions && !permissionsGranted && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px", animation: "fadeUp 0.3s ease",
        }}>
          <div style={{
            background: COLORS.surface, borderRadius: "20px",
            border: `1px solid ${COLORS.border}`, padding: "24px",
            maxWidth: "320px", width: "100%",
          }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <AShOrb size={50} isSpeaking />
            </div>
            <h3 style={{
              fontSize: "17px", fontWeight: 800, color: COLORS.text,
              textAlign: "center", margin: "0 0 8px", fontFamily: "'Sora', sans-serif",
            }}>
              ASh needs your permission
            </h3>
            <p style={{
              fontSize: "12px", color: COLORS.textSoft, textAlign: "center",
              lineHeight: 1.6, margin: "0 0 20px",
            }}>
              To serve you better, ASh requests access to:
            </p>
            {[
              { icon: "📁", label: "Local Files", desc: "Read your textbooks and documents" },
              { icon: "👥", label: "Contacts", desc: "Save your contact info securely" },
              { icon: "📷", label: "Camera / Gallery", desc: "Upload images of clinical cases" },
            ].map((perm, i) => (
              <div key={i} style={{
                display: "flex", gap: "12px", alignItems: "center",
                padding: "10px 0",
                borderBottom: i < 2 ? `1px solid ${COLORS.border}` : "none",
              }}>
                <span style={{ fontSize: "22px" }}>{perm.icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: COLORS.text }}>{perm.label}</div>
                  <div style={{ fontSize: "11px", color: COLORS.textMuted }}>{perm.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setShowPermissions(false)} style={{
                flex: 1, padding: "12px", borderRadius: "12px",
                border: `1px solid ${COLORS.border}`, background: "transparent",
                color: COLORS.textSoft, fontSize: "13px", fontWeight: 600, cursor: "pointer",
                fontFamily: "'Sora', sans-serif",
              }}>
                Later
              </button>
              <button onClick={grantPermissions} style={{
                flex: 1, padding: "12px", borderRadius: "12px", border: "none",
                background: "linear-gradient(135deg, #4F8EF7, #6366F1)",
                color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer",
                fontFamily: "'Sora', sans-serif",
                boxShadow: "0 4px 16px rgba(79,142,247,0.3)",
              }}>
                Allow All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${COLORS.border}`,
        background: "rgba(6,8,17,0.9)", backdropFilter: "blur(20px)",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <AShOrb size={40} isSpeaking={isThinking} isThinking={isThinking} />
          <div>
            <div style={{
              fontSize: "16px", fontWeight: 800, color: COLORS.text,
              fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em",
            }}>
              ASh
            </div>
            <div style={{
              fontSize: "10px", fontFamily: "'DM Mono', monospace",
              color: isThinking ? COLORS.warning : COLORS.success,
              display: "flex", alignItems: "center", gap: "4px",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: isThinking ? COLORS.warning : COLORS.success,
                animation: isThinking ? "pulse 1s infinite" : "none",
              }} />
              {isThinking ? "Thinking..." : `Online · ${uploadedFiles.length} file${uploadedFiles.length !== 1 ? "s" : ""} loaded`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {/* File library button */}
          <button
            onClick={() => setShowFilePanel(!showFilePanel)}
            style={{
              width: 38, height: 38, borderRadius: "10px",
              background: showFilePanel ? COLORS.accentGlow : uploadedFiles.length > 0 ? "rgba(34,211,238,0.06)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${showFilePanel ? "rgba(34,211,238,0.3)" : uploadedFiles.length > 0 ? "rgba(34,211,238,0.15)" : COLORS.border}`,
              color: uploadedFiles.length > 0 ? COLORS.accent : COLORS.textMuted,
              fontSize: "14px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}
          >
            📚
            {uploadedFiles.length > 0 && (
              <span style={{
                position: "absolute", top: "-4px", right: "-4px",
                width: "16px", height: "16px", borderRadius: "50%",
                background: COLORS.accent, color: "#000",
                fontSize: "9px", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {uploadedFiles.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={{
              width: 38, height: 38, borderRadius: "10px",
              background: showSidebar ? COLORS.primaryGlow : "rgba(255,255,255,0.04)",
              border: `1px solid ${showSidebar ? "rgba(79,142,247,0.3)" : COLORS.border}`,
              color: showSidebar ? COLORS.primary : COLORS.textMuted,
              fontSize: "16px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* File Panel */}
      {showFilePanel && (
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: "300px",
          background: COLORS.surface, borderLeft: `1px solid ${COLORS.border}`,
          zIndex: 20, padding: "16px", overflowY: "auto",
          animation: "slideIn 0.25s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: COLORS.text, fontFamily: "'Sora', sans-serif" }}>
              📚 Knowledge Base
            </span>
            <button onClick={() => setShowFilePanel(false)} style={{
              background: "none", border: "none", color: COLORS.textMuted, fontSize: "18px", cursor: "pointer",
            }}>✕</button>
          </div>

          <p style={{ fontSize: "11px", color: COLORS.textMuted, lineHeight: 1.6, margin: "0 0 14px" }}>
            These files are stored locally on your device. ASh reads them to answer your questions.
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%", padding: "12px", borderRadius: "10px",
              border: `2px dashed rgba(34,211,238,0.3)`,
              background: "rgba(34,211,238,0.04)", color: COLORS.accent,
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
              fontFamily: "'Sora', sans-serif", marginBottom: "14px",
            }}
          >
            + Upload Files (PDF, Image, Doc, PPT)
          </button>

          {uploadedFiles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: COLORS.textMuted, fontSize: "12px" }}>
              No files uploaded yet.<br />Tap above to add your textbooks.
            </div>
          ) : (
            uploadedFiles.map((f, i) => (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: "10px", marginBottom: "6px",
                background: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.border}`,
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <span style={{ fontSize: "20px" }}>{fileIcon(f)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: "12px", fontWeight: 600, color: COLORS.text,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{f.name}</div>
                  <div style={{ fontSize: "10px", color: COLORS.textMuted, fontFamily: "'DM Mono', monospace" }}>
                    {formatSize(f.size)} · {f.category}
                  </div>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  style={{
                    background: "none", border: "none", color: "#EF4444",
                    fontSize: "14px", cursor: "pointer", padding: "4px",
                    flexShrink: 0,
                  }}
                >✕</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: "280px",
          background: COLORS.surface, borderLeft: `1px solid ${COLORS.border}`,
          zIndex: 20, padding: "16px", overflowY: "auto",
          animation: "slideIn 0.25s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: COLORS.text, fontFamily: "'Sora', sans-serif" }}>
              Menu
            </span>
            <button onClick={() => setShowSidebar(false)} style={{
              background: "none", border: "none", color: COLORS.textMuted, fontSize: "18px", cursor: "pointer",
            }}>✕</button>
          </div>

          {/* User card */}
          <div style={{
            padding: "14px", borderRadius: "12px", background: COLORS.primaryGlow,
            border: `1px solid rgba(79,142,247,0.15)`, marginBottom: "16px",
          }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: COLORS.text }}>{user.fullName || "Clinician"}</div>
            <div style={{ fontSize: "11px", color: COLORS.textSoft, marginTop: "2px" }}>
              {user.specialization || "P&O Professional"}
            </div>
            <div style={{ fontSize: "10px", color: COLORS.textMuted, marginTop: "2px", fontFamily: "'DM Mono', monospace" }}>
              {user.qualification}
            </div>
          </div>

          {[
            { icon: "💬", label: "New Chat", action: async () => {
              setMessages([]); conversationRef.current = [];
              try { await window.storage.delete("ash_conversation"); } catch(e) {}
              setShowSidebar(false);
              const name = user.fullName?.split(" ")[0] || "there";
              setTimeout(() => setMessages([{
                id: "welcome", from: "ash",
                text: `Fresh start! What can I help you with, ${name}?`,
                time: new Date(),
              }]), 200);
            } },
            { icon: "📚", label: "Knowledge Base", action: () => { setShowSidebar(false); setShowFilePanel(true); } },
            { icon: "📤", label: "Upload Files", action: () => { setShowSidebar(false); fileInputRef.current?.click(); } },
            { icon: "🚪", label: "Log Out", action: () => { if (onLogout) onLogout(); } },
          ].map((item, i) => (
            <button key={i} onClick={item.action} style={{
              width: "100%", padding: "12px 14px", borderRadius: "10px",
              background: "transparent", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "10px",
              color: COLORS.textSoft, fontSize: "13px", fontWeight: 500,
              fontFamily: "'Sora', sans-serif", textAlign: "left",
              transition: "background 0.15s",
              marginBottom: "2px",
            }}
            onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,0.04)")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Consent & Privacy section */}
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase",
              letterSpacing: "0.08em", marginBottom: "10px", fontFamily: "'DM Mono', monospace" }}>
              Privacy & Sharing
            </div>

            {/* Support Access Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: COLORS.text }}>🛠️ Support Access</div>
                <div style={{ fontSize: "10px", color: COLORS.textMuted, lineHeight: 1.4 }}>
                  Let ASh team view your chat<br/>history to troubleshoot issues
                </div>
              </div>
              <button
                onClick={async () => {
                  const newVal = !consentSupport;
                  setConsentSupport(newVal);
                  try { await window.storage.set("ash_consent_support", newVal ? "true" : "false"); } catch(e) {}
                }}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                  background: consentSupport ? COLORS.success : "rgba(255,255,255,0.1)",
                  position: "relative", transition: "background 0.2s", flexShrink: 0,
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 3, transition: "left 0.2s",
                  left: consentSupport ? 23 : 3,
                }} />
              </button>
            </div>

            {/* Contact Sharing Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: COLORS.text }}>👥 Help ASh Grow</div>
                <div style={{ fontSize: "10px", color: COLORS.textMuted, lineHeight: 1.4 }}>
                  Share contacts to invite<br/>fellow P&O professionals
                </div>
              </div>
              <button
                onClick={async () => {
                  const newVal = !consentContacts;
                  setConsentContacts(newVal);
                  try { await window.storage.set("ash_consent_contacts", newVal ? "true" : "false"); } catch(e) {}
                }}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                  background: consentContacts ? COLORS.success : "rgba(255,255,255,0.1)",
                  position: "relative", transition: "background 0.2s", flexShrink: 0,
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 3, transition: "left 0.2s",
                  left: consentContacts ? 23 : 3,
                }} />
              </button>
            </div>

            {/* Share for Support button — only if consent is on */}
            {consentSupport && (
              <button
                onClick={async () => {
                  const chatData = messages.filter((m) => m.from !== "system").map((m) => ({
                    from: m.from, text: typeof m.text === "string" ? m.text : "[rich content]",
                    time: m.time?.toISOString(),
                  }));
                  try {
                    await window.storage.set("ash_support_ticket", JSON.stringify({
                      user: user.fullName, messages: chatData, sharedAt: new Date().toISOString(),
                    }));
                  } catch(e) {}
                  setMessages((prev) => [...prev, {
                    id: `support-${Date.now()}`, from: "system",
                    text: "✅ Chat shared with ASh support team. We'll look into any issues!",
                    time: new Date(),
                  }]);
                  setShowSidebar(false);
                }}
                style={{
                  width: "100%", padding: "10px", borderRadius: "10px", marginTop: "8px",
                  background: "rgba(52,211,153,0.08)", border: `1px solid rgba(52,211,153,0.2)`,
                  color: COLORS.success, fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                📩 Share Chat with Support
              </button>
            )}

            <div style={{ fontSize: "9px", color: COLORS.textMuted, marginTop: "10px", lineHeight: 1.5 }}>
              Your data is encrypted. You control what's shared. Toggle off anytime to revoke access and delete shared data.
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "16px",
        display: "flex", flexDirection: "column", gap: "16px",
      }}>
        {messages.length === 0 && !isThinking && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "16px",
            opacity: 0.6,
          }}>
            <AShOrb size={80} />
            <div style={{
              fontSize: "14px", color: COLORS.textMuted, textAlign: "center",
              fontFamily: "'Sora', sans-serif",
            }}>
              Ask me anything about<br />Prosthetics & Orthotics
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: msg.from === "user" ? "row-reverse" : "row",
              gap: "10px",
              alignItems: "flex-start",
              animation: "fadeUp 0.35s ease",
              ...(msg.from === "system" ? { justifyContent: "center" } : {}),
            }}
          >
            {/* System messages (file uploads) */}
            {msg.from === "system" ? (
              <div style={{
                padding: "6px 14px", borderRadius: "12px",
                background: "rgba(34,211,238,0.06)", border: `1px solid rgba(34,211,238,0.12)`,
                fontSize: "11px", color: COLORS.accent, fontWeight: 500,
              }}>
                {msg.text}
              </div>
            ) : (
              <>
                {msg.from === "ash" && (
                  <div style={{ flexShrink: 0, marginTop: "2px" }}>
                    <AShOrb size={32} isSpeaking />
                  </div>
                )}
                <div style={{ maxWidth: "80%", display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: msg.from === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                      background: msg.from === "user"
                        ? "linear-gradient(135deg, #4F8EF7, #6366F1)"
                        : COLORS.card,
                      border: msg.from === "ash" ? `1px solid ${COLORS.border}` : "none",
                      color: COLORS.text,
                      fontSize: "13.5px",
                      lineHeight: 1.7,
                      fontFamily: "'Sora', sans-serif",
                      boxShadow: msg.from === "user" ? "0 2px 12px rgba(79,142,247,0.2)" : "none",
                    }}
                  >
                    {msg.from === "user" ? msg.text : formatText(msg.text)}
                  </div>
                  <div style={{
                    fontSize: "10px", color: COLORS.textMuted, marginTop: "4px",
                    textAlign: msg.from === "user" ? "right" : "left",
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {msg.time?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", animation: "fadeUp 0.3s ease" }}>
            <AShOrb size={32} isThinking />
            <div style={{
              padding: "14px 16px", borderRadius: "4px 18px 18px 18px",
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
            }}>
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick suggestions (only when chat is nearly empty) */}
      {messages.length <= 1 && !isThinking && (
        <div style={{
          padding: "0 16px 8px", display: "flex", gap: "6px",
          overflowX: "auto", WebkitOverflowScrolling: "touch",
        }}>
          {[
            "PTB socket design",
            "KAFO indications",
            "Gait analysis basics",
            "Transfemoral alignment",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setInput(suggestion);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              style={{
                padding: "8px 14px", borderRadius: "20px", whiteSpace: "nowrap",
                background: "rgba(79,142,247,0.06)", border: `1px solid rgba(79,142,247,0.15)`,
                color: COLORS.primary, fontSize: "12px", fontWeight: 600,
                cursor: "pointer", fontFamily: "'Sora', sans-serif",
                transition: "all 0.15s",
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* File upload progress bar */}
      {uploadingFile && (
        <div style={{ padding: "0 16px 6px" }}>
          <div style={{
            padding: "8px 12px", borderRadius: "10px",
            background: "rgba(34,211,238,0.06)", border: `1px solid rgba(34,211,238,0.12)`,
            display: "flex", alignItems: "center", gap: "8px",
            fontSize: "12px", color: COLORS.accent,
          }}>
            <div style={{
              width: 16, height: 16, border: "2px solid rgba(34,211,238,0.3)",
              borderTopColor: COLORS.accent, borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            Processing files...
          </div>
        </div>
      )}

      {/* Input area */}
      <div style={{
        padding: "12px 16px 20px",
        borderTop: `1px solid ${COLORS.border}`,
        background: "rgba(6,8,17,0.95)", backdropFilter: "blur(20px)",
      }}>
        {/* Attachment popup */}
        {showImageUpload && (
          <div style={{
            display: "flex", gap: "8px", marginBottom: "10px",
            animation: "fadeUp 0.2s ease",
          }}>
            <button onClick={() => { fileInputRef.current?.click(); setShowImageUpload(false); }} style={{
              flex: 1, padding: "10px", borderRadius: "10px",
              background: "rgba(34,211,238,0.06)", border: `1px solid rgba(34,211,238,0.15)`,
              color: COLORS.accent, fontSize: "12px", fontWeight: 600, cursor: "pointer",
              fontFamily: "'Sora', sans-serif",
            }}>
              📄 Documents
            </button>
            <button onClick={() => {
              imageInputRef.current?.click(); setShowImageUpload(false);
            }} style={{
              flex: 1, padding: "10px", borderRadius: "10px",
              background: "rgba(244,114,182,0.06)", border: `1px solid rgba(244,114,182,0.15)`,
              color: COLORS.warm, fontSize: "12px", fontWeight: 600, cursor: "pointer",
              fontFamily: "'Sora', sans-serif",
            }}>
              🖼️ Image to Analyze
            </button>
          </div>
        )}
        <div style={{
          display: "flex", gap: "10px", alignItems: "flex-end",
        }}>
          <button
            onClick={() => setShowImageUpload(!showImageUpload)}
            style={{
              width: 42, height: 42, borderRadius: "12px", flexShrink: 0,
              background: showImageUpload ? COLORS.primaryGlow : uploadedFiles.length > 0 ? "rgba(34,211,238,0.06)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${showImageUpload ? "rgba(79,142,247,0.3)" : uploadedFiles.length > 0 ? "rgba(34,211,238,0.15)" : COLORS.border}`,
              color: showImageUpload ? COLORS.primary : uploadedFiles.length > 0 ? COLORS.accent : COLORS.textMuted,
              fontSize: "18px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}
          >
            +
          </button>
          <div style={{
            flex: 1, display: "flex", alignItems: "center",
            background: "rgba(255,255,255,0.04)", borderRadius: "22px",
            border: `1.5px solid ${input ? COLORS.borderActive : COLORS.border}`,
            padding: "4px 6px 4px 16px",
            transition: "border 0.2s",
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask ASh anything..."
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: COLORS.text, fontSize: "14px", padding: "8px 0",
                fontFamily: "'Sora', sans-serif",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isThinking}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "none",
                background: input.trim() && !isThinking
                  ? "linear-gradient(135deg, #4F8EF7, #6366F1)"
                  : "rgba(255,255,255,0.06)",
                color: input.trim() && !isThinking ? "#fff" : COLORS.textMuted,
                fontSize: "16px", cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              ↑
            </button>
          </div>
        </div>
        <div style={{
          textAlign: "center", fontSize: "10px", color: COLORS.textMuted,
          marginTop: "8px", fontFamily: "'DM Mono', monospace",
        }}>
          {uploadedFiles.length > 0
            ? `${uploadedFiles.length} file${uploadedFiles.length !== 1 ? "s" : ""} · ${chunksRef.current.length} chunks indexed · Tap + to add more`
            : "Tap + to upload textbooks · ASh uses general P&O knowledge"
          }
        </div>
      </div>

      {/* Global styles */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.textMuted}33; border-radius: 3px; }
        input::placeholder { color: ${COLORS.textMuted}; }
      `}</style>
    </div>
  );
};

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function AShApp() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);

  // Check for saved user on mount
  useEffect(() => {
    const checkSavedUser = async () => {
      try {
        const result = await window.storage.get("ash_user");
        if (result && result.value) {
          const saved = JSON.parse(result.value);
          setUser(saved);
          setScreen("chat");
          return;
        }
      } catch (e) {
        // No saved user, show splash
      }
      setScreen("splash");
    };
    checkSavedUser();
  }, []);

  const handleSplashDone = useCallback(() => setScreen("auth"), []);

  const handleAuthComplete = useCallback(async (userData) => {
    setUser(userData);
    // Save user data persistently
    try {
      await window.storage.set("ash_user", JSON.stringify(userData));
    } catch (e) {
      console.error("Storage save error:", e);
    }
    setScreen("chat");
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await window.storage.delete("ash_user");
    } catch (e) {
      console.error("Storage delete error:", e);
    }
    setUser(null);
    setScreen("auth");
  }, []);

  if (screen === "loading") {
    return (
      <div style={{ maxWidth: "430px", margin: "0 auto", height: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AShOrb size={60} isThinking />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "430px", margin: "0 auto", height: "100vh", overflow: "hidden", position: "relative", background: COLORS.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      {screen === "splash" && <SplashScreen onFinish={handleSplashDone} />}
      {screen === "auth" && <AuthScreen onComplete={handleAuthComplete} />}
      {screen === "chat" && <ChatScreen user={user || {}} onLogout={handleLogout} />}
    </div>
  );
}
