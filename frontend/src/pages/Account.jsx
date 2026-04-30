import { PageHeader, FormCard } from "../components/Common.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import styles from "../components/Common.module.css";

export default function Account() {
  const { user } = useAuth();

  return (
    <div className={styles.formContainer}>
      <PageHeader title="My Account" />
      <FormCard>
        <p className={styles.formTextCenter}>
          Your account information and settings.
        </p>
        <div style={{ margin: "20px 0", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label className={styles.formLabel}>Email Address</label>
            <div style={{ padding: "11px 14px", borderRadius: 10, border: `1px solid ${styles.formInput}`, fontSize: 15, fontFamily: "sans-serif", background: "#FDF8F5", color: "#2C1A14" }}>
              {user?.email || "Not available"}
            </div>
          </div>
          {user?.name && (
            <div>
              <label className={styles.formLabel}>Full Name</label>
              <div style={{ padding: "11px 14px", borderRadius: 10, border: `1px solid ${styles.formInput}`, fontSize: 15, fontFamily: "sans-serif", background: "#FDF8F5", color: "#2C1A14" }}>
                {user.name}
              </div>
            </div>
          )}
        </div>
      </FormCard>
    </div>
  );
}
