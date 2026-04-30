import { createContext, useContext, useState, useEffect } from "react";
import { getProfiles } from "../api.js";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectProfile = async (profileId) => {
    setLoading(true);
    try {
      const data = await getProfiles();
      const profile = data.profiles?.find(x => x.id === profileId);
      setSelectedProfile(profile);
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const clearProfile = () => {
    setSelectedProfile(null);
  };

  return (
    <ProfileContext.Provider value={{ selectedProfile, selectProfile, clearProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
