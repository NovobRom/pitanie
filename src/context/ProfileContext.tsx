'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { CalcParams, Macros } from '@/types/nutrition';
import { loadProfile, saveProfileAndGoals, loadWeightHistory, logWeight, WeightEntry } from '@/services/profile.service';

interface ProfileContextType {
  profile: CalcParams | null;
  goals: Macros;
  weightHistory: WeightEntry[];
  isLoading: boolean;
  updateProfileAndGoals: (profile: CalcParams, goals: Macros) => Promise<boolean>;
  logNewWeight: (weight: number, dateStr: string) => Promise<boolean>;
}

const DEFAULT_GOALS: Macros = {
  calories: 2000,
  protein: 150,
  fat: 60,
  carbs: 215,
};

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  goals: DEFAULT_GOALS,
  weightHistory: [],
  isLoading: true,
  updateProfileAndGoals: async () => false,
  logNewWeight: async () => false,
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CalcParams | null>(null);
  const [goals, setGoals] = useState<Macros>(DEFAULT_GOALS);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setGoals(DEFAULT_GOALS);
      setWeightHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Load both profile and weight history concurrently
    Promise.all([
      loadProfile(user.id),
      loadWeightHistory(user.id),
    ]).then(([profileRes, weightRes]) => {
      if (profileRes.ok && profileRes.data) {
        if (profileRes.data.profile) setProfile(profileRes.data.profile);
        if (profileRes.data.goals) setGoals(profileRes.data.goals);
      }
      if (weightRes.ok && weightRes.data) {
        setWeightHistory(weightRes.data);
      }
      setIsLoading(false);
    });
  }, [user]);

  const updateProfileAndGoals = async (newProfile: CalcParams, newGoals: Macros): Promise<boolean> => {
    if (!user) return false;
    const res = await saveProfileAndGoals(user.id, newProfile, newGoals);
    if (res.ok) {
      setProfile(newProfile);
      setGoals(newGoals);
      
      // Reload weight history as saving profile might insert an entry automatically
      const weightRes = await loadWeightHistory(user.id);
      if (weightRes.ok && weightRes.data) {
        setWeightHistory(weightRes.data);
      }
      return true;
    }
    return false;
  };

  const logNewWeight = async (weight: number, dateStr: string): Promise<boolean> => {
    if (!user) return false;
    const res = await logWeight(user.id, weight, dateStr);
    if (res.ok) {
      const weightRes = await loadWeightHistory(user.id);
      if (weightRes.ok && weightRes.data) {
        setWeightHistory(weightRes.data);
      }
      return true;
    }
    return false;
  };

  return (
    <ProfileContext.Provider value={{ profile, goals, weightHistory, isLoading, updateProfileAndGoals, logNewWeight }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
