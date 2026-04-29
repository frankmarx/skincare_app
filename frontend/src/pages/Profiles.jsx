import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProfile, signOut, getProfiles } from "../api.js";
import { c, PageHeader } from "../components/Common.jsx";

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    navigate(`/ritual/${profile.id}`);
  };

  const handleDelete = async id => {
    try {
      await deleteProfile(id);
      await loadProfiles();
    } catch (e) {
      console.error("Failed to delete profile:", e);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  if (loading) {
    return (
      <div style={{ display:"flex", justifyContent:"center", paddingTop:"4rem" }}>
        <div style={{ width:16, height:16, border:`2px solid ${c.border}`, borderTopColor:c.accent, borderRadius:"50%", animation:"sk-spin 0.7s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth:560, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
        <PageHeader title={<>Your <em>Profiles</em></>} />
        <button onClick={handleSignOut} style={{ background:"none", border:"1px solid", borderColor:c.border, borderRadius:8, padding:"8px 16px", fontSize:12, color:c.muted, fontFamily:"sans-serif", cursor:"pointer" }}>
          Sign Out
        </button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:"1.25rem" }}>
        {profiles && profiles.length > 0 ? (
          profiles.map(profile => (
            <div key={profile.id}
              onClick={() => handleOpen(profile)}
              style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:14, padding:"1rem 1.25rem", display:"flex", alignItems:"center", gap:14, cursor:"pointer", transition:"border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = c.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
            >
              <div style={{ width:46, height:46, borderRadius:"50%", background:c.accentLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontStyle:"italic", color:c.accent, flexShrink:0, fontFamily:"Georgia,serif" }}>
                {profile.name[0]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:16, fontWeight:400, color:c.text }}>{profile.name}</div>
                <div style={{ fontSize:12, color:c.muted, fontFamily:"sans-serif", marginTop:2 }}>
                  {profile.updatedAt
                    ? `Last updated ${new Date(profile.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`
                    : `Created ${new Date(profile.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`}
                </div>
              </div>
              <span style={{ fontSize:12, color:c.accent, fontFamily:"sans-serif", flexShrink:0 }}>Open →</span>
              <button
                onClick={e => { e.stopPropagation(); handleDelete(profile.id); }}
                style={{ background:"none", border:"none", cursor:"pointer", color:c.muted, fontSize:20, padding:"0 0 0 6px", lineHeight:1 }}
                title="Delete profile"
              >×</button>
            </div>
          ))
        ) : (
          <div style={{ textAlign:"center", padding:"2rem 0", color:c.muted, fontFamily:"sans-serif" }}>
            No profiles found. Create one to get started!
          </div>
        )}
      </div>
      <button onClick={() => navigate("/create-profile")}
        style={{ width:"100%", padding:"13px", borderRadius:10, border:`1.5px solid ${c.accent}`, background:c.accent, color:"#fff", fontSize:14, fontFamily:"sans-serif", cursor:"pointer", fontWeight:600 }}>
        + Create New Profile
      </button>
    </div>
  );
}
