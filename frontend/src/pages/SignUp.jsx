import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "../api.js";
import { PageHeader, FormCard, FormLabel, Input, PrimaryButton } from "../components/Common.jsx";
import styles from "../components/Common.module.css";

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
    <div className={styles.formContainer}>
      <PageHeader title={<>Welcome to <em>Skincare Ritual</em></>} />
      <FormCard>
        <p className={styles.formTextCenter}>
          Create an account to save your skincare rituals.
        </p>
        <FormLabel>Email</FormLabel>
        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        <FormLabel>Password</FormLabel>
        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
          onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        <PrimaryButton onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </PrimaryButton>
        <p className={styles.formFooterText}>
          Already have an account? <button onClick={() => navigate("/signin")} className={styles.formFooterLink}>Sign in</button>
        </p>
        {error && <div className={styles.formErrorMsg}>{error}</div>}
      </FormCard>
    </div>
  );
}
