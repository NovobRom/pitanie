import { describe, it, expect } from 'vitest';
import { calcGoals } from './nutrition';

describe('calcGoals validation and calculations', () => {
  it('calculates correct goals for standard male parameters', () => {
    const params = {
      sex: 'male' as const,
      weight: '80',
      height: '180',
      age: '25',
      bodyFat: '',
      activity: 'moderate' as const,
      goal: 'maintain' as const,
      proteinPerKg: 2.0,
      fatPct: 25,
    };

    const result = calcGoals(params);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.goals.calories).toBeGreaterThan(1500);
      expect(result.data.goals.protein).toBe(160); // 80kg * 2.0
      expect(result.data.goals.fat).toBeGreaterThan(30);
      expect(result.data.goals.carbs).toBeGreaterThan(100);
    }
  });

  it('calculates correct goals for lose goal (20% deficit)', () => {
    const params = {
      sex: 'female' as const,
      weight: '60',
      height: '165',
      age: '30',
      bodyFat: '',
      activity: 'light' as const,
      goal: 'lose' as const,
      proteinPerKg: 1.8,
      fatPct: 30,
    };

    const result = calcGoals(params);
    expect(result.ok).toBe(true);
  });

  it('returns errors for invalid weight parameter', () => {
    const params = {
      sex: 'male' as const,
      weight: '10', // invalid, too low (min 20)
      height: '180',
      age: '25',
      bodyFat: '',
      activity: 'moderate' as const,
      goal: 'maintain' as const,
      proteinPerKg: 2.0,
      fatPct: 25,
    };

    const result = calcGoals(params);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe('weight');
    }
  });

  it('returns errors for invalid age parameter', () => {
    const params = {
      sex: 'female' as const,
      weight: '70',
      height: '170',
      age: '160', // invalid, too high (max 150)
      bodyFat: '',
      activity: 'light' as const,
      goal: 'maintain' as const,
      proteinPerKg: 2.0,
      fatPct: 25,
    };

    const result = calcGoals(params);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe('age');
    }
  });
});
