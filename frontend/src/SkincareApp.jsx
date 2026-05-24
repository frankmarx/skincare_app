import { useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ProfileProvider } from "./context/ProfileContext.jsx";
import { c, Spinner, BottomNav } from "./components/Common.jsx";
import styles from "./SkincareApp.module.css";

const SignIn = lazy(() => import("./pages/SignIn.jsx"));
const SignUp = lazy(() => import("./pages/SignUp.jsx"));
const ConfirmSignUp = lazy(() => import("./pages/ConfirmSignUp.jsx"));
const CreateProfile = lazy(() => import("./pages/CreateProfile.jsx"));
const Profiles = lazy(() => import("./pages/Profiles.jsx"));
const Account = lazy(() => import("./pages/Account.jsx"));
const Builder = lazy(() => import("./pages/Builder.jsx"));
const SavedRitual = lazy(() => import("./pages/SavedRitual.jsx"));
const RitualsList = lazy(() => import("./pages/RitualsList.jsx"));

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const wrap = children => {
    const isAuthPage = ["/signin", "/signup", "/confirm"].includes(location.pathname);
    return (
      <div className={styles.appWrapper}>
        <style>{`@keyframes sk-spin{to{transform:rotate(360deg);}} * { -webkit-tap-highlight-color: transparent; }`}</style>
        <div className={styles.content} style={{ paddingBottom: "80px" }}>
          {children}
        </div>
        {!isAuthPage && isAuthenticated && <BottomNav />}
      </div>
    );
  };

  if (loading) return wrap(<div className={styles.loadingContainer}><Spinner /></div>);

  return wrap(
    <Suspense fallback={<div className={styles.loadingContainer}><Spinner /></div>}>
      <Routes>
        <Route path="/signin" element={!isAuthenticated ? <SignIn /> : <Navigate to="/rituals" />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/confirm" element={<ConfirmSignUp />} />
        <Route path="/profiles" element={isAuthenticated ? <Profiles /> : <Navigate to="/signin" />} />
        <Route path="/account" element={isAuthenticated ? <Account /> : <Navigate to="/signin" />} />
        <Route path="/create-profile" element={isAuthenticated ? <CreateProfile /> : <Navigate to="/signin" />} />
        <Route path="/build" element={isAuthenticated ? <Builder /> : <Navigate to="/signin" />} />
        <Route path="/rituals" element={isAuthenticated ? <RitualsList /> : <Navigate to="/signin" />} />
        <Route path="/rituals/:profileId" element={isAuthenticated ? <SavedRitual /> : <Navigate to="/signin" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/rituals" : "/signin"} />} />
      </Routes>
    </Suspense>
  );
}

export default function SkincareApp() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ProfileProvider>
    </AuthProvider>
  );
}
