export type Sex = "male" | "female";

export type Goal = "maintain" | "cut" | "bulk";

export interface BMRInput {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
}

export interface TDEEInput extends BMRInput {
  activityMultiplier: number;
}

export const ACTIVITY_LEVELS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_LEVELS;

/**
 * Calculate BMR using Mifflin–St Jeor equation
 */
export function calculateBMR({
  sex,
  weightKg,
  heightCm,
  age,
}: BMRInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(bmr: number, activityMultiplier: number): number {
  return bmr * activityMultiplier;
}

/**
 * Adjust calories based on goal
 */
export function adjustCalories(
  tdee: number,
  goal: Goal,
  delta: number = 500,
): number {
  switch (goal) {
    case "cut":
      return tdee - delta;
    case "bulk":
      return tdee + delta;
    default:
      return tdee;
  }
}
