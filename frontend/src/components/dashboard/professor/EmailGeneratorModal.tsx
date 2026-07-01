"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchApi, professorApi } from "@/lib/api";
import { useAppSelector } from "@/lib/store/store";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive/ResponsiveModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBdtOutreachAdvice } from "@/lib/timezoneHelper";
import {
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  ShieldCheck,
  Calendar,
  Sparkles,
  Wand2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import type { Professor, EmailFocus, GenerateEmailInput } from "@/types";

interface EmailGeneratorModalProps {
  professor: Professor | null;
  isOpen: boolean;
  onClose: () => void;
  onEmailLogged?: (updatedProfessor: Professor) => void;
}

export function EmailGeneratorModal({
  professor,
  isOpen,
  onClose,
  onEmailLogged,
}: EmailGeneratorModalProps) {
  const { data: session } = authClient.useSession();
  const reduxProfile = useAppSelector((state) => state.profile.profile);

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("initial_focus");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [logging, setLogging] = useState(false);

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiFocus, setAiFocus] = useState<EmailFocus>("research");
  const [aiPaperTitle, setAiPaperTitle] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);

  const [showProposalAssistant, setShowProposalAssistant] = useState(false);
  const [profPaper, setProfPaper] = useState("");
  const [userThesis, setUserThesis] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && professor) {
      if (reduxProfile) {
        setProfile(reduxProfile);
      } else {
        setProfileLoading(true);
        fetchApi("/api/v1/profile")
          .then((data) => {
            setProfile(data);
          })
          .catch((err) => {
            console.error("Failed to load profile", err);
          })
          .finally(() => {
            setProfileLoading(false);
          });
      }
    }
  }, [isOpen, professor, reduxProfile]);

  const userName = session?.user?.name || "Applicant";
  const userEmail = session?.user?.email || "";

  useEffect(() => {
    if (profile && !userThesis) {
      const interests = Array.isArray(profile.researchInterests)
        ? profile.researchInterests.join(", ")
        : "";
      setUserThesis(interests || profile.targetDegree || "");
    }
  }, [profile, userThesis]);

  const generateQuestions = () => {
    const paperPhrase = profPaper.trim().replace(/\s+/g, ' ');
    const workPhrase = userThesis.trim().replace(/\s+/g, ' ');

    if (!paperPhrase || !workPhrase) return;

    const q1 = `How can the methodology described in your paper "${paperPhrase}" be adapted to optimize performance when processing low-resource datasets like my undergraduate work on "${workPhrase}"?`;
    const q2 = `Could the model architectures/frameworks utilized for your work on "${paperPhrase}" be fine-tuned or transferred to enhance accuracy/generalization in "${workPhrase}"?`;
    const q3 = `What are the computational and scalability trade-offs of integrating your proposed techniques on "${paperPhrase}" into real-world applications in the domain of "${workPhrase}"?`;
    const q4 = `Can we combine the representation learning principles of "${paperPhrase}" with the sequence classification patterns of "${workPhrase}" to establish a more robust pipeline?`;

    setGeneratedQuestions([q1, q2, q3, q4]);
    toast.success("Bridging research questions generated!");
  };

  const injectQuestionsIntoBody = () => {
    const paperPhrase = profPaper.trim().replace(/\s+/g, ' ');
    if (!paperPhrase) return;

    let newSubject = subject;
    if (subject.includes("[Enter Paper Title]")) {
      newSubject = subject.replace("[Enter Paper Title]", `"${paperPhrase}"`);
    } else if (!subject.toLowerCase().includes(paperPhrase.toLowerCase().slice(0, 15))) {
      newSubject = `Inquiry regarding your paper: "${paperPhrase.slice(0, 30)}..."`;
    }

    let newBody = body;
    if (newBody.includes("[Enter Paper Title]")) {
      newBody = newBody.replace("[Enter Paper Title]", `"${paperPhrase}"`);
    }

    const questionsBlock = `Specifically, I am very interested in exploring the following research questions bridging your work with my background:

${generatedQuestions.map((q, i) => `   ${i + 1}. ${q}`).join("\n\n")}`;

    if (newBody.includes("For your convenience")) {
      newBody = newBody.replace("For your convenience", `${questionsBlock}\n\nFor your convenience`);
    } else if (newBody.includes("I have attached my CV")) {
      newBody = newBody.replace("I have attached my CV", `${questionsBlock}\n\nI have attached my CV`);
    } else {
      newBody = newBody + `\n\n${questionsBlock}`;
    }

    setSubject(newSubject);
    setBody(newBody);
    toast.success("Bridging research questions injected into email draft!");
  };

  const templates = useMemo(() => {
    if (!professor) return [];

    const profName = professor.name || "Professor";
    const profUni = professor.university?.name || "your institution";
    const profInterests = professor.researchInterests || "your research areas";
    const targetDegree = profile?.targetDegree || "MSc/PhD";
    const targetIntake = profile?.targetIntake || "Fall 2028";

    const bscUni = profile?.university || "[My BD University]";
    const bscCgpa = profile?.cgpa ? `${profile.cgpa}/4.00` : "[My CGPA]";
    const ieltsStr = profile?.ieltsScore ? `(IELTS: ${profile.ieltsScore})` : "";

    const userInterestsStr = Array.isArray(profile?.researchInterests)
      ? profile.researchInterests.join(", ")
      : typeof profile?.researchInterests === "string"
        ? profile.researchInterests
        : "Machine Learning / AI";

    return [
      {
        id: "initial_focus",
        name: "Initial Outreach — Research Focus",
        subject: `Prospective Graduate Student: Inquiry about Research Opportunities in ${professor.researchInterests ? professor.researchInterests.split(',')[0].trim() : 'AI/ML'}`,
        body: `Dear Professor ${profName},

I hope this email finds you well.

My name is ${userName}, and I recently graduated with a Bachelor's degree in Computer Science and Engineering from ${bscUni} in Bangladesh, achieving a CGPA of ${bscCgpa}. I am writing to express my strong interest in joining your research group at ${profUni} as a prospective ${targetDegree} student for the ${targetIntake} term.

I have been following your research on ${profInterests}, and I was particularly drawn to your lab's recent work. During my undergraduate studies, my research focused on ${userInterestsStr}, and I completed my thesis/project in a closely related area. I believe my academic background and hands-on experience align well with your current research directions.

For your convenience, I have attached my CV to this email. Would you be available for a brief Zoom meeting to discuss potential research opportunities in your lab?

Thank you for your time and consideration.

Sincerely,

${userName}
${userEmail}
Bangladesh`
      },
      {
        id: "initial_citation",
        name: "Initial Outreach — Paper Citation",
        subject: `Inquiry regarding Graduate Research Opportunities - ${userName}`,
        body: `Dear Professor ${profName},

My name is ${userName}, and I am a Computer Science and Engineering graduate from ${bscUni}${ieltsStr ? ` ${ieltsStr}` : ""}. I am writing to inquire about graduate research positions in your lab at ${profUni} for the ${targetIntake} intake.

I recently read your paper titled "[Enter Paper Title]" and was highly interested in your approach to solving [specific problem/technique]. My background is in ${userInterestsStr}, and during my undergraduate studies, I worked on a project that addressed similar challenges. I am eager to apply my skills to further your research in this domain.

I plan to apply for the ${targetDegree} program at ${profUni} and would love to work under your supervision. I have attached my CV and transcript for your review. Are you currently accepting new students, and do you have any funded positions available?

Thank you for your time.

Best regards,

${userName}
${userEmail}
Bangladesh`
      },
      {
        id: "followup_1",
        name: "Follow-up 1 (Min 14 days required)",
        subject: `Re: Prospective Graduate Student: Inquiry about Research Opportunities in ${professor.researchInterests ? professor.researchInterests.split(',')[0].trim() : 'AI/ML'}`,
        body: `Dear Professor ${profName},

I hope you are having a productive week.

I am writing to briefly follow up on my previous email regarding prospective graduate opportunities in your lab at ${profUni} for ${targetIntake}. I understand you receive many emails and have a very busy schedule, so I wanted to make sure my inquiry did not slip through.

To recap, I am a CSE graduate from ${bscUni} (CGPA: ${bscCgpa}) with research interests in ${userInterestsStr}, which align closely with your work on ${profInterests}.

I have re-attached my CV here for your convenience. I would be extremely grateful if you could let me know if you might be accepting new graduate students to your research group.

Thank you once again for your time.

Sincerely,

${userName}`
      },
      {
        id: "followup_2",
        name: "Follow-up 2 (Final Follow-up)",
        subject: `Re: Prospective Graduate Student Inquiry - ${userName} (Final Follow-up)`,
        body: `Dear Professor ${profName},

I hope this email finds you well.

I am sending this final brief follow-up regarding potential graduate research positions in your lab for the ${targetIntake} term. I know you are incredibly busy, and this will be my last email so as not to clutter your inbox.

If you have any openings or are looking for a student with my background in ${userInterestsStr}, I would be thrilled to join your group. My application to ${profUni} is ready.

Thank you very much for your time and the outstanding contributions you continue to make to the field of ${professor.researchInterests ? professor.researchInterests.split(',')[0].trim() : 'AI/ML'}.

Best regards,

${userName}`
      }
    ];
  }, [professor, profile, userName, userEmail]);

  useEffect(() => {
    if (isOpen && templates.length > 0 && professor) {
      let defaultId = "initial_focus";

      if (professor.emailSentDate) {
        if (professor.followUpCount === 0) {
          defaultId = "followup_1";
        } else if (professor.followUpCount === 1) {
          defaultId = "followup_2";
        } else {
          defaultId = "followup_2";
        }
      }

      setSelectedTemplateId(defaultId);
      const matched = templates.find(t => t.id === defaultId);
      if (matched) {
        setSubject(matched.subject);
        setBody(matched.body);
      }
    }
  }, [isOpen, templates, professor]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    const matched = templates.find(t => t.id === id);
    if (matched) {
      setSubject(matched.subject);
      setBody(matched.body);
    }
    setAiGenerated(false);
  };

  const handleAiGenerate = async () => {
    if (!professor) return;
    setAiGenerating(true);
    try {
      const input: GenerateEmailInput = { focus: aiFocus };
      if (aiFocus === "paper" && aiPaperTitle.trim()) input.paperTitle = aiPaperTitle.trim();

      const result = await professorApi.generateEmail(professor.id, input);
      setSubject(result.subject);
      setBody(result.body);
      setAiGenerated(true);
      toast.success("AI-generated draft ready!");
    } catch (err: any) {
      toast.error(err.message || "AI generation failed. You can still use the template below.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAiRegenerate = () => {
    handleAiGenerate();
  };

  if (!professor) return null;

  const country = professor.university?.country;
  const tzAdvice = getBdtOutreachAdvice(country);

  const hasSentInitial = !!professor.emailSentDate;
  const followUpCount = professor.followUpCount || 0;
  const maxFollowUpsReached = followUpCount >= 2;

  const lastEmailDate = professor.lastFollowUp || professor.emailSentDate;
  let daysSinceLastEmail = 999;
  let isWithin14Days = false;
  if (lastEmailDate) {
    const diffTime = new Date().getTime() - new Date(lastEmailDate).getTime();
    daysSinceLastEmail = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    isWithin14Days = daysSinceLastEmail < 14;
  }

  const copySubject = () => {
    navigator.clipboard.writeText(subject);
    toast.success("Subject copied to clipboard!");
  };

  const copyBody = () => {
    navigator.clipboard.writeText(body);
    toast.success("Email body copied to clipboard!");
  };

  const copyFullDraft = () => {
    const full = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(full);
    toast.success("Full draft copied to clipboard!");
  };

  const handleLogSent = async () => {
    setLogging(true);
    try {
      const updated = await fetchApi(`/api/v1/professors/${professor.id}/log-email`, {
        method: "POST",
        body: JSON.stringify({ subject, body }),
      });

      toast.success(
        hasSentInitial
          ? `Logged Follow-up #${followUpCount + 1} sent to Prof. ${professor.name}!`
          : `Logged Initial Email sent to Prof. ${professor.name}!`
      );

      if (onEmailLogged) {
        onEmailLogged(updated);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to log email outreach.");
    } finally {
      setLogging(false);
    }
  };

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Email Outreach Advisor"
      description={`Generate highly tailored cold emails for Prof. ${professor.name} (${professor.university?.name || "No linked university"}).`}
      footer={
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button variant="outline" onClick={copyFullDraft} className="border-border text-foreground hover:bg-muted font-medium shrink-0 flex items-center gap-1.5">
            <Copy className="h-4 w-4" /> Copy Full Draft
          </Button>
          <div className="flex gap-2 sm:ml-auto w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground w-full sm:w-auto">
              Close
            </Button>
            <Button
              onClick={handleLogSent}
              disabled={logging || maxFollowUpsReached || isWithin14Days || profileLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold w-full sm:w-auto flex items-center gap-1.5"
            >
              {logging ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              Log Email as Sent
            </Button>
          </div>
        </div>
      }
      className="max-w-4xl"
    >
      {profileLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Tailoring outreach drafts to your profile...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
          <div className="md:col-span-2 space-y-4">
            {/* AI Generate Section */}
            <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
                  <Wand2 className="h-4 w-4" /> AI Email Generator
                </h3>
                {aiGenerated && (
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> AI Draft Ready
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="aiFocus" className="text-[10px] text-muted-foreground font-semibold uppercase">
                    Email Focus
                  </Label>
                  <select
                    id="aiFocus"
                    value={aiFocus}
                    onChange={(e) => setAiFocus(e.target.value as EmailFocus)}
                    disabled={aiGenerating}
                    className="w-full min-h-9 px-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="research">Research Focus</option>
                    <option value="funding">Funding Inquiry</option>
                    <option value="paper">Specific Paper</option>
                    <option value="followUp1">Follow-up #1</option>
                    <option value="followUp2">Follow-up #2</option>
                  </select>
                </div>

                {aiFocus === "paper" && (
                  <div className="space-y-1">
                    <Label htmlFor="aiPaperTitle" className="text-[10px] text-muted-foreground font-semibold uppercase">
                      Paper Title
                    </Label>
                    <Input
                      id="aiPaperTitle"
                      value={aiPaperTitle}
                      onChange={(e) => setAiPaperTitle(e.target.value)}
                      placeholder="e.g. Instruction Tuning for Low-Resource NLP"
                      disabled={aiGenerating}
                      className="h-9 text-xs bg-background border-border"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAiGenerate}
                  disabled={aiGenerating || maxFollowUpsReached}
                  className="min-h-9 text-xs bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center gap-1.5"
                >
                  {aiGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5" />
                  )}
                  {aiGenerating ? "Generating..." : "AI Generate"}
                </Button>
                {aiGenerated && (
                  <Button
                    onClick={handleAiRegenerate}
                    disabled={aiGenerating}
                    variant="outline"
                    className="min-h-9 text-xs border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Regenerate
                  </Button>
                )}
              </div>
            </div>

            {/* Template Selector */}
            <div className="space-y-1.5">
              <Label htmlFor="templateSelect" className="text-xs font-bold text-muted-foreground uppercase">
                Select Outreach Template
              </Label>
              <select
                id="templateSelect"
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                className="w-full min-h-11 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Research Proposal Assistant */}
            <div className="border border-border/60 bg-muted/10 rounded-xl p-4 space-y-3">
              <button
                type="button"
                onClick={() => setShowProposalAssistant(!showProposalAssistant)}
                className="flex items-center justify-between w-full text-xs font-bold text-foreground uppercase tracking-wide cursor-pointer"
              >
                <span className="flex items-center gap-1.5 text-primary">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Research Proposal Assistant (P3)
                </span>
                <span className="text-muted-foreground text-[10px]">{showProposalAssistant ? "Hide" : "Expand"}</span>
              </button>

              {showProposalAssistant && (
                <div className="space-y-3 pt-2 border-t border-border/30 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <Label htmlFor="profPaper" className="text-[11px] text-muted-foreground font-semibold">
                      Professor&apos;s Recent Paper Title / Abstract
                    </Label>
                    <textarea
                      id="profPaper"
                      rows={3}
                      placeholder="e.g. Instruction Tuning of Large Language Models for Low-Resource Languages"
                      value={profPaper}
                      onChange={(e) => setProfPaper(e.target.value)}
                      className="w-full p-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="userThesis" className="text-[11px] text-muted-foreground font-semibold">
                      Your Previous Work / Thesis Topic
                    </Label>
                    <textarea
                      id="userThesis"
                      rows={2}
                      placeholder="e.g. Sentiment analysis on Bangla social media text using BERT"
                      value={userThesis}
                      onChange={(e) => setUserThesis(e.target.value)}
                      className="w-full p-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground/40"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      onClick={generateQuestions}
                      disabled={!profPaper.trim() || !userThesis.trim()}
                      className="min-h-11 text-xs bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                    >
                      Generate Bridging Questions
                    </Button>
                    {generatedQuestions.length > 0 && (
                      <Button
                        type="button"
                        onClick={injectQuestionsIntoBody}
                        variant="outline"
                        className="min-h-11 text-xs border-primary/30 text-primary hover:bg-primary/10"
                      >
                        Inject into Email Draft
                      </Button>
                    )}
                  </div>

                  {generatedQuestions.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <Label className="text-[11px] font-bold text-foreground">Generated Research Questions:</Label>
                      <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                        {generatedQuestions.map((q, idx) => (
                          <div key={idx} className="p-2 rounded bg-background border border-border/60 text-xs text-foreground leading-relaxed">
                            {q}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Subject Line */}
            <div className="space-y-1.5 relative">
              <Label htmlFor="subject" className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
                <span>Subject Line</span>
                <button onClick={copySubject} className="text-primary hover:underline flex items-center gap-1 normal-case font-medium text-[11px]">
                  <Copy className="h-3 w-3" /> Copy Subject
                </button>
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            {/* Body Text Area */}
            <div className="space-y-1.5 relative">
              <Label htmlFor="body" className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
                <span>Email Content</span>
                <button onClick={copyBody} className="text-primary hover:underline flex items-center gap-1 normal-case font-medium text-[11px]">
                  <Copy className="h-3 w-3" /> Copy Body
                </button>
              </Label>
              <textarea
                id="body"
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-4 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Sidebar Advisor Panel */}
          <div className="space-y-4">
            {/* BDT Timezone Advisor Card */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2.5">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
                <Clock className="h-4 w-4" /> BDT Timezone Advisor
              </h4>
              <div className="space-y-1">
                <div className="text-[11px] text-muted-foreground">Target Country</div>
                <div className="text-sm font-bold text-foreground">{tzAdvice.country}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-muted-foreground">Optimal Sending Slot (Local)</div>
                <div className="text-sm font-bold text-amber-400">{tzAdvice.localWindow}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-muted-foreground">Target BDT Window</div>
                <div className="text-sm font-bold text-emerald-400">{tzAdvice.bdtWindow}</div>
              </div>
              <p className="text-[11px] leading-normal text-muted-foreground/90 border-t border-primary/10 pt-2">
                {tzAdvice.advice}
              </p>
            </div>

            {/* Follow-up Track Card */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Outreach Tracker Rules
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-bold text-foreground capitalize">{professor.status.replace("_", " ").toLowerCase()}</span>
                </div>

                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground">Follow-ups Logged:</span>
                  <span className={`font-bold ${maxFollowUpsReached ? "text-destructive" : "text-foreground"}`}>
                    {followUpCount} / 2
                  </span>
                </div>

                {professor.emailSentDate && (
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">Initial Sent:</span>
                    <span className="font-medium text-foreground">
                      {new Date(professor.emailSentDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {lastEmailDate && (
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">Days Since Last:</span>
                    <span className={`font-bold ${isWithin14Days ? "text-amber-500" : "text-emerald-400"}`}>
                      {daysSinceLastEmail} days
                    </span>
                  </div>
                )}

                {professor.nextFollowUp && (
                  <div className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-muted-foreground">Next Follow-up Due:</span>
                    <span className="font-medium text-foreground">
                      {new Date(professor.nextFollowUp).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {maxFollowUpsReached ? (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-[11px] text-destructive flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Hard Limit Reached:</strong> Maximum of 2 follow-ups allowed. Do not email this professor again.
                  </div>
                </div>
              ) : isWithin14Days ? (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-500 flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Gap Constraint:</strong> Only {daysSinceLastEmail} days elapsed since your last outreach. Wait at least 14 days.
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[11px] text-emerald-400 flex gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    Ready to send! Make sure you copy the draft and send it using your email client.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ResponsiveModal>
  );
}
