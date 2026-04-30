import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile } from "../api.js";
import { PageHeader, BackButton, FormCard, FormLabel, Input, PrimaryButton } from "../components/Common.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import styles from "../components/Common.module.css";

export default function CreateProfile() {
  const { profiles } = useProfile();
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
    <div className={styles.formContainer}>
      {profiles.length > 0 && <BackButton onBack={() => navigate("/profiles")} label="Back to profiles" />}
      <PageHeader title={<>Create Your <em>Profile</em></>} />
      <FormCard>
        <p className={styles.formTextCenter}>
          Enter your name to create a profile. Your skincare ritual will be saved and accessible anytime.
        </p>
        <FormLabel>Your name</FormLabel>
        <Input
          value={name}
          onChange={e => { setName(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleCreate()}
          placeholder="e.g. Sarah"
          autoFocus
          className={error ? styles.formInputError : ""}
        />
        {error && <div className={styles.formInputErrorMsg}>{error}</div>}
        <PrimaryButton onClick={handleCreate} disabled={loading}>
          {loading ? "Creating..." : "Create Profile →"}
        </PrimaryButton>
      </FormCard>
    </div>
  );
}
