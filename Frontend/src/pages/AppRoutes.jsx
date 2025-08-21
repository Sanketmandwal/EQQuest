import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  SignIn,
  SignUp,
  useUser,
} from "@clerk/clerk-react";
import Navbar from './Navbar';
// import Interview from './Interview';
import Interview from '@/components/Interview/Interview';
import AboutUs from './Aboutus';
import Landing from './Landing';
import ContactUs from './Contactus';

const AppRoutes = () => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div className="p-6">Loading auth...</div>;

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* landing is always available */}
        <Route path="/" element={<Landing />} />
        {/* allow full app when signed in */}
        <Route
          path="/sign-in"
          element={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
              <SignIn routing="path" path="/sign-in" />
            </div>
          }
        />
        <Route
          path="/sign-up"
          element={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
              <SignUp routing="path" path="/sign-up" />
            </div>
          }
        />
          <Route
              path="/about"
              element={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                  <AboutUs />
                </div>
              }
            />
          <Route
              path="/contact"
              element={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                  <ContactUs />
                </div>
              }
            />

        {isSignedIn ? (
          <>
            <Route
              path="/interview"
              element={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                  <Interview />
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            {/* when not signed in, only landing is reachable */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
