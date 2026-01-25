import { useCopilotTutorial } from "@/hooks/use-copilot-tutorial";
import React, { useEffect } from "react";
import { useCopilot } from "react-native-copilot";

interface OnboardingTutorialProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  isVisible,
  onComplete,
}) => {
  const copilot = useCopilot();
  const { completeTutorial } = useCopilotTutorial();

  useEffect(() => {
    if (isVisible) {
      // Start tutorial after a brief delay to ensure all components are rendered
      const timer = setTimeout(() => {
        copilot.start();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, copilot]);

  const handleTutorialComplete = async () => {
    await completeTutorial();
    onComplete?.();
  };

  if (!isVisible) return null;

  return null; // The tutorial steps are defined separately in the app
};
