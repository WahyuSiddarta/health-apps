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
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
}) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already completed onboarding
    const checkOnboarding = async () => {
      try {
        const userProfile = getUserProfile();
        console.log("User profile check:", userProfile);
        if (userProfile) {
          setHasCompletedOnboarding(true);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Call immediately
    checkOnboarding();

    // Safety timeout in case something hangs
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

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
