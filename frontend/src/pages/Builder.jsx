import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeRoutine, saveRitual, getProfiles } from "../api.js";
import { c, PageHeader, BackButton, ProductAutocomplete, RitualView } from "../components/Common.jsx";
import { useProfile } from "../context/ProfileContext.jsx";

export default function Builder() {
  const navigate = useNavigate();
  const { selectedProfile, loading: profileLoading } = useProfile();
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name:"", type:"Cleanser" });
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [pendingResult, setPendingResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const PRODUCT_TYPES = [
    "Cleanser","Toner","Essence","Serum","Moisturizer","Eye Cream",
    "Sunscreen","Exfoliant / AHA / BHA","Retinol / Retinoid","Face Oil",
    "Sheet Mask","Clay Mask","Spot Treatment","Mist / Setting Spray","Other"
  ];

  useEffect(() => {
    if (!selectedProfile && !profileLoading) {
      navigate("/profiles");
    }
  }, [selectedProfile, profileLoading, navigate]);

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
    if (!pendingResult || !selectedProfile) return;
    setSaving(true);
    try {
      await saveRitual(selectedProfile.id, products, pendingResult);
      navigate("/rituals");
    } catch (e) {
      setError(e.message || "Failed to save ritual");
      setSaving(false);
    }
  };

  if (profileLoading || !selectedProfile) return null;

  return (
    <div style={{ maxWidth:720, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <BackButton onBack={() => navigate("/rituals")} label="Back to rituals" />
      </div>
      <PageHeader eyebrow={selectedProfile.name} title={<>Build Your <em>Ritual</em></>} />

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
