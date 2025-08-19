import React, { useState, useEffect } from "react";
import Spline from "@splinetool/react-spline";
import { Play, Clock, Star, Zap, Activity, ArrowRight, ChevronDown, Sparkles, Brain, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
const Landing = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    setTimeout(() => setIsLoaded(true), 100);
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" 
           style={{
             transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
           }} />
      
      {/* Dynamic gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-transparent rounded-full blur-3xl animate-pulse"
             style={{
               transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`
             }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600/20 via-pink-600/30 to-transparent rounded-full blur-3xl animate-pulse"
             style={{
               transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)`
             }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-cyan-400/10 via-indigo-500/20 to-transparent rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
       

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center relative">
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className={`space-y-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Next-Gen Interview Training
                </span>
              </div>

              {/* Heading */}
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                  <span className="bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
                    Master Your
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                    Presence
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                  Revolutionary AI-powered mock interviews with real-time feedback on eye contact, 
                  facial expressions, posture, and communication flow. Transform how you present yourself.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg shadow-2xl shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                 <Link to='/interview'>Start Interview</Link>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="px-8 py-4 border border-white/20 text-white hover:bg-white/10 backdrop-blur-sm rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  View Sessions
                </button>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="group p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Real-Time AI</h3>
                  <p className="text-sm text-gray-400">Instant feedback as you speak</p>
                </div>

                <div className="group p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Precision Metrics</h3>
                  <p className="text-sm text-gray-400">Detailed performance analysis</p>
                </div>

                <div className="group p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">Growth Tracking</h3>
                  <p className="text-sm text-gray-400">Monitor your improvement</p>
                </div>
              </div>
            </div>

            {/* Right - 3D Spline Object */}
            <div className={`relative transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative w-full h-[600px] lg:h-[700px]">
                
                {/* Floating elements around 3D object */}
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-xl animate-bounce" 
                     style={{ animationDelay: '0s', animationDuration: '3s' }} />
                <div className="absolute -bottom-16 -right-8 w-24 h-24 bg-gradient-to-br from-pink-500/30 to-red-500/30 rounded-full blur-xl animate-bounce"
                     style={{ animationDelay: '1s', animationDuration: '4s' }} />
                <div className="absolute top-20 -right-12 w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-lg animate-bounce"
                     style={{ animationDelay: '2s', animationDuration: '3.5s' }} />

                {/* Main 3D container */}
                <div className="w-full h-full relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
                  
                     <Spline scene="https://prod.spline.design/DRwhn5QlAUTPDEZh/scene.splinecode" />


                  {/* Subtle overlay effects */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />
                    <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-pulse" 
                         style={{ animationDelay: '1s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 animate-bounce">
            <span className="text-sm">Explore features</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">10K+</div>
                <div className="text-gray-400">Interviews Completed</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">95%</div>
                <div className="text-gray-400">Improvement Rate</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">4.9★</div>
                <div className="text-gray-400">User Rating</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">24/7</div>
                <div className="text-gray-400">AI Availability</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;