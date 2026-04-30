import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRitual, getProfiles } from "../api.js";
import { c, RitualView, PageHeader, SignOutButton } from "../components/Common.jsx";
import { useProfile } from "../context/ProfileContext.jsx";

export default function SavedRitual() {
  const navigate = useNavigate();
  const { selectedProfile, loading: profileLoading } = useProfile();
  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProfile && !profileLoading) {
      navigate("/profiles");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const ritualData = await getRitual(selectedProfile.id);
        setRitual(ritualData.ritual);
      } catch (e) {
        console.error(e);
        setRitual(null);
      } finally {
        setLoading(false);
      }
    };

    if (selectedProfile) {
      loadData();
    }
  }, [selectedProfile, profileLoading, navigate]);

  if (loading || !selectedProfile) return null;

  return (
    <div style={{ maxWidth:720, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
        <PageHeader title={<><em>{selectedProfile.name}'s</em> Ritual</>} />
        <SignOutButton />
      </div>

      {ritual?.savedAt && (
        <div style={{ fontSize:12, color:c.muted, fontFamily:"sans-serif", marginBottom:"1.5rem", textAlign:"center" }}>
          Last saved {new Date(ritual.savedAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
        </div>
      )}

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

      {ritual ? (
        <>
          <RitualView result={ritual.result} />
          <div style={{ marginTop:"1.5rem" }}>
            <button onClick={() => navigate("/build")}
              style={{ width:"100%", padding:"13px", borderRadius:10, border:`1px solid ${c.accent}`, background:c.accent, color:"#fff", fontSize:14, fontFamily:"sans-serif", cursor:"pointer", fontWeight:600 }}>
              + Create Ritual
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign:"center", padding:"3rem 0", color:c.muted, fontFamily:"sans-serif" }}>
          No ritual saved yet.{" "}
          <button onClick={() => navigate("/build")} style={{ background:"none", border:"none", cursor:"pointer", color:c.accent, fontFamily:"sans-serif", fontSize:14, textDecoration:"underline" }}>Build one now</button>
        </div>
      )}
    </div>
  );
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

  if (loading) return null;
  if (!profile) return null;

  return (
    <div style={{ maxWidth:720, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
        <PageHeader title={<><em>{profile.name}'s</em> Ritual</>} />
        <SignOutButton />
      </div>

      {ritual?.savedAt && (
        <div style={{ fontSize:12, color:c.muted, fontFamily:"sans-serif", marginBottom:"1.5rem", textAlign:"center" }}>
          Last saved {new Date(ritual.savedAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
        </div>
      )}

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
          No ritual saved yet.
        </div>
      )}
    </div>
  );
}
