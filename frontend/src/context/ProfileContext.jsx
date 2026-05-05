import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getProfiles } from "../api.js";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const profilesCache = useRef([]);

  const loadProfiles = useCallback(async (force = false) => {
    if (!force && profilesCache.current.length > 0) {
      setProfiles(profilesCache.current);
      return profilesCache.current;
    }
    
    setLoading(true);
    try {
      const data = await getProfiles();
      const list = data.profiles || [];
      profilesCache.current = list;
      setProfiles(list);
      return list;
    } catch (e) {
      console.error("Failed to load profiles:", e);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const selectProfile = useCallback(async (profileId) => {
    setLoading(true);
    try {
      let currentProfiles = profilesCache.current;
      if (currentProfiles.length === 0) {
        const data = await getProfiles();
        currentProfiles = data.profiles || [];
        profilesCache.current = currentProfiles;
        setProfiles(currentProfiles);
      }
      const profile = currentProfiles.find(x => x.id === profileId);
      setSelectedProfile(profile);
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setSelectedProfile(null);
  }, []);

  return (
    <ProfileContext.Provider value={{ selectedProfile, setSelectedProfile, profiles, setProfiles, loadProfiles, selectProfile, clearProfile, loading }}>
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
