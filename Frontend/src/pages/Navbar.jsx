import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 transition"
  >
    {children}
  </Link>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-white/60 backdrop-blur-sm border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* left: logo + links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md">
                {/* simple logo mark */}
                <svg
                  className="h-6 w-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 12h18M12 3v18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-bold text-lg text-gray-800">EQ Quest</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              <NavLink to="/interview">Interview</NavLink>
              <NavLink to="/about">About Us</NavLink>
              <NavLink to="/contact">Contact Us</NavLink>
            </nav>
          </div>

          {/* center: search (md+) */}
          <div className="hidden md:flex flex-1 justify-center px-4">
            <div className="w-full max-w-xl">
              <label className="relative block">
                <span className="sr-only">Search</span>
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="6" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                  placeholder="Search questions, interviews, history..."
                />
              </label>
            </div>
          </div>

          {/* right: auth / mobile button */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <SignedIn>
                <UserButton />
              </SignedIn>

              <SignedOut>
                <Link
                  to="/sign-in"
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/sign-up"
                  className="px-3 py-1.5 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium shadow hover:opacity-95 transition"
                >
                  Sign up
                </Link>
              </SignedOut>
            </div>

            {/* mobile menu button */}
            <button
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              <span className="sr-only">Open menu</span>
              {open ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* mobile panel */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${
          open ? "max-h-60" : "max-h-0"
        } border-t border-gray-100`}
      >
        <div className="px-4 py-3 space-y-2">
          <NavLink to="/interview">Interview</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/settings">Settings</NavLink>

          <div className="pt-2">
            <SignedIn>
              <div className="flex items-center gap-3">
                <UserButton />
                <span className="text-sm text-gray-600">Manage account</span>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex gap-2">
                <Link
                  to="/sign-in"
                  className="flex-1 px-3 py-2 text-center rounded-md border border-gray-200 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/sign-up"
                  className="flex-1 px-3 py-2 text-center rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;