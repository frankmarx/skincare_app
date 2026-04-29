import { useState, useEffect, useRef } from "react";
import {
  signUp, confirmSignUp, signIn, signOut, getTokens, loadStoredTokens,
  getProfiles, createProfile, deleteProfile,
  getProductSuggestions, analyzeRoutine, getRitual, saveRitual
} from "./api.js";

const PRODUCT_TYPES = [
  "Cleanser","Toner","Essence","Serum","Moisturizer","Eye Cream",
  "Sunscreen","Exfoliant / AHA / BHA","Retinol / Retinoid","Face Oil",
  "Sheet Mask","Clay Mask","Spot Treatment","Mist / Setting Spray","Other"
];

const c = {
  bg:"#FDF8F5", card:"#FFFFFF", accent:"#C9806A", accentLight:"#F5E6DF",
  accentDark:"#8B4A35", muted:"#9C8880", border:"#EAD9D0", text:"#2C1A14",
  textSoft:"#7A5C52", tag:"#F0E4DE", tagText:"#7A3E28",
  am:"#FFF4E6", amBorder:"#E8A45A", amText:"#7A4A10",
  pm:"#EEF0FF", pmBorder:"#8A90D4", pmText:"#2D3380",
  success:"#EAF3DE", successText:"#3B6D11",
  danger:"#FCEBEB", dangerBorder:"#F09595", dangerText:"#A32D2D",
};

function useDebounce(value, delay) {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

function Spinner({ center }) {
  const el = (
    <div style={{ width:16, height:16, border:`2px solid ${c.border}`, borderTopColor:c.accent, borderRadius:"50%", animation:"sk-spin 0.7s linear infinite", flexShrink:0 }} />
  );
  if (!center) return el;
  return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"4rem 0" }}>{el}</div>;
}

function ProductAutocomplete({ value, onChange, onSelect, onEnter }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const dq = useDebounce(value, 350);
  const abortRef = useRef(null);
  const wrapRef = useRef(null);
  const justSelected = useRef(false);

  useEffect(() => {
    const q = dq.trim();
    if (justSelected.current) { justSelected.current = false; return; }
    if (!q) { setSuggestions([]); setOpen(false); return; }
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);

    getProductSuggestions(q)
      .then(data => {
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        setOpen(true);
        setActiveIdx(-1);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, [dq]);

  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const pick = s => {
    justSelected.current = true;
    if (abortRef.current) abortRef.current.abort();
    setLoading(false); setSuggestions([]); onSelect(s); setOpen(false);
  };

  const kd = e => {
    if (!open || !suggestions.length) { if (e.key === "Enter") onEnter(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i+1, suggestions.length-1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i-1, -1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (activeIdx >= 0) pick(suggestions[activeIdx]); else onEnter(); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position:"relative", flex:"2 1 200px" }}>
      <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
        <input
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onKeyDown={kd}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Start typing a brand or product..."
          autoComplete="off"
          style={{ width:"100%", padding:"11px 40px 11px 14px", borderRadius:10, border:`1px solid ${c.border}`, fontSize:14, fontFamily:"sans-serif", background:c.bg, color:c.text, outline:"none", boxSizing:"border-box" }}
        />
        {loading && (
          <div style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)" }}>
            <Spinner />
          </div>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:c.card, border:`1px solid ${c.border}`, borderRadius:12, boxShadow:"0 8px 24px rgba(44,26,20,0.12)", zIndex:200, overflow:"hidden" }}>
          {suggestions.map((s, i) => (
            <div key={i} onMouseDown={() => pick(s)} onMouseEnter={() => setActiveIdx(i)}
              style={{ padding:"10px 14px", cursor:"pointer", background:i===activeIdx?c.accentLight:"transparent", borderBottom:i<suggestions.length-1?`1px solid ${c.border}`:"none", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, transition:"background 0.1s" }}>
              <div>
                <span style={{ fontSize:14, fontWeight:600, color:c.text, fontFamily:"sans-serif" }}>{s.name}</span>
                <span style={{ fontSize:12, color:c.muted, marginLeft:8, fontFamily:"sans-serif" }}>{s.brand}</span>
              </div>
              <span style={{ fontSize:11, color:c.accentDark, background:c.tag, borderRadius:20, padding:"3px 10px", whiteSpace:"nowrap", fontFamily:"sans-serif", flexShrink:0 }}>{s.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoutineCard({ items, label, colors }) {
  return (
    <div style={{ background:colors.bg, border:`1.5px solid ${colors.border}`, borderRadius:16, padding:"1.25rem", flex:1, minWidth:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:colors.border }} />
        <span style={{ fontSize:12, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:colors.text, fontFamily:"sans-serif" }}>{label}</span>
      </div>
      {items.map(item => (
        <div key={item.step} style={{ display:"flex", gap:12, marginBottom:14, alignItems:"flex-start" }}>
          <div style={{ width:26, height:26, borderRadius:"50%", background:colors.border, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:12, fontWeight:700, color:colors.text }}>{item.step}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:600, fontSize:14, color:c.text, lineHeight:1.3 }}>{item.productName}</div>
            <div style={{ fontSize:12, color:c.textSoft, marginTop:2 }}>{item.type}</div>
            {item.tip && <div style={{ fontSize:12, color:c.muted, marginTop:3, fontStyle:"italic" }}>{item.tip}</div>}
            <span style={{ display:"inline-block", marginTop:5, fontSize:11, fontWeight:600, background:colors.bg, border:`1px solid ${colors.border}`, borderRadius:20, padding:"2px 10px", color:colors.text }}>{item.frequency}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RitualView({ result }) {
  return (
    <>
      <div style={{ background:c.accentLight, border:`1.5px solid ${c.border}`, borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem" }}>
        <div style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:c.accent, fontFamily:"sans-serif", marginBottom:8 }}>Skin Profile</div>
        <div style={{ fontSize:22, fontWeight:400, color:c.text, marginBottom:8 }}>{result.skinProfile.type}</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
          {result.skinProfile.concerns.map((concern, i) => (
            <span key={i} style={{ background:"#fff", border:`1px solid ${c.border}`, borderRadius:20, padding:"4px 12px", fontSize:12, color:c.accentDark, fontFamily:"sans-serif" }}>{concern}</span>
          ))}
        </div>
        <p style={{ margin:0, fontSize:14, color:c.textSoft, fontFamily:"sans-serif", lineHeight:1.7 }}>{result.skinProfile.summary}</p>
      </div>

      <div style={{ display:"flex", gap:16, marginBottom:"1.5rem", flexWrap:"wrap" }}>
        {result.amRoutine?.length > 0 && <RoutineCard items={result.amRoutine} label="Morning Routine" colors={{ bg:c.am, border:c.amBorder, text:c.amText }} />}
        {result.pmRoutine?.length > 0 && <RoutineCard items={result.pmRoutine} label="Evening Routine" colors={{ bg:c.pm, border:c.pmBorder, text:c.pmText }} />}
      </div>

      {result.weeklyFrequency?.length > 0 && (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem" }}>
          <div style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:c.accent, fontFamily:"sans-serif", marginBottom:14 }}>Weekly Frequency</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {result.weeklyFrequency.map((item, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <span style={{ flex:1, fontSize:14, color:c.text, fontFamily:"sans-serif", minWidth:120 }}>{item.productName}</span>
                <span style={{ background:c.success, color:c.successText, borderRadius:20, padding:"4px 14px", fontSize:12, fontWeight:600, fontFamily:"sans-serif", whiteSpace:"nowrap" }}>{item.frequency}</span>
                {item.note && <span style={{ fontSize:12, color:c.muted, fontFamily:"sans-serif", fontStyle:"italic", flex:2, minWidth:100 }}>{item.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {result.warnings?.length > 0 && (
        <div style={{ background:"#FFF9E6", border:"1.5px solid #E8C96A", borderRadius:16, padding:"1.25rem", marginBottom:"1.5rem" }}>
          <div style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:"#9A6B00", fontFamily:"sans-serif", marginBottom:10 }}>Important notes</div>
          {result.warnings.map((w, i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
              <span style={{ fontSize:14, flexShrink:0, marginTop:1, color:"#C48A00" }}>⚠</span>
              <span style={{ fontSize:13, color:"#7A5200", fontFamily:"sans-serif", lineHeight:1.6 }}>{w}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function BackButton({ onBack, label }) {
  return (
    <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:c.muted, fontSize:13, fontFamily:"sans-serif", padding:0, marginBottom:16, display:"flex", alignItems:"center", gap:4 }}>
      ← {label || "Back"}
    </button>
  );
}

function PageHeader({ eyebrow, title }) {
  return (
    <div style={{ textAlign:"center", marginBottom:"2rem" }}>
      <div style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:c.accent, fontFamily:"sans-serif", marginBottom:6 }}>
        {eyebrow || "Skincare Intelligence"}
      </div>
      <h1 style={{ fontSize:28, fontWeight:400, color:c.text, margin:0, lineHeight:1.25 }}>{title}</h1>
      <div style={{ width:36, height:1.5, background:c.accent, margin:"12px auto 0" }} />
    </div>
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        onAuthenticated();
      } else if (mode === "signup") {
        await signUp(email, password);
        setMode("confirm");
      }
    } catch (e) {
      const errorType = e.error || "";
      const msg = e.message || "";
      if (errorType === "no_account" || msg.includes("no_account")) {
        setError("No account associated with this email. ");
        setMode("signup");
      } else if (errorType === "Incorrect password" || msg.includes("Incorrect password")) {
        setError("Incorrect password");
      } else if (errorType === "password_policy_error" || errorType === "password_too_short") {
        const reqs = e.requirements 
          ? e.requirements.map(r => `• ${r}`).join("\n") 
          : "Check password complexity";
        const specific = e.specific_error ? `\n\nIssue: ${e.specific_error}` : "";
        setError(`${msg}\n${reqs}${specific}`);
      } else {
        setError(msg || e.error || "Something went wrong");
      }
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!code) { setError("Please enter the confirmation code"); return; }
    setError("");
    setLoading(true);
    try {
      await confirmSignUp(email, code);
      await signIn(email, password);
      onAuthenticated();
    } catch (e) {
      setError(e.message || e.error || "An error occurred during confirmation");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth:440, margin:"0 auto" }}>
      <PageHeader title={<>Welcome to <em>Skincare Ritual</em></>} />
      <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:"2rem" }}>
        {mode === "login" && (
          <>
            <p style={{ margin:"0 0 20px", fontSize:14, color:c.textSoft, fontFamily:"sans-serif", lineHeight:1.7, textAlign:"center" }}>
              Sign in to access your skincare profiles.
            </p>
            <label style={{ fontSize:12, fontWeight:600, color:c.textSoft, fontFamily:"sans-serif", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${c.border}`, fontSize:15, fontFamily:"sans-serif", background:c.bg, color:c.text, outline:"none", boxSizing:"border-box", marginBottom:16 }} />
            <label style={{ fontSize:12, fontWeight:600, color:c.textSoft, fontFamily:"sans-serif", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${c.border}`, fontSize:15, fontFamily:"sans-serif", background:c.bg, color:c.text, outline:"none", boxSizing:"border-box", marginBottom:20 }} />
            <button onClick={handleSubmit} disabled={loading}
              style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", background:c.accent, color:"#fff", fontSize:15, fontFamily:"'Georgia',serif", cursor:"pointer", letterSpacing:"0.02em" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <p style={{ margin:"16px 0 0", fontSize:13, color:c.textSoft, textAlign:"center", fontFamily:"sans-serif" }}>
              Don't have an account? <button onClick={() => setMode("signup")} style={{ background:"none", border:"none", color:c.accent, cursor:"pointer", fontFamily:"sans-serif", fontSize:13 }}>Sign up</button>
            </p>
          </>
        )}
        {mode === "signup" && (
          <>
            <p style={{ margin:"0 0 20px", fontSize:14, color:c.textSoft, fontFamily:"sans-serif", lineHeight:1.7, textAlign:"center" }}>
              Create an account to save your skincare rituals.
            </p>
            <label style={{ fontSize:12, fontWeight:600, color:c.textSoft, fontFamily:"sans-serif", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${c.border}`, fontSize:15, fontFamily:"sans-serif", background:c.bg, color:c.text, outline:"none", boxSizing:"border-box", marginBottom:16 }} />
            <label style={{ fontSize:12, fontWeight:600, color:c.textSoft, fontFamily:"sans-serif", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${c.border}`, fontSize:15, fontFamily:"sans-serif", background:c.bg, color:c.text, outline:"none", boxSizing:"border-box", marginBottom:20 }} />
            <button onClick={handleSubmit} disabled={loading}
              style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", background:c.accent, color:"#fff", fontSize:15, fontFamily:"'Georgia',serif", cursor:"pointer", letterSpacing:"0.02em" }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <p style={{ margin:"16px 0 0", fontSize:13, color:c.textSoft, textAlign:"center", fontFamily:"sans-serif" }}>
              Already have an account? <button onClick={() => setMode("login")} style={{ background:"none", border:"none", color:c.accent, cursor:"pointer", fontFamily:"sans-serif", fontSize:13 }}>Sign in</button>
            </p>
          </>
        )}
        {mode === "confirm" && (
          <>
            <p style={{ margin:"0 0 20px", fontSize:14, color:c.textSoft, fontFamily:"sans-serif", lineHeight:1.7, textAlign:"center" }}>
              Check your email for a confirmation code.
            </p>
            <label style={{ fontSize:12, fontWeight:600, color:c.textSoft, fontFamily:"sans-serif", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Confirmation Code</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="123456"
              onKeyDown={e => e.key === "Enter" && handleConfirm()}
              style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${c.border}`, fontSize:15, fontFamily:"sans-serif", background:c.bg, color:c.text, outline:"none", boxSizing:"border-box", marginBottom:20 }} />
            <button onClick={handleConfirm} disabled={loading}
              style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", background:c.accent, color:"#fff", fontSize:15, fontFamily:"'Georgia',serif", cursor:"pointer", letterSpacing:"0.02em" }}>
              {loading ? "Confirming..." : "Confirm"}
            </button>
            <p style={{ margin:"16px 0 0", fontSize:13, color:c.textSoft, textAlign:"center", fontFamily:"sans-serif" }}>
              Didn't get the code? <button onClick={() => setMode("signup")} style={{ background:"none", border:"none", color:c.accent, cursor:"pointer", fontFamily:"sans-serif", fontSize:13 }}>Try again</button>
            </p>
          </>
        )}
        {error && <div style={{ marginTop:16, padding:"12px", background:c.danger, borderRadius:10, fontSize:13, color:c.dangerText, fontFamily:"sans-serif", whiteSpace:"pre-line" }}>{error}</div>}
      </div>
    </div>
  );
}

function CreateProfileScreen({ onCreated, onBack, hasProfiles }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const n = name.trim();
    if (!n) { setError("Please enter your name."); return; }
    setLoading(true);
    setError("");
    try {
      const profile = await createProfile(n);
      onCreated(profile);
    } catch (e) {
      setError(e.message || "Failed to create profile");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth:440, margin:"0 auto" }}>
      {hasProfiles && <BackButton onBack={onBack} label="Back to profiles" />}
      <PageHeader title={<>Create Your <em>Profile</em></>} />
      <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:"2rem" }}>
        <p style={{ margin:"0 0 20px", fontSize:14, color:c.textSoft, fontFamily:"sans-serif", lineHeight:1.7, textAlign:"center" }}>
          Enter your name to create a profile. Your skincare ritual will be saved and accessible anytime.
        </p>
        <label style={{ fontSize:12, fontWeight:600, color:c.textSoft, fontFamily:"sans-serif", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Your name</label>
        <input
          value={name}
          onChange={e => { setName(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleCreate()}
          placeholder="e.g. Sarah"
          autoFocus
          style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${error ? c.dangerBorder : c.border}`, fontSize:15, fontFamily:"sans-serif", background:c.bg, color:c.text, outline:"none", boxSizing:"border-box", marginBottom: error ? 8 : 20 }}
        />
        {error && <div style={{ fontSize:12, color:c.dangerText, fontFamily:"sans-serif", marginBottom:16 }}>{error}</div>}
        <button onClick={handleCreate} disabled={loading}
          style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", background:c.accent, color:"#fff", fontSize:15, fontFamily:"'Georgia',serif", cursor:"pointer", letterSpacing:"0.02em" }}>
          {loading ? "Creating..." : "Create Profile →"}
        </button>
      </div>
    </div>
  );
}

function ProfilesScreen({ profiles, onOpen, onDelete, onNew, onSignOut }) {
  return (
    <div style={{ maxWidth:560, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
        <PageHeader title={<>Your <em>Profiles</em></>} />
        <button onClick={onSignOut} style={{ background:"none", border:"1px solid", borderColor:c.border, borderRadius:8, padding:"8px 16px", fontSize:12, color:c.muted, fontFamily:"sans-serif", cursor:"pointer" }}>
          Sign Out
        </button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:"1.25rem" }}>
        {profiles.map(profile => (
          <div key={profile.id}
            onClick={() => onOpen(profile)}
            style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:14, padding:"1rem 1.25rem", display:"flex", alignItems:"center", gap:14, cursor:"pointer", transition:"border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = c.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
          >
            <div style={{ width:46, height:46, borderRadius:"50%", background:c.accentLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontStyle:"italic", color:c.accent, flexShrink:0, fontFamily:"Georgia,serif" }}>
              {profile.name[0]}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:16, fontWeight:400, color:c.text }}>{profile.name}</div>
              <div style={{ fontSize:12, color:c.muted, fontFamily:"sans-serif", marginTop:2 }}>
                {profile.updatedAt
                  ? `Last updated ${new Date(profile.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`
                  : `Created ${new Date(profile.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`}
              </div>
            </div>
            <span style={{ fontSize:12, color:c.accent, fontFamily:"sans-serif", flexShrink:0 }}>Open →</span>
            <button
              onClick={e => { e.stopPropagation(); onDelete(profile.id); }}
              style={{ background:"none", border:"none", cursor:"pointer", color:c.muted, fontSize:20, padding:"0 0 0 6px", lineHeight:1 }}
              title="Delete profile"
            >×</button>
          </div>
        ))}
      </div>
      <button onClick={onNew}
        style={{ width:"100%", padding:"13px", borderRadius:10, border:`1.5px solid ${c.accent}`, background:c.accent, color:"#fff", fontSize:14, fontFamily:"sans-serif", cursor:"pointer", fontWeight:600 }}>
        + Create New Profile
      </button>
    </div>
  );
}

function BuilderScreen({ profile, onBack, onSaved, onSignOut }) {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name:"", type:"Cleanser" });
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [pendingResult, setPendingResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const addProduct = () => {
    if (!newProduct.name.trim()) return;
    setProducts(prev => [...prev, { ...newProduct, id: Date.now() }]);
    setNewProduct({ name:"", type:"Cleanser" });
  };

  const analyze = async () => {
    if (!products.length) return;
    setAnalyzing(true); setError("");
    try {
      const data = await analyzeRoutine(products);
      setPendingResult(data.result);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    }
    setAnalyzing(false);
  };

  const saveRitualHandler = async () => {
    if (!pendingResult) return;
    setSaving(true);
    try {
      await saveRitual(profile.id, products, pendingResult);
      onSaved({ products, result: pendingResult, savedAt: new Date().toISOString() });
    } catch (e) {
      setError(e.message || "Failed to save ritual");
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth:720, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <BackButton onBack={onBack} label="Back to profiles" />
        <button onClick={onSignOut} style={{ background:"none", border:"1px solid", borderColor:c.border, borderRadius:8, padding:"8px 16px", fontSize:12, color:c.muted, fontFamily:"sans-serif", cursor:"pointer" }}>
          Sign Out
        </button>
      </div>
      <PageHeader eyebrow={profile.name} title={<>Build Your <em>Ritual</em></>} />

      {pendingResult ? (
        <>
          <div style={{ background:c.success, border:`1px solid #9FCE7A`, borderRadius:12, padding:"12px 16px", marginBottom:"1.5rem", fontFamily:"sans-serif", fontSize:13, color:c.successText, display:"flex", alignItems:"center", gap:10 }}>
            <span>✓</span> Analysis complete — review below, then save to your profile.
          </div>
          <RitualView result={pendingResult} />
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setPendingResult(null)}
              style={{ flex:1, padding:"12px", borderRadius:10, border:`1px solid ${c.border}`, background:"transparent", color:c.textSoft, fontSize:14, fontFamily:"sans-serif", cursor:"pointer" }}>
              ← Edit products
            </button>
            <button onClick={saveRitualHandler} disabled={saving}
              style={{ flex:2, padding:"12px", borderRadius:10, border:"none", background:c.accent, color:"#fff", fontSize:14, fontFamily:"sans-serif", cursor:"pointer", fontWeight:600, opacity:saving?0.7:1 }}>
              {saving ? "Saving..." : "Save Ritual to Profile ✓"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem" }}>
            <div style={{ fontSize:12, fontWeight:600, color:c.textSoft, fontFamily:"sans-serif", marginBottom:14, letterSpacing:"0.06em", textTransform:"uppercase" }}>Add a product</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-start" }}>
              <ProductAutocomplete
                value={newProduct.name}
                onChange={name => setNewProduct(p => ({ ...p, name }))}
                onSelect={s => setNewProduct({ name:s.name, type:s.type })}
                onEnter={addProduct}
              />
              <select value={newProduct.type} onChange={e => setNewProduct(p => ({ ...p, type:e.target.value }))}
                style={{ flex:"1 1 140px", padding:"11px 14px", borderRadius:10, border:`1px solid ${c.border}`, fontSize:13, fontFamily:"sans-serif", background:c.bg, color:c.text, outline:"none" }}>
                {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <button onClick={addProduct} disabled={!newProduct.name.trim()}
                style={{ padding:"11px 22px", borderRadius:10, border:"none", background:newProduct.name.trim()?c.accent:c.accentLight, color:newProduct.name.trim()?"#fff":c.muted, fontSize:14, fontFamily:"sans-serif", cursor:newProduct.name.trim()?"pointer":"default", fontWeight:600 }}>
                Add
              </button>
            </div>
          </div>

          {products.length > 0 && (
            <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:"1.5rem", marginBottom:"1.5rem" }}>
              <div style={{ fontSize:12, fontWeight:600, color:c.textSoft, fontFamily:"sans-serif", marginBottom:14, letterSpacing:"0.06em", textTransform:"uppercase" }}>Your products ({products.length})</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {products.map(pr => (
                  <div key={pr.id} style={{ display:"flex", alignItems:"center", gap:8, background:c.tag, border:`1px solid ${c.border}`, borderRadius:30, padding:"6px 14px 6px 12px" }}>
                    <span style={{ fontSize:13, fontWeight:600, color:c.tagText, fontFamily:"sans-serif" }}>{pr.name}</span>
                    <span style={{ fontSize:11, color:c.muted, fontFamily:"sans-serif" }}>{pr.type}</span>
                    <button onClick={() => setProducts(p => p.filter(x => x.id !== pr.id))}
                      style={{ background:"none", border:"none", cursor:"pointer", color:c.muted, fontSize:16, lineHeight:1, padding:0, marginLeft:2 }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ background:c.danger, border:`1px solid ${c.dangerBorder}`, borderRadius:10, padding:"12px 16px", fontSize:13, color:c.dangerText, fontFamily:"sans-serif", marginBottom:"1rem" }}>{error}</div>
          )}

          <button onClick={analyze} disabled={!products.length || analyzing}
            style={{ width:"100%", padding:"15px", borderRadius:12, border:"none", background:products.length?c.accent:c.border, color:products.length?"#fff":c.muted, fontSize:16, fontFamily:"'Georgia',serif", cursor:products.length?"pointer":"default", letterSpacing:"0.03em", transition:"background 0.2s" }}>
            {analyzing ? "Analyzing your ritual..." : "Analyze My Routine →"}
          </button>
        </>
      )}
    </div>
  );
}

function SavedRitualScreen({ profile, ritual, onBack, onRebuild, onSignOut }) {
  return (
    <div style={{ maxWidth:720, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <BackButton onBack={onBack} label="All profiles" />
        <button onClick={onSignOut} style={{ background:"none", border:"1px solid", borderColor:c.border, borderRadius:8, padding:"8px 16px", fontSize:12, color:c.muted, fontFamily:"sans-serif", cursor:"pointer" }}>
          Sign Out
        </button>
      </div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:"2rem" }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:c.accent, fontFamily:"sans-serif", marginBottom:6 }}>Skincare Intelligence</div>
          <h1 style={{ fontSize:26, fontWeight:400, color:c.text, margin:0 }}><em>{profile.name}'s</em> Ritual</h1>
          {ritual?.savedAt && (
            <div style={{ fontSize:12, color:c.muted, fontFamily:"sans-serif", marginTop:5 }}>
              Last saved {new Date(ritual.savedAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
            </div>
          )}
          <div style={{ width:36, height:1.5, background:c.accent, marginTop:12 }} />
        </div>
        <button onClick={onRebuild}
          style={{ padding:"9px 18px", borderRadius:10, border:`1px solid ${c.border}`, background:"transparent", color:c.textSoft, fontSize:13, fontFamily:"sans-serif", cursor:"pointer", marginTop:4 }}>
          Rebuild Ritual
        </button>
      </div>

      {ritual?.products?.length > 0 && (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:"1.25rem", marginBottom:"1.5rem" }}>
          <div style={{ fontSize:12, fontWeight:600, color:c.textSoft, fontFamily:"sans-serif", marginBottom:12, letterSpacing:"0.06em", textTransform:"uppercase" }}>Products in this ritual</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {ritual.products.map((pr, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6, background:c.tag, border:`1px solid ${c.border}`, borderRadius:30, padding:"5px 12px" }}>
                <span style={{ fontSize:13, fontWeight:600, color:c.tagText, fontFamily:"sans-serif" }}>{pr.name}</span>
                <span style={{ fontSize:11, color:c.muted, fontFamily:"sans-serif" }}>{pr.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {ritual ? <RitualView result={ritual.result} /> : (
        <div style={{ textAlign:"center", padding:"3rem 0", color:c.muted, fontFamily:"sans-serif" }}>
          No ritual saved yet.{" "}
          <button onClick={onRebuild} style={{ background:"none", border:"none", cursor:"pointer", color:c.accent, fontFamily:"sans-serif", fontSize:14, textDecoration:"underline" }}>Build one now</button>
        </div>
      )}
    </div>
  );
}

export default function SkincareApp() {
  const [screen, setScreen] = useState("loading");
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [activeRitual, setActiveRitual] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (loadStoredTokens()) {
      setIsAuthenticated(true);
      loadProfiles();
    } else {
      setScreen("auth");
    }
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await getProfiles();
      setProfiles(data.profiles || []);
      setScreen(data.profiles?.length > 0 ? "profiles" : "create-profile");
    } catch (e) {
      if (e.message?.includes("401") || e.message?.includes("Unauthorized")) {
        signOut();
        setScreen("auth");
      } else {
        setScreen("create-profile");
      }
    }
  };

  const handleSignOut = () => {
    signOut();
    setIsAuthenticated(false);
    setProfiles([]);
    setActiveProfile(null);
    setActiveRitual(null);
    setScreen("auth");
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    loadProfiles();
  };

  const handleProfileCreated = profile => {
    setProfiles(prev => [...prev, profile]);
    setActiveProfile(profile);
    setActiveRitual(null);
    setScreen("builder");
  };

  const handleOpenProfile = async profile => {
    setActiveProfile(profile);
    try {
      const data = await getRitual(profile.id);
      setActiveRitual(data.ritual);
      setScreen(data.ritual ? "saved-ritual" : "builder");
    } catch {
      setActiveRitual(null);
      setScreen("builder");
    }
  };

  const handleDeleteProfile = async id => {
    try {
      await deleteProfile(id);
      setProfiles(prev => prev.filter(p => p.id !== id));
      if (activeProfile?.id === id) {
        setActiveProfile(null);
        setActiveRitual(null);
        setScreen("profiles");
      }
    } catch (e) {
      console.error("Failed to delete profile:", e);
    }
  };

  const handleRitualSaved = ({ products, result, savedAt }) => {
    const ritual = { products, result, savedAt };
    setActiveRitual(ritual);
    setProfiles(prev => prev.map(p => p.id === activeProfile.id ? { ...p, updatedAt: savedAt } : p));
    setScreen("saved-ritual");
  };

  const wrap = children => (
    <div style={{ fontFamily:"'Georgia','Times New Roman',serif", background:c.bg, minHeight:"100vh", padding:"env(safe-area-inset-top,0) 0 0", boxSizing:"border-box" }}>
      <style>{`@keyframes sk-spin{to{transform:rotate(360deg);}} * { -webkit-tap-highlight-color: transparent; }`}</style>
      <div style={{ padding:"2rem 1rem" }}>
        {children}
      </div>
    </div>
  );

  if (screen === "loading") return wrap(<div style={{ display:"flex", justifyContent:"center", paddingTop:"4rem" }}><Spinner /></div>);

  if (screen === "auth") return wrap(<AuthScreen onAuthenticated={handleAuthenticated} />);

  if (screen === "create-profile") return wrap(
    <CreateProfileScreen hasProfiles={profiles.length > 0} onCreated={handleProfileCreated} onBack={() => setScreen("profiles")} />
  );

  if (screen === "profiles") return wrap(
    <ProfilesScreen profiles={profiles} onOpen={handleOpenProfile} onDelete={handleDeleteProfile} onNew={() => setScreen("create-profile")} onSignOut={handleSignOut} />
  );

  if (screen === "builder") return wrap(
    <BuilderScreen profile={activeProfile} onBack={() => setScreen(profiles.length > 0 ? "profiles" : "create-profile")} onSaved={handleRitualSaved} onSignOut={handleSignOut} />
  );

  if (screen === "saved-ritual") return wrap(
    <SavedRitualScreen profile={activeProfile} ritual={activeRitual} onBack={() => setScreen("profiles")} onRebuild={() => setScreen("builder")} onSignOut={handleSignOut} />
  );

  return null;
}
