import React from "react";
import { FileText, Clock } from "lucide-react";

export const metadata = {
  title: "Terms of Service | GradPlanner",
  description: "Read the terms governing the use of GradPlanner's university shortlist manager, professor tracker, and admission roadmap.",
};

export default function TermsPage() {
  return (
    <main className="px-6 py-16 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-4 border-b border-border/40 pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <FileText className="h-3.5 w-3.5" />
          <span>Terms of Service</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Clock className="h-4 w-4" />
          Last updated: June 3, 2026
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed text-sm">
        <p className="text-base text-foreground">
          Welcome to GradPlanner. These Terms of Service ("Terms") govern your access to and use of the GradPlanner website, tools, and services. By creating an account or using our platform, you agree to comply with these Terms.
        </p>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">1. Description of Service</h2>
          <p>
            GradPlanner is a decision-support platform designed to help Bangladeshi CSE/Engineering students plan their graduate applications, select universities, organize documents, and log outreach emails to professors. We provide country-specific visa intelligence, funding details, and tracking features.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">2. Account Registration and Security</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must provide accurate, current, and complete information during registration.</li>
            <li>You are responsible for maintaining the confidentiality of your credentials.</li>
            <li>We authenticate accounts securely via <code className="text-primary font-medium">better-auth</code>. You agree to notify us immediately of any unauthorized access to your account.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">3. User Conduct and Restrictions</h2>
          <p>You agree not to engage in any of the following prohibited behaviors:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Scraping, copying, or distributing our curated country intelligence database or university indexes for commercial purposes.</li>
            <li>Using automated bots to crawl our routes or send requests to professors.</li>
            <li>Impersonating university officials or presenting forged funding letters within your application logs.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">4. Platform Intent & Limitation of Liability</h2>
          <p>
            GradPlanner provides advisory intelligence based on historical data, university rankings (QS, THE, ARWU), and visa processing patterns in Bangladesh. 
          </p>
          <p className="font-semibold text-foreground bg-primary/5 border border-primary/25 rounded-xl p-4 mt-2">
            ⚠️ Admission and visa decisions are made exclusively by their respective university committees and government embassies. GradPlanner does not guarantee admission offers, professor replies, or visa approvals.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">5. Service Modifications & Termination</h2>
          <p>
            We reserve the right to modify or discontinue features, templates, or indexes on the platform at any time. We may suspend accounts that violate these terms or engage in abusive platform behavior.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">6. Contact Us</h2>
          <p>
            If you have questions about these Terms, please contact us at <a href="mailto:terms@gradplanner.com" className="text-primary hover:underline">terms@gradplanner.com</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
