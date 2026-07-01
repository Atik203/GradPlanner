import OpenAI from "openai";
import { logger } from "../utils/logger.js";

const apiKey = process.env.OPENAI_API_KEY?.trim();

let client: OpenAI | null = null;
if (apiKey && apiKey.length > 0 && !apiKey.startsWith("sk-")) {
  logger.warn("OPENAI_API_KEY is set but does not look like a valid OpenAI key (expected sk-... prefix)");
}

if (apiKey && apiKey.length > 0) {
  client = new OpenAI({ apiKey });
} else {
  logger.warn("OPENAI_API_KEY not set — LLM features will fall back to template emails");
}

export interface GenerateEmailOptions {
  focus?: "research" | "funding" | "paper" | "followUp1" | "followUp2";
  paperTitle?: string;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
}

interface ProfessorContext {
  name: string;
  researchInterests: string | null;
  universityName: string | null;
  universityCountry: string | null;
  emailSentDate: Date | null;
  followUpCount: number;
  lastFollowUp: Date | null;
}

interface UserContext {
  name: string;
  email: string;
  university: string | null;
  cgpa: number | null;
  ieltsScore: number | null;
  targetDegree: string | null;
  targetIntake: string | null;
  researchInterests: string[];
}

function buildSystemPrompt(): string {
  return `You are an expert academic email writing assistant for Bangladeshi students applying to graduate programs (MSc/PhD) abroad.

Rules:
1. Keep the email between 150–200 words.
2. Use a professional, respectful, and confident tone.
3. NEVER use generic flattery. Reference specific research areas when provided.
4. Structure: Introduction → Academic background → Research alignment → Call to action → Closing.
5. Always include a clear CTA: asking about openings, a brief Zoom meeting, or feedback on application.
6. Format the email body as plain text with proper line breaks (no markdown).
7. The user is from Bangladesh — mention their background naturally without over-explaining.
8. Generate a compelling subject line (max 10 words) that includes the professor's research area if known.`;
}

function buildUserContextString(ctx: UserContext): string {
  const parts: string[] = [];
  parts.push(`Student name: ${ctx.name}`);
  if (ctx.university) parts.push(`Undergraduate university: ${ctx.university}`);
  if (ctx.cgpa) parts.push(`CGPA: ${ctx.cgpa}/4.00`);
  if (ctx.ieltsScore) parts.push(`IELTS: ${ctx.ieltsScore}`);
  if (ctx.targetDegree) parts.push(`Target degree: ${ctx.targetDegree}`);
  if (ctx.targetIntake) parts.push(`Target intake: ${ctx.targetIntake}`);
  if (ctx.researchInterests.length > 0) parts.push(`Research interests: ${ctx.researchInterests.join(", ")}`);
  return parts.join("\n");
}

function buildProfessorContextString(prof: ProfessorContext): string {
  const parts: string[] = [];
  parts.push(`Professor name: ${prof.name}`);
  if (prof.researchInterests) parts.push(`Professor's research areas: ${prof.researchInterests}`);
  if (prof.universityName) parts.push(`University: ${prof.universityName}`);
  if (prof.universityCountry) parts.push(`Country: ${prof.universityCountry}`);
  return parts.join("\n");
}

function buildFocusInstruction(focus: string, paperTitle?: string, followUpCount?: number): string {
  switch (focus) {
    case "research":
      return "Focus the email on the student's research interests and how they align with the professor's work. Express genuine interest in joining the research group.";
    case "funding":
      return "Focus the email on inquiring about funded positions (TA/RA/scholarships). The student is seeking financial support. Keep it professional and not desperate.";
    case "paper":
      return `Reference the professor's paper titled "${paperTitle || "their recent work"}" specifically. Mention interest in their methodology or findings. This is a paper-specific inquiry.`;
    case "followUp1":
      return `This is a FIRST follow-up email. The initial email was sent but received no reply. Be brief (120-150 words). Reference the previous email politely without apologizing. Reiterate interest succinctly.`;
    case "followUp2": {
      const fc = followUpCount ?? 1;
      if (fc >= 2) {
        return "This is a FINAL follow-up email. Mention that this will be the last email to respect their inbox. Keep it very brief (100-120 words). Thank them for their time.";
      }
      return `This is a follow-up email (attempt #${fc + 1}). Reference the previous email. Keep it brief (120-150 words).`;
    }
    default:
      return "Write a standard graduate school inquiry email.";
  }
}

export async function generateProfessorEmail(
  professor: ProfessorContext,
  user: UserContext,
  options: GenerateEmailOptions = {}
): Promise<GeneratedEmail> {
  if (!client) {
    logger.warn("LLM not configured — returning fallback", { professorId: professor.name });
    return getFallbackEmail(professor, user, options);
  }

  const systemPrompt = buildSystemPrompt();
  const userContext = buildUserContextString(user);
  const profContext = buildProfessorContextString(professor);
  const focusInstruction = buildFocusInstruction(
    options.focus || "research",
    options.paperTitle,
    professor.followUpCount
  );

  const followUpNote = professor.emailSentDate
    ? `\nFollow-up context: The student has sent ${professor.followUpCount} previous email(s). Last contact was on ${professor.lastFollowUp?.toISOString().slice(0, 10) || "unknown date"}.`
    : "";

  const userPrompt = `${userContext}

${profContext}
${followUpNote}

Instruction: ${focusInstruction}

Generate a professional graduate school inquiry email (150-200 words) with a subject line. Return ONLY valid JSON with keys "subject" and "body".`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      logger.warn("LLM returned empty content — using fallback");
      return getFallbackEmail(professor, user, options);
    }

    const parsed = JSON.parse(content) as { subject?: string; body?: string };
    if (!parsed.subject || !parsed.body) {
      logger.warn("LLM response missing subject or body — using fallback");
      return getFallbackEmail(professor, user, options);
    }

    return {
      subject: parsed.subject.trim().slice(0, 300),
      body: parsed.body.trim(),
    };
  } catch (error) {
    logger.error("LLM generation failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return getFallbackEmail(professor, user, options);
  }
}

function getFallbackEmail(
  professor: ProfessorContext,
  user: UserContext,
  options: GenerateEmailOptions
): GeneratedEmail {
  const profName = professor.name || "Professor";
  const profUni = professor.universityName || "your institution";
  const profInterests = professor.researchInterests || "your research areas";
  const targetDegree = user.targetDegree || "MSc/PhD";
  const targetIntake = user.targetIntake || "Fall 2028";
  const userInterestsStr = user.researchInterests.length > 0
    ? user.researchInterests.join(", ")
    : "Machine Learning / AI";
  const bscUni = user.university || "[My University]";
  const bscCgpa = user.cgpa ? `${user.cgpa}/4.00` : "[CGPA]";

  if (options.focus === "followUp1" || options.focus === "followUp2") {
    const isFinal = options.focus === "followUp2" || (professor.followUpCount ?? 0) >= 1;
    if (isFinal) {
      return {
        subject: `Re: Prospective Graduate Student Inquiry - ${user.name} (Final Follow-up)`,
        body: `Dear Professor ${profName},

I hope this email finds you well.

I am writing this final brief follow-up regarding potential graduate research positions in your lab for the ${targetIntake} term. I understand you are very busy, and I respect your time.

If you have any openings for a student with my background in ${userInterestsStr}, I would be thrilled to join your research group.

Thank you very much for your time and the outstanding contributions you continue to make to the field.

Best regards,

${user.name}
${user.email}
Bangladesh`,
      };
    }

    return {
      subject: `Re: Prospective Graduate Student Inquiry about Research Opportunities`,
      body: `Dear Professor ${profName},

I hope you are having a productive week.

I am writing to briefly follow up on my previous email regarding graduate opportunities in your lab at ${profUni}. I understand you receive many emails, so I wanted to ensure my inquiry did not slip through.

To recap, I am a CSE graduate from ${bscUni} (CGPA: ${bscCgpa}) with research experience in ${userInterestsStr}, which aligns closely with your work on ${profInterests}.

I would be grateful if you could let me know if you might be accepting new graduate students for ${targetIntake}.

Thank you for your time.

Sincerely,

${user.name}
${user.email}
Bangladesh`,
    };
  }

  if (options.focus === "funding") {
    return {
      subject: `Inquiry about Funded Graduate Research Positions - ${user.name}`,
      body: `Dear Professor ${profName},

I hope this email finds you well.

My name is ${user.name}, and I am a Computer Science and Engineering graduate from ${bscUni} (CGPA: ${bscCgpa}). I am writing to inquire about funded graduate research positions (TA/RA) in your lab at ${profUni} for ${targetIntake}.

I have been following your research on ${profInterests}, and I am particularly interested in contributing to your ongoing projects. My background in ${userInterestsStr} has prepared me well for research in this area. However, as an international student, securing a funded position is essential for me to pursue graduate studies abroad.

Could you please let me know if you have any funded openings for ${targetDegree} students in your research group for the upcoming intake?

Thank you for your time and consideration.

Best regards,

${user.name}
${user.email}
Bangladesh`,
    };
  }

  return {
    subject: `Prospective Graduate Student: Inquiry about Research Opportunities`,
    body: `Dear Professor ${profName},

I hope this email finds you well.

My name is ${user.name}, and I recently graduated with a Bachelor's degree in Computer Science and Engineering from ${bscUni}, achieving a CGPA of ${bscCgpa}. I am writing to express my strong interest in joining your research group at ${profUni} as a prospective ${targetDegree} student for the ${targetIntake} term.

I have been following your research on ${profInterests}, and I was particularly drawn to your lab's recent work. During my undergraduate studies, my research focused on ${userInterestsStr}. I believe my academic background and hands-on experience align well with your current research directions.

Would you be available for a brief Zoom meeting to discuss potential research opportunities in your lab? I have attached my CV for your reference.

Thank you for your time and consideration.

Sincerely,

${user.name}
${user.email}
Bangladesh`,
  };
}
