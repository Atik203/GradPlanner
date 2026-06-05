/**
 * Calculates a suggested research fit score between 1 and 10 based on overlapping interests.
 * Normalizes common acronyms/synonyms in CSE (e.g., NLP -> Natural Language Processing).
 */

const SYNONYM_MAP: Record<string, string[]> = {
  nlp: ["natural language processing", "llm", "large language model", "transformers", "text", "bert", "gpt"],
  cv: ["computer vision", "image", "video", "object detection", "segmentation", "gan"],
  ml: ["machine learning", "deep learning", "neural network", "supervised", "unsupervised", "reinforcement learning", "rl"],
  ai: ["artificial intelligence", "intelligent", "agent"],
  hci: ["human-computer interaction", "ui", "ux", "user interface", "user experience"],
  db: ["database", "sql", "nosql", "data management", "distributed systems"],
  security: ["cybersecurity", "cryptography", "privacy", "blockchain", "network security"],
  robotics: ["autonomous", "control systems", "planning", "perception"],
  systems: ["distributed systems", "operating systems", "cloud", "networking", "compilers"],
};

export function calculateResearchFit(
  userInterests: string[] | string | undefined | null,
  profInterests: string | undefined | null
): number {
  if (!userInterests || !profInterests) {
    return 1; // Default minimum score if no data
  }

  // Parse user interests into flat array of normalized lowercase words
  let parsedUser: string[] = [];
  if (Array.isArray(userInterests)) {
    parsedUser = userInterests.map(i => i.toLowerCase().trim()).filter(Boolean);
  } else if (typeof userInterests === "string") {
    parsedUser = userInterests
      .split(/[,;\n]/)
      .map(i => i.toLowerCase().trim())
      .filter(Boolean);
  }

  if (parsedUser.length === 0) {
    return 1;
  }

  const profText = profInterests.toLowerCase();

  let score = 1; // Base score
  let matchCount = 0;

  parsedUser.forEach(interest => {
    // 1. Direct match (substring of professor interests contains the interest)
    if (profText.includes(interest)) {
      matchCount += 1.5;
      return;
    }

    // 2. Check acronym/synonym matches
    for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
      const isUserKeyword = interest === key || interest.includes(key) || synonyms.some(syn => interest.includes(syn));
      const isProfKeyword = profText.includes(key) || synonyms.some(syn => profText.includes(syn));

      if (isUserKeyword && isProfKeyword) {
        matchCount += 1.0;
        break; // Count once per synonym category
      }
    }
  });

  // Calculate final score
  // If matchCount > 0, we add to base score. Max score is 10.
  if (matchCount > 0) {
    score += Math.ceil(matchCount * 3);
  }

  return Math.min(10, Math.max(1, score));
}
