import { getUserProfile } from "@/database/operations";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

interface OnboardingProviderProps {
  children: ReactNode;
  dbReady?: boolean;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
  dbReady = false,
}) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for database to be ready before checking onboarding status
    if (!dbReady) {
      console.log("Database not ready yet, skipping onboarding check");
      return;
    }

    // Check if user has already completed onboarding
    const checkOnboarding = async () => {
      try {
        const userProfile = getUserProfile();
        console.log("User profile check:", userProfile);
        if (userProfile) {
          console.log("User profile exists, marking onboarding as completed");
          setHasCompletedOnboarding(true);
        } else {
          console.log(
            "No user profile found, marking onboarding as not completed",
          );
          setHasCompletedOnboarding(false);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setHasCompletedOnboarding(false);
      } finally {
        console.log("Onboarding check complete, setting isLoading to false");
        setIsLoading(false);
      }
    };

    // Call immediately once db is ready
    checkOnboarding();

    // Safety timeout in case something hangs
    const timeout = setTimeout(() => {
      console.log("Onboarding check timeout, forcing isLoading to false");
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [dbReady]);

  const handleSetHasCompletedOnboarding = (value: boolean) => {
    console.log("Setting onboarding completed to:", value);
    setHasCompletedOnboarding(value);
  };

  const handleResetOnboarding = () => {
    console.log("Resetting onboarding");
    setHasCompletedOnboarding(false);
  };

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        isLoading,
        setHasCompletedOnboarding: handleSetHasCompletedOnboarding,
        resetOnboarding: handleResetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
};
