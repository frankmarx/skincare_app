import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProductSuggestions, signOut } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import styles from "./Common.module.css";

export const c = {
  bg:"#FDF8F5", card:"#FFFFFF", accent:"#C9806A", accentLight:"#F5E6DF",
  accentDark:"#8B4A35", muted:"#9C8880", border:"#EAD9D0", text:"#2C1A14",
  textSoft:"#7A5C52", tag:"#F0E4DE", tagText:"#7A3E28",
  am:"#FFF4E6", amBorder:"#E8A45A", amText:"#7A4A10",
  pm:"#EEF0FF", pmBorder:"#8A90D4", pmText:"#2D3380",
  success:"#EAF3DE", successText:"#3B6D11",
  danger:"#FCEBEB", dangerBorder:"#F09595", dangerText:"#A32D2D",
};

export function SignOutButton() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleSignOut = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <button onClick={handleSignOut} className={styles.signOutBtn}>
      Sign Out
    </button>
  );
}

export function useDebounce(value, delay) {
// ... (rest of the file remains the same)
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

export function Spinner({ center }) {
  const el = (
    <div style={{ width:16, height:16, border:`2px solid ${c.border}`, borderTopColor:c.accent, borderRadius:"50%", animation:"sk-spin 0.7s linear infinite", flexShrink:0 }} />
  );
  if (!center) return el;
  return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"4rem 0" }}>{el}</div>;
}

export function ProductAutocomplete({ value, onChange, onSelect, onEnter }) {
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

export function RoutineCard({ items, label, colors }) {
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

export function RitualView({ result }) {
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

export function BackButton({ onBack, label }) {
  return (
    <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:c.muted, fontSize:13, fontFamily:"sans-serif", padding:0, marginBottom:16, display:"flex", alignItems:"center", gap:4 }}>
      ← {label || "Back"}
    </button>
  );
}

export function PageHeader({ eyebrow, title }) {
  return (
    <div style={{ textAlign:"center", marginBottom:"2rem", marginTop:"2rem" }}>
      <div style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:c.accent, fontFamily:"sans-serif", marginBottom:6 }}>
        {eyebrow || "Skincare Intelligence"}
      </div>
      <h1 style={{ fontSize:28, fontWeight:400, color:c.text, margin:0, lineHeight:1.25 }}>{title}</h1>
      <div style={{ width:36, height:1.5, background:c.accent, margin:"12px auto 0" }} />
    </div>
  );
}
