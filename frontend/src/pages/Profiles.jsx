import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProfile, getProfiles } from "../api.js";
import { PageHeader, AccountMenu } from "../components/Common.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import profilesStyles from "./Profiles.module.css";
import layoutStyles from "./Layout.module.css";

function ProfileCard({ profile, onOpen }) {
  return (
    <div onClick={() => onOpen(profile)} className={profilesStyles.card}>
      <div className={profilesStyles.avatar}>{profile.name[0]}</div>
      <div className={profilesStyles.name}>{profile.name}</div>
      {profile.description && <div className={profilesStyles.description}>{profile.description}</div>}
      <div className={profilesStyles.stats}>
        <div className={profilesStyles.statItem}>
          <span>Rituals</span>
          <span className={profilesStyles.statValue}>{profile.ritualsCount || 0}</span>
        </div>
        <div className={profilesStyles.statItem}>
          <span>Products</span>
          <span className={profilesStyles.statValue}>{profile.productsCount || 0}</span>
        </div>
      </div>
    </div>
  );
}

function AddProfileCard({ onClick }) {
  return (
    <div onClick={onClick} className={profilesStyles.addCard}>
      <div className={profilesStyles.addIcon}>+</div>
    </div>
  );
}

export default function Profiles() {
  const { profiles, loadProfiles, loading, selectProfile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleOpen = profile => {
    selectProfile(profile.id);
    navigate("/rituals");
  };

  if (loading && profiles.length === 0) {
    return (
      <div className={profilesStyles.loadingContainer}>
        <div className={profilesStyles.spinner} />
      </div>
    );
  }

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.header}>
        <PageHeader title={<>Your <em>Profiles</em></>} />
        <AccountMenu />
      </div>
      <div className={profilesStyles.grid}>
        {profiles && profiles.length > 0 ? (
          profiles.map(profile => (
            <ProfileCard 
              key={profile.id} 
              profile={profile} 
              onOpen={handleOpen} 
            />
          ))
        ) : null}
        <AddProfileCard onClick={() => navigate("/create-profile")} />
      </div>
    </div>
  );
}
