import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { PageHeader, FormCard, FormLabel, Input, PrimaryButton } from "../components/Common.jsx";
import styles from "../components/Common.module.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setError("");
    setLoading(true);
    try {
      const data = await signIn(email, password);
      login(data.user);
      navigate("/profiles");
    } catch (e) {
      const errorType = e.error || "";
      const msg = e.message || "";
      if (errorType === "no_account" || msg.includes("no_account")) {
        setError("No account associated with this email.");
        navigate("/signup");
      } else if (errorType === "Incorrect password" || msg.includes("Incorrect password")) {
        setError("Incorrect password");
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
          Sign in to access your skincare profiles.
        </p>
        <FormLabel>Email</FormLabel>
        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        <FormLabel>Password</FormLabel>
        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
          onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        <PrimaryButton onClick={handleSubmit} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </PrimaryButton>
        <p className={styles.formFooterText}>
          Don't have an account? <button onClick={() => navigate("/signup")} className={styles.formFooterLink}>Sign up</button>
        </p>
        {error && <div className={styles.formErrorMsg}>{error}</div>}
      </FormCard>
    </div>
  );
}
