
import { useState, useEffect, useRef, useCallback } from "react";
import { Profile } from "@/types/profile";
import { useProfileFetch } from "./useProfileFetch";
import { useProfileSave } from "./useProfileSave";

export const useProfileData = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number>(0);
  const originalProfileRef = useRef<Profile | null>(null);

  const setOriginalProfile = useCallback((newProfile: Profile) => {
    originalProfileRef.current = newProfile;
  }, []);

  const { isLoading, fetchProfile } = useProfileFetch(setProfile, setOriginalProfile);
  const { isSaving, saveProfile } = useProfileSave(profile, setOriginalProfile, setHasChanges, setLastSavedTime);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const checkForChanges = useCallback((updatedProfile: Profile) => {
    if (!originalProfileRef.current) return false;
    
    const hasChanged = JSON.stringify(updatedProfile) !== JSON.stringify(originalProfileRef.current);
    setHasChanges(hasChanged);
    return hasChanged;
  }, []);

  return {
    profile,
    setProfile,
    isLoading,
    isSaving,
    hasChanges,
    lastSavedTime,
    checkForChanges,
    saveProfile
  };
};
