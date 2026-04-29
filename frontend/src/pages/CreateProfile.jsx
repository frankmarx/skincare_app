import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile } from "../api.js";
import { c, PageHeader, BackButton } from "../components/Common.jsx";

export default function CreateProfile({ hasProfiles }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    const n = name.trim();
    if (!n) { setError("Please enter your name."); return; }
    setLoading(true);
    setError("");
    try {
      const profile = await createProfile(n);
      navigate(`/builder/${profile.id}`);
    } catch (e) {
      setError(e.message || "Failed to create profile");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth:440, margin:"0 auto" }}>
      {hasProfiles && <BackButton onBack={() => navigate("/profiles")} label="Back to profiles" />}
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
