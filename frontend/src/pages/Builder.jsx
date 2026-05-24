import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveRitual, getProfiles } from "../api.js";
import { c, PageHeader, BackButton, ProductAutocomplete } from "../components/Common.jsx";
import layoutStyles from "./Layout.module.css";
import { useProfile } from "../context/ProfileContext.jsx";

export default function Builder() {
  const navigate = useNavigate();
  const { selectedProfile, loading: profileLoading } = useProfile();
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name:"", type:"Cleanser" });
  const [error, setError] = useState("");
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

  const saveRitualHandler = async () => {
    if (!products.length || !selectedProfile) return;
    setSaving(true); setError("");
    try {
      // Save without analysis results for now
      await saveRitual(selectedProfile.id, products, {});
      navigate("/rituals");
    } catch (e) {
      setError(e.message || "Failed to save ritual");
      setSaving(false);
    }
  };

  if (profileLoading || !selectedProfile) return null;

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.header}>
        <BackButton onBack={() => navigate("/rituals")} label="Back to rituals" />
      </div>
      <PageHeader eyebrow={selectedProfile.name} title={<>Build Your <em>Ritual</em></>} />

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

        <button onClick={saveRitualHandler} disabled={!products.length || saving}
          style={{ width:"100%", padding:"15px", borderRadius:12, border:"none", background:products.length?c.accent:c.border, color:products.length?"#fff":c.muted, fontSize:16, fontFamily:"'Georgia',serif", cursor:products.length?"pointer":"default", letterSpacing:"0.03em", transition:"background 0.2s" }}>
          {saving ? "Saving..." : "Save Ritual to Profile ✓"}
        </button>
      </>
    </div>
  );
}
