import React from "react";
import {
  ClerkProvider,
} from "@clerk/clerk-react";
import AppRoutes from "./pages/AppRoutes";

function App() {
  const clerkPubKey = import.meta.env.VITE_APP_CLERK_PUBLISHABLE_KEY;
  if (!clerkPubKey) {
    console.warn(
      "Missing Clerk publishable key. Set REACT_APP_CLERK_PUBLISHABLE_KEY in your environment."
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AppRoutes />
    </ClerkProvider>
  );
}

export default App;
