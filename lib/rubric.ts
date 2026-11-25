/** Rubric weights (D11). English fluency is reported separately and never counted. */
export const CRITERIA = {
  technical: { label: "Technical knowledge", weight: 0.35 },
  problemSolving: { label: "Problem solving", weight: 0.25 },
  communication: { label: "Communication", weight: 0.25 },
  behavioral: { label: "Behavioral", weight: 0.15 },
} as const;
export type Criterion = keyof typeof CRITERIA;
