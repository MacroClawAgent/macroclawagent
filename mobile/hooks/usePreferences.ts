import { useState, useEffect, useCallback } from 'react';
import type { UserPreferences, Allergy, Cuisine } from '@/types/preferences';
import { DEFAULT_PREFERENCES } from '@/types/preferences';
import { loadPreferences, savePreferences } from '@/services/preferencesService';

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  const refreshPreferences = useCallback(() => {
    loadPreferences().then(setPreferences);
  }, []);

  useEffect(() => {
    loadPreferences().then(prefs => {
      setPreferences(prefs);
      setLoading(false);
    });
  }, []);

  const updatePreference = useCallback(
    async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences(prev => {
        const updated = { ...prev, [key]: value };
        savePreferences(updated);
        return updated;
      });
    },
    [],
  );

  const toggleAllergy = useCallback((allergy: Allergy) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        allergies: prev.allergies.includes(allergy)
          ? prev.allergies.filter(a => a !== allergy)
          : [...prev.allergies, allergy],
      };
      savePreferences(updated);
      return updated;
    });
  }, []);

  const toggleCuisine = useCallback((cuisine: Cuisine) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        cuisines: prev.cuisines.includes(cuisine)
          ? prev.cuisines.filter(c => c !== cuisine)
          : [...prev.cuisines, cuisine],
      };
      savePreferences(updated);
      return updated;
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setPreferences(prev => {
      const updated = { ...prev, onboardingComplete: true };
      savePreferences(updated);
      return updated;
    });
  }, []);

  const hasAnyPreferences =
    preferences.dietaryRequirement !== 'none' ||
    preferences.allergies.length > 0 ||
    preferences.cuisines.length > 0 ||
    preferences.budget !== 'moderate' ||
    preferences.cookingTime !== 'normal' ||
    preferences.dislikedIngredients.length > 0;

  return {
    preferences,
    loading,
    hasAnyPreferences,
    updatePreference,
    toggleAllergy,
    toggleCuisine,
    completeOnboarding,
    refreshPreferences,
  };
};
