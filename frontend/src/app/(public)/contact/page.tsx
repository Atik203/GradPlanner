"use client";

import React, { useState } from "react";
import { Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    university: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API request
    setTimeout(() => {
      setSubmitted(true);
    }, 800);
  };

  return (
    <main className="px-6 py-16 max-w-5xl mx-auto space-y-16 animate-in fade-in duration-500">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-2">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Contact Our Team</h1>
        <p className="text-muted-foreground text-lg">
          Have questions about using the platform, adding a university, or reporting a bug? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Info Column */}
        <div className="md:col-span-5 space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Get in Touch</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We're founded by CSE alumni who went through this exact pipeline. Connect with us for any suggestions or feature requests.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Email Support</p>
                <a href="mailto:support@gradplanner.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  support@gradplanner.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Location</p>
                <p className="text-sm text-muted-foreground">
                  Dhanmondi, Dhaka, Bangladesh
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Response Time</p>
                <p className="text-sm text-muted-foreground">
                  Within 24–48 hours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-7 bg-card/40 backdrop-blur-sm border border-border/60 rounded-3xl p-8 shadow-sm">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 animate-in fade-in zoom-in-95 duration-300">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold">Message Sent!</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Thank you for reaching out. A team member will get back to you shortly at <span className="font-medium text-foreground">{formData.email}</span>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="Abir Rahman"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="abir@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="university" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">University (Optional)</label>
                <input
                  id="university"
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  placeholder="e.g. UIU, BUET"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-4 rounded-xl border border-border bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm resize-none"
                  placeholder="Tell us what you need help with..."
                />
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl shadow-lg shadow-primary/10">
                <Send className="h-4 w-4 mr-2" /> Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
