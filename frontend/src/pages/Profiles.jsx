import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProfile, getProfiles } from "../api.js";
import { PageHeader, SignOutButton } from "../components/Common.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import styles from "./Profiles.module.css";

function ProfileCard({ profile, onOpen, onDelete }) {
  return (
    <div
      onClick={() => onOpen(profile)}
      className={styles.profileItem}
    >
      <div className={styles.avatar}>
        {profile.name[0]}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{profile.name}</div>
        <div className={styles.date}>
          {profile.updatedAt
            ? `Last updated ${new Date(profile.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`
            : `Created ${new Date(profile.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`}
        </div>
      </div>
      <span className={styles.openArrow}>Open →</span>
      <button
        onClick={e => { e.stopPropagation(); onDelete(profile.id); }}
        className={styles.deleteBtn}
        title="Delete profile"
      >×</button>
    </div>
  );
}

function CreateProfileButton({ onClick }) {
  return (
    <button onClick={onClick} className={styles.createBtn}>
      + Create New Profile
    </button>
  );
}

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { selectProfile } = useProfile();

  const loadProfiles = async () => {
    try {
      const data = await getProfiles();
      setProfiles(data.profiles || []);
    } catch (e) {
      console.error("Failed to load profiles:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleOpen = profile => {
    selectProfile(profile.id);
    navigate("/rituals");
  };

  const handleDelete = async id => {
    try {
      await deleteProfile(id);
      await loadProfiles();
    } catch (e) {
      console.error("Failed to delete profile:", e);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <PageHeader title={<>Your <em>Profiles</em></>} />
        <SignOutButton />
      </div>
      <div className={styles.profilesList}>
        {profiles && profiles.length > 0 ? (
          profiles.map(profile => (
            <ProfileCard 
              key={profile.id} 
              profile={profile} 
              onOpen={handleOpen} 
              onDelete={handleDelete} 
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            No profiles found. Create one to get started!
          </div>
        )}
      </div>
      <CreateProfileButton onClick={() => navigate("/create-profile")} />
    </div>
  );
}
