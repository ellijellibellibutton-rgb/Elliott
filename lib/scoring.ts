import type { ScoringCategory } from "@prisma/client";

/**
 * Computes points earned for an activity given its scoring category.
 * DOLLAR categories: points = (dollarAmount / 100) * pointsPer100
 * FIXED categories: points = pointValue * quantity
 */
export function computeActivityPoints(
  category: Pick<ScoringCategory, "type" | "pointValue" | "pointsPer100">,
  input: { quantity: number; dollarAmount: number }
): number {
  if (category.type === "DOLLAR") {
    const points = (input.dollarAmount / 100) * category.pointsPer100;
    return Math.round(points * 100) / 100;
  }
  const points = category.pointValue * (input.quantity || 1);
  return Math.round(points * 100) / 100;
}
