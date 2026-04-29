import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { loadStoredTokens } from "./api.js";
import { c, Spinner } from "./components/Common.jsx";

import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import ConfirmSignUp from "./pages/ConfirmSignUp.jsx";
import CreateProfile from "./pages/CreateProfile.jsx";
import Profiles from "./pages/Profiles.jsx";
import Builder from "./pages/Builder.jsx";
import SavedRitual from "./pages/SavedRitual.jsx";

export default function SkincareApp() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (loadStoredTokens()) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const wrap = children => (
    <div style={{ fontFamily:"'Georgia','Times New Roman',serif", background:c.bg, minHeight:"100vh", padding:"env(safe-area-inset-top,0) 0 0", boxSizing:"border-box" }}>
      <style>{`@keyframes sk-spin{to{transform:rotate(360deg);}} * { -webkit-tap-highlight-color: transparent; }`}</style>
      <div style={{ padding:"2rem 1rem" }}>
        {children}
      </div>
    </div>
  );

  if (loading) return wrap(<div style={{ display:"flex", justifyContent:"center", paddingTop:"4rem" }}><Spinner /></div>);

  return (
    <Router>
      {wrap(
        <Routes>
          <Route path="/signin" element={!isAuthenticated ? <SignIn /> : <Navigate to="/profiles" />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/confirm" element={<ConfirmSignUp />} />
          <Route path="/profiles" element={isAuthenticated ? <Profiles /> : <Navigate to="/signin" />} />
          <Route path="/create-profile" element={isAuthenticated ? <CreateProfile /> : <Navigate to="/signin" />} />
          <Route path="/builder/:profileId" element={isAuthenticated ? <Builder /> : <Navigate to="/signin" />} />
          <Route path="/ritual/:profileId" element={isAuthenticated ? <SavedRitual /> : <Navigate to="/signin" />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/profiles" : "/signin"} />} />
        </Routes>
      )}
    </Router>
  );
}
