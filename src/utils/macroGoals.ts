export type Gender = 'male' | 'female';
export type GoalType = 'lose' | 'maintain' | 'gain';

/**
 * Personal profile used to compute daily macro targets (BMR/TDEE based).
 * Kept as an optional field on UserMacroGoals so that pre-existing numeric
 * `kalori_cafe_goals` records (which carry no profile) stay valid and are
 * migrated in place without data loss.
 */
export interface MacroProfile {
  gender: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: number; // TDEE activity multiplier (1.2 .. 1.725)
  goalType: GoalType;
}

export interface UserMacroGoals {
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  maxCaffeine: number;
  /** Saved personal profile that produced these goals (new format). */
  profile?: MacroProfile;
}

export const DEFAULT_MACRO_PROFILE: MacroProfile = {
  gender: 'male',
  age: 25,
  weightKg: 70,
  heightCm: 175,
  activity: 1.375,
  goalType: 'lose',
};

export const DEFAULT_USER_GOALS: UserMacroGoals = {
  calorieGoal: 2000,
  proteinGoal: 70,
  carbGoal: 250,
  fatGoal: 65,
  maxCaffeine: 400,
  profile: { ...DEFAULT_MACRO_PROFILE },
};

/** Validation bounds for the profile form (inline errors + disabled Apply). */
export const PROFILE_LIMITS = {
  age: { min: 15, max: 75 },
  weightKg: { min: 35, max: 250 },
  heightCm: { min: 120, max: 230 },
} as const;

export function isProfileFieldValid(
  field: 'age' | 'weightKg' | 'heightCm',
  value: number,
): boolean {
  const limits = PROFILE_LIMITS[field];
  return Number.isFinite(value) && value >= limits.min && value <= limits.max;
}

export function validateProfile(profile: Pick<MacroProfile, 'age' | 'weightKg' | 'heightCm'>): {
  valid: boolean;
  age: boolean;
  weightKg: boolean;
  heightCm: boolean;
} {
  const age = isProfileFieldValid('age', profile.age);
  const weightKg = isProfileFieldValid('weightKg', profile.weightKg);
  const heightCm = isProfileFieldValid('heightCm', profile.heightCm);
  return { valid: age && weightKg && heightCm, age, weightKg, heightCm };
}

/**
 * Harris-Benedict BMR → TDEE → goal split. Matches the calculator modal's
 * established behavior exactly (no formula changes on purpose):
 *  - male   BMR = 88.362 + 13.397*w + 4.799*h - 5.677*age
 *  - female BMR = 447.593 + 9.247*w + 3.098*h - 4.330*age
 *  - TDEE = BMR × activity; lose ×0.8 / gain ×1.15
 *  - protein = w × 1.8; fat = 25% of kcal ÷ 9; carbs fill the remainder
 *  - carbs floored at 50 g, fat at 40 g; caffeine default 400 mg
 */
export function calculateUserMacroGoals(profile: MacroProfile): UserMacroGoals {
  const { gender, age, weightKg, heightCm, activity, goalType } = profile;

  let bmr: number;
  if (gender === 'male') {
    bmr = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age;
  }

  let tdee = bmr * activity;
  if (goalType === 'lose') tdee *= 0.8; // 20% deficit
  else if (goalType === 'gain') tdee *= 1.15; // 15% surplus

  const cal = Math.round(tdee);
  const protein = Math.round(weightKg * 1.8);
  const fat = Math.round((cal * 0.25) / 9);
  const carb = Math.round((cal - protein * 4 - fat * 9) / 4);

  return {
    calorieGoal: cal,
    proteinGoal: protein,
    carbGoal: Math.max(50, carb),
    fatGoal: Math.max(40, fat),
    maxCaffeine: 400, // user's personal daily caffeine limit default
    profile: { ...profile },
  };
}

function asNonNegativeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : fallback;
}

function normalizeProfile(raw: unknown): MacroProfile | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const p = raw as Record<string, unknown>;
  const gender = p.gender === 'female' ? 'female' : p.gender === 'male' ? 'male' : undefined;
  const goalType =
    p.goalType === 'lose' || p.goalType === 'maintain' || p.goalType === 'gain'
      ? p.goalType
      : undefined;
  if (gender === undefined || goalType === undefined) return undefined;
  return {
    gender,
    goalType,
    age: asNonNegativeNumber(p.age, DEFAULT_MACRO_PROFILE.age),
    weightKg: asNonNegativeNumber(p.weightKg, DEFAULT_MACRO_PROFILE.weightKg),
    heightCm: asNonNegativeNumber(p.heightCm, DEFAULT_MACRO_PROFILE.heightCm),
    activity: asNonNegativeNumber(p.activity, DEFAULT_MACRO_PROFILE.activity),
  };
}

/**
 * Normalizes whatever was parsed out of `kalori_cafe_goals` into the full
 * UserMacroGoals shape without losing any usable old data:
 *  - new records (with profile)   → validated field while; bad fields fall
 *    back to DEFAULTS individually.
 *  - legacy numeric records (no profile) → numeric values preserved, the
 *    default profile is attached (in-place migration; the stored string is
 *    never rewritten or deleted).
 *  - empty / null / broken JSON   → DEFAULT_USER_GOALS.
 */
export function normalizeStoredGoals(value: unknown): UserMacroGoals {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_USER_GOALS, profile: { ...DEFAULT_MACRO_PROFILE } };
  }
  const raw = value as Record<string, unknown>;
  const profile = normalizeProfile(raw.profile);
  return {
    calorieGoal: asNonNegativeNumber(raw.calorieGoal, DEFAULT_USER_GOALS.calorieGoal),
    proteinGoal: asNonNegativeNumber(raw.proteinGoal, DEFAULT_USER_GOALS.proteinGoal),
    carbGoal: asNonNegativeNumber(raw.carbGoal, DEFAULT_USER_GOALS.carbGoal),
    fatGoal: asNonNegativeNumber(raw.fatGoal, DEFAULT_USER_GOALS.fatGoal),
    maxCaffeine: asNonNegativeNumber(raw.maxCaffeine, DEFAULT_USER_GOALS.maxCaffeine),
    profile: profile ?? { ...DEFAULT_MACRO_PROFILE },
  };
}