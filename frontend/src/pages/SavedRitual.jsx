import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRitual, getProfiles, signOut } from "../api.js";
import { c, BackButton, RitualView } from "../components/Common.jsx";

export default function SavedRitual() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileData = await getProfiles();
        const p = profileData.profiles?.find(x => x.id === profileId);
        if (!p) {
          navigate("/profiles");
          return;
        }
        setProfile(p);
        const ritualData = await getRitual(profileId);
        setRitual(ritualData.ritual);
      } catch (e) {
        console.error(e);
        navigate("/profiles");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [profileId, navigate]);

  const handleRebuild = () => {
    navigate(`/builder/${profileId}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  if (loading) return null;
  if (!profile) return null;

  return (
    <div style={{ maxWidth:720, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <BackButton onBack={() => navigate("/profiles")} label="All profiles" />
        <button onClick={handleSignOut} style={{ background:"none", border:"1px solid", borderColor:c.border, borderRadius:8, padding:"8px 16px", fontSize:12, color:c.muted, fontFamily:"sans-serif", cursor:"pointer" }}>
          Sign Out
        </button>
      </div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:"2rem" }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:c.accent, fontFamily:"sans-serif", marginBottom:6 }}>Skincare Intelligence</div>
          <h1 style={{ fontSize:26, fontWeight:400, color:c.text, margin:0 }}><em>{profile.name}'s</em> Ritual</h1>
          {ritual?.savedAt && (
            <div style={{ fontSize:12, color:c.muted, fontFamily:"sans-serif", marginTop:5 }}>
              Last saved {new Date(ritual.savedAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
            </div>
          )}
          <div style={{ width:36, height:1.5, background:c.accent, marginTop:12 }} />
        </div>
        <button onClick={handleRebuild}
          style={{ padding:"9px 18px", borderRadius:10, border:`1px solid ${c.border}`, background:"transparent", color:c.textSoft, fontSize:13, fontFamily:"sans-serif", cursor:"pointer", marginTop:4 }}>
          Rebuild Ritual
        </button>
      </div>

      {ritual?.products?.length > 0 && (
        <div style={{ background:c.card, border:`1px solid ${c.border}`, borderRadius:16, padding:"1.25rem", marginBottom:"1.5rem" }}>
          <div style={{ fontSize:12, fontWeight:600, color:c.textSoft, fontFamily:"sans-serif", marginBottom:12, letterSpacing:"0.06em", textTransform:"uppercase" }}>Products in this ritual</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {ritual.products.map((pr, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6, background:c.tag, border:`1px solid ${c.border}`, borderRadius:30, padding:"5px 12px" }}>
                <span style={{ fontSize:13, fontWeight:600, color:c.tagText, fontFamily:"sans-serif" }}>{pr.name}</span>
                <span style={{ fontSize:11, color:c.muted, fontFamily:"sans-serif" }}>{pr.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {ritual ? <RitualView result={ritual.result} /> : (
        <div style={{ textAlign:"center", padding:"3rem 0", color:c.muted, fontFamily:"sans-serif" }}>
          No ritual saved yet.{" "}
          <button onClick={handleRebuild} style={{ background:"none", border:"none", cursor:"pointer", color:c.accent, fontFamily:"sans-serif", fontSize:14, textDecoration:"underline" }}>Build one now</button>
        </div>
      )}
    </div>
  );
}
