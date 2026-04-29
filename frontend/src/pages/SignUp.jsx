import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "../api.js";
import { c, PageHeader } from "../components/Common.jsx";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setError("");
    setLoading(true);
    try {
      await signUp(email, password);
      navigate(`/confirm?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    } catch (e) {
      const msg = e.message || "";
      if (e.requirements) {
        const reqs = e.requirements.map(r => `• ${r}`).join("\n");
        const specific = e.specific_error ? `\n\nIssue: ${e.specific_error}` : "";
        setError(`${msg}\n${reqs}${specific}`);
      } else {
        setError(msg || e.error || "Something went wrong");
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth:440, margin:"0 auto" }}>
      <PageHeader title={<>Welcome to <em>Skincare Ritual</em></>} />
      <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:"2rem" }}>
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
          Already have an account? <button onClick={() => navigate("/signin")} style={{ background:"none", border:"none", color:c.accent, cursor:"pointer", fontFamily:"sans-serif", fontSize:13 }}>Sign in</button>
        </p>
        {error && <div style={{ marginTop:16, padding:"12px", background:c.danger, borderRadius:10, fontSize:13, color:c.dangerText, fontFamily:"sans-serif", whiteSpace:"pre-line" }}>{error}</div>}
      </div>
    </div>
  );
}
