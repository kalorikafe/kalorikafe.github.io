import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MACRO_PROFILE,
  DEFAULT_USER_GOALS,
  PROFILE_LIMITS,
  calculateUserMacroGoals,
  isProfileFieldValid,
  normalizeStoredGoals,
  validateProfile,
} from '../../src/utils/macroGoals';

describe('macro goal defaults', () => {
  it('exposes a complete default profile within the validation bounds', () => {
    expect(DEFAULT_MACRO_PROFILE.gender).toMatch(/^(male|female)$/);
    expect(isProfileFieldValid('age', DEFAULT_MACRO_PROFILE.age)).toBe(true);
    expect(isProfileFieldValid('weightKg', DEFAULT_MACRO_PROFILE.weightKg)).toBe(true);
    expect(isProfileFieldValid('heightCm', DEFAULT_MACRO_PROFILE.heightCm)).toBe(true);
    expect([1.2, 1.375, 1.55, 1.725]).toContain(DEFAULT_MACRO_PROFILE.activity);
    expect(['lose', 'maintain', 'gain']).toContain(DEFAULT_MACRO_PROFILE.goalType);
  });

  it('keeps the legacy default goals (2000 kcal, 400 mg caffeine)', () => {
    expect(DEFAULT_USER_GOALS).toMatchObject({
      calorieGoal: 2000,
      proteinGoal: 70,
      carbGoal: 250,
      fatGoal: 65,
      maxCaffeine: 400,
    });
    expect(DEFAULT_USER_GOALS.profile).toEqual(DEFAULT_MACRO_PROFILE);
  });
});

describe('calculateUserMacroGoals (unchanged Harris-Benedict math)', () => {
  it('reproduces the classic male lose-weight result', () => {
    const goals = calculateUserMacroGoals({
      gender: 'male',
      age: 25,
      weightKg: 70,
      heightCm: 175,
      activity: 1.375,
      goalType: 'lose',
    });
    // BMR = 88.362 + 13.397*70 + 4.799*175 - 5.677*25 = 1724.05
    // TDEE = 1724.05 * 1.375 * 0.8 = 1896.46 → 1896 kcal
    expect(goals.calorieGoal).toBe(1896);
    expect(goals.proteinGoal).toBe(126); // 70 * 1.8
    expect(goals.fatGoal).toBe(53); // 1897 * 0.25 / 9 = 52.7 → 53
    expect(goals.carbGoal).toBe(229); // (1897 - 126*4 - 53*9) / 4 = 229
    expect(goals.maxCaffeine).toBe(400); // personal daily limit default
    expect(goals.profile).toEqual({
      gender: 'male',
      age: 25,
      weightKg: 70,
      heightCm: 175,
      activity: 1.375,
      goalType: 'lose',
    });
  });

  it('keeps the female formula and maintenance goal untouched', () => {
    const goals = calculateUserMacroGoals({
      gender: 'female',
      age: 30,
      weightKg: 60,
      heightCm: 165,
      activity: 1.2,
      goalType: 'maintain',
    });
    // BMR = 447.593 + 9.247*60 + 3.098*165 - 4.330*30 = 1383.68
    // TDEE = 1383.68 * 1.2 = 1660.42 → 1660 kcal (no goal multiplier)
    expect(goals.calorieGoal).toBe(1660);
    expect(goals.proteinGoal).toBe(108);
    expect(goals.fatGoal).toBe(46);
    expect(goals.carbGoal).toBe(204);
    expect(goals.maxCaffeine).toBe(400);
  });

  it('floors carbs at 50g and fat at 40g like the calculator always did', () => {
    const goals = calculateUserMacroGoals({
      gender: 'female',
      age: 50,
      weightKg: 40,
      heightCm: 150,
      activity: 1.2,
      goalType: 'lose',
    });
    expect(goals.carbGoal).toBeGreaterThanOrEqual(50);
    expect(goals.fatGoal).toBeGreaterThanOrEqual(40);
  });
});

describe('normalizeStoredGoals (localStorage migration)', () => {
  it('returns defaults for empty / null / broken values', () => {
    expect(normalizeStoredGoals(null)).toEqual(DEFAULT_USER_GOALS);
    expect(normalizeStoredGoals(undefined)).toEqual(DEFAULT_USER_GOALS);
    expect(normalizeStoredGoals('not-json')).toEqual(DEFAULT_USER_GOALS);
    expect(normalizeStoredGoals(42)).toEqual(DEFAULT_USER_GOALS);
    expect(normalizeStoredGoals({})).toEqual(DEFAULT_USER_GOALS);
  });

  it('migrates a legacy numeric record in place: values preserved + profile attached', () => {
    const legacy = { calorieGoal: 1500, proteinGoal: 100, carbGoal: 180, fatGoal: 50, maxCaffeine: 300 };
    const migrated = normalizeStoredGoals(legacy);
    expect(migrated).toMatchObject(legacy);
    expect(migrated.profile).toEqual(DEFAULT_MACRO_PROFILE);
    // The original record is never rewritten by the migration itself.
    expect(legacy).not.toHaveProperty('profile');
  });

  it('keeps a new-format record with its saved profile', () => {
    const saved = {
      calorieGoal: 2200,
      proteinGoal: 130,
      carbGoal: 260,
      fatGoal: 70,
      maxCaffeine: 350,
      profile: { gender: 'female', age: 32, weightKg: 62, heightCm: 168, activity: 1.55, goalType: 'gain' },
    };
    expect(normalizeStoredGoals(saved)).toEqual(saved);
  });

  it('recovers per-field from partially broken records without crashing', () => {
    const broken = {
      calorieGoal: 'two-thousand',
      proteinGoal: -5,
      carbGoal: 180,
      fatGoal: null,
      maxCaffeine: 300,
      profile: { gender: 'female', age: 30, weightKg: 60, heightCm: 165, activity: 1.55, goalType: 'gain' },
    };
    const out = normalizeStoredGoals(broken);
    expect(out.calorieGoal).toBe(DEFAULT_USER_GOALS.calorieGoal);
    expect(out.proteinGoal).toBe(DEFAULT_USER_GOALS.proteinGoal);
    expect(out.carbGoal).toBe(180);
    expect(out.fatGoal).toBe(DEFAULT_USER_GOALS.fatGoal);
    expect(out.maxCaffeine).toBe(300);
    expect(out.profile).toEqual({ gender: 'female', age: 30, weightKg: 60, heightCm: 165, activity: 1.55, goalType: 'gain' });
  });

  it('drops malformed profiles back to the default profile', () => {
    const out = normalizeStoredGoals({
      calorieGoal: 1800,
      proteinGoal: 90,
      carbGoal: 200,
      fatGoal: 60,
      maxCaffeine: 400,
      profile: { gender: 'alien', age: 25, weightKg: 70, heightCm: 175, activity: 1.375, goalType: 'lose' },
    });
    expect(out.profile).toEqual(DEFAULT_MACRO_PROFILE);
    expect(out.calorieGoal).toBe(1800);
  });
});

describe('profile validation bounds', () => {
  it('accepts boundary values and rejects out-of-range ones', () => {
    expect(isProfileFieldValid('age', 15)).toBe(true);
    expect(isProfileFieldValid('age', 75)).toBe(true);
    expect(isProfileFieldValid('age', 14)).toBe(false);
    expect(isProfileFieldValid('age', 76)).toBe(false);
    expect(isProfileFieldValid('weightKg', 35)).toBe(true);
    expect(isProfileFieldValid('weightKg', 250)).toBe(true);
    expect(isProfileFieldValid('weightKg', 34)).toBe(false);
    expect(isProfileFieldValid('weightKg', 251)).toBe(false);
    expect(isProfileFieldValid('heightCm', 120)).toBe(true);
    expect(isProfileFieldValid('heightCm', 230)).toBe(true);
    expect(isProfileFieldValid('heightCm', 119)).toBe(false);
    expect(isProfileFieldValid('heightCm', 231)).toBe(false);
    expect(isProfileFieldValid('weightKg', NaN)).toBe(false);
  });

  it('exposes the documented limits', () => {
    expect(PROFILE_LIMITS).toEqual({
      age: { min: 15, max: 75 },
      weightKg: { min: 35, max: 250 },
      heightCm: { min: 120, max: 230 },
    });
  });

  it('validateProfile aggregates all three fields', () => {
    expect(validateProfile({ age: 30, weightKg: 70, heightCm: 175 })).toEqual({
      valid: true,
      age: true,
      weightKg: true,
      heightCm: true,
    });
    expect(validateProfile({ age: 30, weightKg: 400, heightCm: 175 }).valid).toBe(false);
    expect(validateProfile({ age: 30, weightKg: 400, heightCm: 175 }).weightKg).toBe(false);
  });
});
