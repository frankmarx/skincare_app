import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmSignUp, signIn } from "../api.js";
import { c, PageHeader } from "../components/Common.jsx";

export default function ConfirmSignUp() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const password = searchParams.get("password") || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (!code) { setError("Please enter the confirmation code"); return; }
    setError("");
    setLoading(true);
    try {
      await confirmSignUp(email, code);
      await signIn(email, password);
      navigate("/profiles");
    } catch (e) {
      setError(e.message || e.error || "An error occurred during confirmation");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth:440, margin:"0 auto" }}>
      <PageHeader title={<>Verify Your <em>Account</em></>} />
      <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:"2rem" }}>
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
          Didn't get the code? <button onClick={() => navigate("/signup")} style={{ background:"none", border:"none", color:c.accent, cursor:"pointer", fontFamily:"sans-serif", fontSize:13 }}>Try again</button>
        </p>
        {error && <div style={{ marginTop:16, padding:"12px", background:c.danger, borderRadius:10, fontSize:13, color:c.dangerText, fontFamily:"sans-serif", whiteSpace:"pre-line" }}>{error}</div>}
      </div>
    </div>
  );
}
