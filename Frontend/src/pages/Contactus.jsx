import React, { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { Textarea } from "@/components/ui/textarea"; 
import { Button } from "@/components/ui/button";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);
    alert("Thank you for your message! We will get back to you soon.");
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6 flex items-center justify-center">
      <Card className="w-full max-w-5xl shadow-xl rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Section - Info */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-10 flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
            <p className="mb-6 text-indigo-100">
              We'd love to hear from you! Have questions about EQ Quest or want
              to know more about our mission? Feel free to reach out.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Mail className="w-6 h-6" />
                <span>support@eqquest.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-6 h-6" />
                <span>+1 (123) 456-7890</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-6 h-6" />
                <span>123 EQ Street, Confidence City, 54321</span>
              </li>
            </ul>
          </div>

          {/* Right Section - Form */}
          <CardContent className="p-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all rounded-xl shadow-md"
              >
                Send Message
              </Button>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default ContactUs;
