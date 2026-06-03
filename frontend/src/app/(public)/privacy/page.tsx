import React from "react";
import { ShieldCheck, Clock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | GradPlanner",
  description: "Read our privacy practices regarding how we store your university shortlists, professor email logs, and account details.",
};

export default function PrivacyPage() {
  return (
    <main className="px-6 py-16 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-4 border-b border-border/40 pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Privacy Policy</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Clock className="h-4 w-4" />
          Last updated: June 3, 2026
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed text-sm">
        <p className="text-base text-foreground">
          At GradPlanner, we are committed to protecting the privacy of Bangladeshi students preparing for graduate studies abroad. This Privacy Policy explains how we collect, use, and safeguard your data when using our decision support workspace.
        </p>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when creating an account and planning your applications:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Profile Details:</strong> Your name, email address, target degree (MSc/PhD), target semesters, and research focus (e.g. AI/ML, Software Engineering).
            </li>
            <li>
              <strong className="text-foreground">Application Data:</strong> University shortlists, documents uploaded (SOP, CV checklists), and professor outreach logs (names, responses, follow-up dates).
            </li>
            <li>
              <strong className="text-foreground">Authentication Logs:</strong> Credentials managed securely via our authentication framework (<code className="text-primary font-medium">better-auth</code>).
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">2. How We Use Your Information</h2>
          <p>We use the collected information exclusively to power your workspace features:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>To display personalized admission chance estimates and timelines.</li>
            <li>To alert you when professor follow-ups are due or deadlines are approaching.</li>
            <li>To improve our static indexes based on anonymous application aggregates.</li>
          </ul>
          <p className="font-semibold text-foreground bg-primary/5 border border-primary/25 rounded-xl p-4 mt-2">
            ⚠️ We NEVER sell your profile details, transcripts, CVs, or statement drafts to third-party consultants or universities. Your drafts remain entirely private.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">3. Data Security & Storage</h2>
          <p>
            Your data is stored in our secure PostgreSQL database and accessed via encrypted Prisma client queries. Security filters strictly scope all database reads to the currently authenticated user's ID, ensuring students cannot access each other's documents or professor logs.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">4. Cookies and Session Management</h2>
          <p>
            We use secure cookies strictly for session persistence (maintaining your signed-in state). We do not use tracking cookies for advertisements.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">5. Your Rights</h2>
          <p>
            You have full control over your data. At any time, you can edit or delete your account, shortlists, outreach records, and uploaded document metadata directly from the user dashboard settings.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">6. Contact Us</h2>
          <p>
            If you have any questions or feedback regarding our privacy practices, please contact us at <a href="mailto:privacy@gradplanner.com" className="text-primary hover:underline">privacy@gradplanner.com</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
