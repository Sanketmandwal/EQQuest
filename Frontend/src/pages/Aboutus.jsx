import React from "react";
import { Users, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Hero Section */}
      <header className="text-center py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8" /> About Us
        </h1>
        <p className="text-lg md:text-xl opacity-90">
          Your journey with us starts here.
        </p>
      </header>

      {/* Our Story */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Our Story
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Welcome to <span className="font-bold">EQ Quest</span>! We are a
            passionate team dedicated to building innovative solutions that make
            a real difference. Our journey began with a simple idea: to create a
            platform that helps individuals understand and improve their
            non-verbal communication skills. We believe that effective
            communication is a superpower, and our mission is to make it
            accessible to everyone.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Through our platform, we combine cutting-edge machine learning with
            a fun, gamified experience. Our goal is to empower you to become a
            more confident and effective communicator, whether in job
            interviews, public speaking, or everyday interactions.
          </p>
        </div>
        <div className="flex justify-center">
          <img
            src="https://source.unsplash.com/600x400/?team,work"
            alt="Team working together"
            className="rounded-2xl shadow-lg border border-gray-200"
          />
        </div>
      </section>

      {/* Meet the Team */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" /> Meet the Team
          </h2>
          <p className="text-gray-600 mb-10">
            Behind EQ Quest is a passionate team of innovators and creators.
          </p>

          {/* Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {/* Example Team Member */}
            <Card className="hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <img
                  src="https://source.unsplash.com/150x150/?portrait,person"
                  alt="Team Member"
                  className="w-28 h-28 rounded-full object-cover mb-4 shadow-md"
                />
                <h3 className="text-lg font-semibold">Abrar Chavhan</h3>
                <p className="text-sm text-gray-500">Founder & CEO</p>
              </CardContent>
            </Card>

            {/* Duplicate for more members */}
            <Card className="hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <img
                  src="https://source.unsplash.com/150x150/?portrait,woman"
                  alt="Team Member"
                  className="w-28 h-28 rounded-full object-cover mb-4 shadow-md"
                />
                <h3 className="text-lg font-semibold">Vaibhav Khangale</h3>
                <p className="text-sm text-gray-500">Lead Developer</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <img
                  src="https://source.unsplash.com/150x150/?portrait,man"
                  alt="Team Member"
                  className="w-28 h-28 rounded-full object-cover mb-4 shadow-md"
                />
                <h3 className="text-lg font-semibold">Sanket Mandwal</h3>
                <p className="text-sm text-gray-500">UI/UX Designer</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
