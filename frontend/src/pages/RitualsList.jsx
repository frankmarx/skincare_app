import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRituals } from "../api.js";
import { PageHeader, AccountMenu } from "../components/Common.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import styles from "./RitualsList.module.css";
import layoutStyles from "./Layout.module.css";

export default function RitualsList() {
  const { profiles, loadProfiles, setSelectedProfile } = useProfile();
  const [rituals, setRituals] = useState([]);
  const [filterProfileId, setFilterProfileId] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    const fetchRituals = async () => {
      setLoading(true);
      try {
        const data = await getRituals();
        setRituals(data.rituals || []);
      } catch (e) {
        console.error("Failed to load rituals:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRituals();
  }, []);

  const filteredRituals = filterProfileId === "all" 
    ? rituals 
    : rituals.filter(r => r.profile.id === filterProfileId);

  const handleRitualClick = (ritual) => {
    navigate(`/rituals/${ritual.profile.id}`);
  };

  const handleCreateNewRitual = () => {
    if (profiles.length === 0) {
      navigate("/create-profile");
    } else if (profiles.length === 1) {
      setSelectedProfile(profiles[0]);
      navigate("/build");
    } else {
      navigate("/profiles");
    }
  };

  if (loading) {
    return <div style={{ textAlign:"center", paddingTop:"4rem", fontFamily:"sans-serif", color:"#9C8880" }}>Loading Rituals...</div>;
  }

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.header}>
        <PageHeader title={<>Your <em>Rituals</em></>} />
        <AccountMenu />
      </div>

      <div className={styles.filterBar}>
        <div 
          className={styles.profileChip + (filterProfileId === "all" ? " " + styles.profileChipActive : "")}
          onClick={() => setFilterProfileId("all")}
        >
          All
        </div>
        {profiles.map(p => (
          <div 
            key={p.id}
            className={styles.profileChip + (filterProfileId === p.id ? " " + styles.profileChipActive : "")}
            onClick={() => setFilterProfileId(p.id)}
          >
            {p.name}
          </div>
        ))}
      </div>

       <div className={styles.ritualsGrid}>
         {filteredRituals.length > 0 ? (
           filteredRituals.map((ritual, i) => {
             const summary = ritual.result.skinProfile.summary;
             const profileName = ritual.profile.name;
             const avatar = profileName[0];
             
             // Assign a "mosaic" type to products for the Tetris look
             const productLayouts = ['boxLarge', 'boxTall', 'boxWide', ''];
             
             return (
               <div key={ritual.id} className={styles.ritualCard} onClick={() => handleRitualClick(ritual)}>
                 <div className={styles.cardHeader}>
                   <h2 className={styles.ritualTitle}>{profileName}'s Ritual</h2>
                   <div className={styles.profileAvatar}>{avatar}</div>
                 </div>
                 
                 <div className={styles.ritualSummary}>{summary}</div>
                 
                 <div className={styles.productMosaic}>
                   {ritual.products.slice(0, 6).map((p, idx) => (
                     <div key={idx} className={styles.productBox + (productLayouts[idx % 4] ? " " + styles[productLayouts[idx % 4]] : "")} />
                   ))}
                 </div>
               </div>
             );
           })
         ) : (
           <div style={{ textAlign:"center", padding:"3rem 0", color:"#9C8880", fontFamily:"sans-serif" }}>
             No rituals found.
           </div>
         )}
         
          <div 
            className={styles.ritualCard} 
            onClick={handleCreateNewRitual}
            style={{ borderStyle: "dashed", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#FDF8F5" }}
          >

           <div>
             <div style={{ fontSize: 32, color: "#C9806A", marginBottom: 8 }}>+</div>
             <h2 className={styles.ritualTitle}>Create New Ritual</h2>
             <p style={{ fontSize: 14, color: "#7A5C52", fontFamily: "sans-serif" }}>Build a customized skincare routine</p>
           </div>
         </div>
       </div>

    </div>
  );
}
