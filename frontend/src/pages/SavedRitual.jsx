import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRitual } from "../api.js";
import { c, RitualView, PageHeader, AccountMenu } from "../components/Common.jsx";
import { useProfile } from "../context/ProfileContext.jsx";


export default function SavedRitual() {
  const navigate = useNavigate();
  const { profileId } = useParams();
  const { selectedProfile, loading: profileLoading } = useProfile();
  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Use profileId from URL params if available, otherwise fallback to selectedProfile
        const idToUse = profileId || selectedProfile?.id;
        if (!idToUse) {
          navigate("/profiles");
          return;
        }
        const ritualData = await getRitual(idToUse);
        setRitual(ritualData.ritual);
      } catch (e) {
        console.error(e);
        setRitual(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profileId, selectedProfile, navigate]);

  if (loading || (!profileId && !selectedProfile)) return null;

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.header}>
        <PageHeader title={<><em>{selectedProfile.name}'s</em> Ritual</>} />
        <AccountMenu />
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
