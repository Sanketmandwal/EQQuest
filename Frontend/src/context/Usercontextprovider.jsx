import React from "react";
import usercontext from "@/context/usercontext";
import axios from "axios";

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const Usercontextprovider = ({ children }) => {
  

  
  const value = { }

  return <usercontext.Provider value={value}>{children}</usercontext.Provider>;
};

export default Usercontextprovider;
