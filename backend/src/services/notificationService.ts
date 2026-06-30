import { prisma } from "../lib/prisma.js";
import { logger } from "../utils/logger.js";
import { NotificationType } from "@prisma/client";

type GenResult = { created: boolean; type: NotificationType } | null;

async function createIfNotExists(
  userId: string,
  type: NotificationType,
  referenceId: string | null,
  title: string,
  message: string,
  link?: string
): Promise<GenResult> {
  const existing = await prisma.notification.findFirst({
    where: { userId, type, referenceId, isRead: false },
    select: { id: true },
  });
  if (existing) return null;

  await prisma.notification.create({
    data: { userId, type, title, message, link, referenceId },
  });
  return { created: true, type };
}

export async function generateDeadlineNotifications(userId: string): Promise<GenResult[]> {
  const results: GenResult[] = [];

  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { emailDeadlineAlerts: true },
    });
    if (settings && !settings.emailDeadlineAlerts) return results;

    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const applications = await prisma.application.findMany({
      where: { userId, deletedAt: null, deadline: { not: null } },
      select: {
        id: true,
        deadline: true,
        university: { select: { name: true } },
      },
    });

    for (const app of applications) {
      if (!app.deadline) continue;
      const deadline = new Date(app.deadline);

      if (deadline <= in7Days && deadline > now) {
        const r = await createIfNotExists(
          userId,
          "DEADLINE_URGENT",
          app.id,
          `URGENT: ${app.university.name} deadline approaching`,
          `Only ${Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days left to submit your application to ${app.university.name}.`,
          "/dashboard/applications"
        );
        if (r) results.push(r);
      } else if (deadline <= in30Days && deadline > now) {
        const r = await createIfNotExists(
          userId,
          "DEADLINE_APPROACHING",
          app.id,
          `${app.university.name} deadline is coming up`,
          `Deadline in ${Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days. Make sure your application materials are ready.`,
          "/dashboard/applications"
        );
        if (r) results.push(r);
      }
    }
  } catch (error) {
    logger.warn("generateDeadlineNotifications failed", { userId, error: String(error) });
  }

  return results;
}

export async function generateFollowUpNotifications(userId: string): Promise<GenResult[]> {
  const results: GenResult[] = [];

  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { timelineNotifications: true },
    });
    if (settings && !settings.timelineNotifications) return results;

    const now = new Date();

    const professors = await prisma.professor.findMany({
      where: { userId, deletedAt: null },
      select: { id: true, name: true, nextFollowUp: true, followUpCount: true },
    });

    for (const prof of professors) {
      if (prof.followUpCount >= 2) {
        const r = await createIfNotExists(
          userId,
          "FOLLOW_UP_LIMIT",
          prof.id,
          `Follow-up limit reached for Prof. ${prof.name}`,
          `You have already sent 2 follow-ups to ${prof.name}. No further follow-ups are recommended.`,
          "/dashboard/professors/reminders"
        );
        if (r) results.push(r);
        continue;
      }

      if (prof.nextFollowUp && new Date(prof.nextFollowUp) <= now) {
        const r = await createIfNotExists(
          userId,
          "FOLLOW_UP_DUE",
          prof.id,
          `Time to follow up with Prof. ${prof.name}`,
          `Your nextFollowUp date (${new Date(prof.nextFollowUp).toLocaleDateString()}) is due. Send a follow-up email.`,
          `/dashboard/professors/reminders`
        );
        if (r) results.push(r);
      }
    }
  } catch (error) {
    logger.warn("generateFollowUpNotifications failed", { userId, error: String(error) });
  }

  return results;
}

export async function generateDocumentExpiryNotifications(userId: string): Promise<GenResult[]> {
  const results: GenResult[] = [];

  try {
    const now = new Date();
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const documents = await prisma.document.findMany({
      where: { userId, expiresAt: { not: null }, status: { not: "EXPIRED" } },
      select: { id: true, name: true, expiresAt: true },
    });

    for (const doc of documents) {
      if (!doc.expiresAt) continue;
      const expiresAt = new Date(doc.expiresAt);

      if (expiresAt <= in60Days && expiresAt > now) {
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const r = await createIfNotExists(
          userId,
          "DOCUMENT_EXPIRING",
          doc.id,
          `${doc.name} expires soon`,
          `Your ${doc.name} will expire in ${daysLeft} days. Renew it before it becomes invalid for applications.`,
          "/dashboard/documents"
        );
        if (r) results.push(r);
      }
    }
  } catch (error) {
    logger.warn("generateDocumentExpiryNotifications failed", { userId, error: String(error) });
  }

  return results;
}

function calculateProfileCompleteness(profile: {
  university?: string | null;
  cgpa?: number | null;
  targetIntake?: string | null;
  targetDegree?: string | null;
  ieltsScore?: number | null;
  monthlyBudgetUSD?: number | null;
  researchInterests?: string[] | null;
  prPriority?: number | null;
  familyRelocation?: boolean | null;
}): number {
  const fields = [
    profile.university,
    profile.cgpa !== null && profile.cgpa !== undefined,
    profile.targetIntake,
    profile.targetDegree,
    profile.ieltsScore !== null && profile.ieltsScore !== undefined,
    profile.monthlyBudgetUSD !== null && profile.monthlyBudgetUSD !== undefined,
    profile.researchInterests && profile.researchInterests.length > 0,
    profile.prPriority !== null && profile.prPriority !== undefined,
    profile.familyRelocation !== null && profile.familyRelocation !== undefined,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export async function generateProfileNotifications(userId: string): Promise<GenResult[]> {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      const r = await createIfNotExists(
        userId,
        "PROFILE_INCOMPLETE",
        null,
        "Complete your academic profile",
        "Your profile is empty. Fill in your CGPA, IELTS, and research interests to unlock personalized recommendations.",
        "/dashboard/profile"
      );
      return r ? [r] : [];
    }

    if (profile.isOnboarded === false) return [];

    const completeness = calculateProfileCompleteness(profile);
    if (completeness >= 60) return [];

    const r = await createIfNotExists(
      userId,
      "PROFILE_INCOMPLETE",
      null,
      "Your profile needs attention",
      `Your profile is only ${completeness}% complete. Add more details for better university match recommendations.`,
      "/dashboard/profile"
    );
    return r ? [r] : [];
  } catch (error) {
    logger.warn("generateProfileNotifications failed", { userId, error: String(error) });
    return [];
  }
}

export async function generateApplicationUpdateNotification(
  userId: string,
  applicationId: string,
  universityName: string,
  newStatus: string
): Promise<GenResult | null> {
  try {
    if (newStatus === "OFFER_RECEIVED") {
      return createIfNotExists(
        userId,
        "APPLICATION_UPDATE",
        applicationId,
        `Offer received from ${universityName}!`,
        `Congratulations! ${universityName} has sent you an offer. Check the details and respond before the deadline.`,
        "/dashboard/applications"
      );
    }

    return null;
  } catch (error) {
    logger.warn("generateApplicationUpdateNotification failed", {
      userId,
      applicationId,
      error: String(error),
    });
    return null;
  }
}

export async function cleanupOldNotifications(userId: string): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    await prisma.notification.deleteMany({
      where: { userId, isRead: true, createdAt: { lt: cutoff } },
    });
  } catch (error) {
    logger.warn("cleanupOldNotifications failed", { userId, error: String(error) });
  }
}

export async function generateAllNotifications(userId: string): Promise<void> {
  await Promise.all([
    generateDeadlineNotifications(userId),
    generateFollowUpNotifications(userId),
    generateDocumentExpiryNotifications(userId),
    generateProfileNotifications(userId),
  ]);
}
