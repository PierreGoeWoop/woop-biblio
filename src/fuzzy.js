/**
 * Fuzzy / lexical search utilities
 * Uses Levenshtein edit distance to find words close to the query.
 */

/** Memory-efficient Levenshtein distance between two strings */
function levenshtein(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  // Keep shorter string in `a`
  if (a.length > b.length) {
    const tmp = a;
    a = b;
    b = tmp;
  }

  let prev = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j++) {
    const curr = [j];
    for (let i = 1; i <= a.length; i++) {
      curr[i] =
        b[j - 1] === a[i - 1]
          ? prev[i - 1]
          : 1 + Math.min(prev[i], curr[i - 1], prev[i - 1]);
    }
    prev = curr;
  }
  return prev[a.length];
}

/**
 * Score how well a query token matches a single dictionary word.
 * Returns a value in [0, 1]:
 *   1.0  → exact match
 *   0.9  → prefix  ("deliv" matches "delivery")
 *   0.8  → substring
 *   0.5–0.7 → fuzzy (Levenshtein ≤ threshold, for tokens ≥ 4 chars)
 *   0    → no match
 *
 * Fuzzy tolerance: 1 edit allowed per 4 chars of the query token.
 * (4–5 chars → 1 edit | 8–11 chars → 2 edits | …)
 */
function tokenScore(token, word) {
  if (word === token) return 1.0;
  if (word.startsWith(token)) return 0.9;
  if (word.includes(token)) return 0.8;

  if (token.length >= 4) {
    const maxDist = Math.floor(token.length / 4);
    const dist = levenshtein(token, word);
    if (dist <= maxDist) return Math.max(0.5, 0.72 - dist * 0.1);
  }

  return 0;
}

/**
 * Score an image entry against an array of query tokens.
 *
 * - Each token is matched against every word in the image name + every tag.
 * - The best match score for each token is kept.
 * - If any token scores 0 the image is excluded (returns 0).
 * - Final score = average of per-token best scores.
 */
export function scoreImage(img, tokens) {
  if (tokens.length === 0) return 1;

  const words = [
    ...img.name.toLowerCase().split(/\s+/).filter(Boolean),
    ...img.tags,
  ];

  let total = 0;
  for (const token of tokens) {
    let best = 0;
    for (const word of words) {
      const s = tokenScore(token, word);
      if (s > best) best = s;
      if (best === 1) break;
    }
    if (best === 0) return 0; // token matched nothing → exclude
    total += best;
  }
  return total / tokens.length;
}

/**
 * Returns true when the search results include at least one fuzzy hit
 * (= match score < 0.8, meaning no exact/prefix/substring match).
 */
export function hasFuzzyHits(scores) {
  return scores.length > 0 && scores[0] < 0.8;
}
