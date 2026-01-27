import {
  getAppSetting,
  removeAppSetting,
  setAppSetting,
} from "@/database/operations";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { useCopilot } from "react-native-copilot";

const TUTORIAL_COMPLETED_KEY = "tutorial_completed";

const TUTORIAL_STEPS = [
  {
    text: "Welcome! This is your health dashboard where you can track your daily progress.",
    order: 0,
    name: "dashboard_intro",
  },
  {
    text: "This card shows your daily calorie tracking. See how many calories you've consumed, burned, and have remaining.",
    order: 1,
    name: "calorie_card",
  },
  {
    text: "Track your weight progress over time. Your latest weight and trends are displayed here.",
    order: 2,
    name: "weight_progress",
  },
  {
    text: "Use the Food tab to log your meals and monitor your daily calorie intake.",
    order: 3,
    name: "food_tab",
  },
  {
    text: "Head to the Exercise tab to log your workouts and track calories burned.",
    order: 4,
    name: "exercise_tab",
  },
  {
    text: "Configure your health targets and preferences in the Settings tab. Tap the help icon to restart this tutorial anytime!",
    order: 5,
    name: "settings_tab",
  },
];

export const useCopilotTutorial = () => {
  const copilot = useCopilot();
  const [isTutorialCompleted, setIsTutorialCompleted] = useState(false);
  const [isCheckingTutorial, setIsCheckingTutorial] = useState(true);
  const [tutorialReady, setTutorialReady] = useState(false);
  const stepsRegistered = useRef(false);

  // Initialize copilot
  useEffect(() => {
    const initTutorial = () => {
      try {
        console.log("Initializing tutorial");
        // Check if tutorial has been completed from SQLite
        let completed = getAppSetting(TUTORIAL_COMPLETED_KEY);
        console.log("Tutorial completed status from DB:", completed);

        // If null (first time), initialize to false and treat as not completed
        if (completed === null) {
          console.log(
            "First time user - initializing tutorial setting to false",
          );
          setAppSetting(TUTORIAL_COMPLETED_KEY, "false");
          completed = "false";
        }

        const isCompleted = completed === "true";
        console.log("isCompleted:", isCompleted);
        setIsTutorialCompleted(isCompleted);

        // Register steps with copilot if available
        if (copilot && !stepsRegistered.current) {
          console.log("Registering tutorial steps with copilot");
          // Steps will be registered automatically by CopilotStep components
          stepsRegistered.current = true;
        }

        setTutorialReady(true);
        console.log("Tutorial initialized, completed:", isCompleted);
      } catch (error) {
        console.error("Error initializing tutorial:", error);
        setTutorialReady(true);
      } finally {
        setIsCheckingTutorial(false);
      }
    };

    // Delay initialization to ensure copilot is ready
    const timeout = setTimeout(initTutorial, 300);
    return () => clearTimeout(timeout);
  }, [copilot]);

  // Start the tutorial with error handling
  const startTutorial = useCallback(
    (scrollViewRef?: React.RefObject<ScrollView | null>) => {
      try {
        console.log("startTutorial called, copilot:", !!copilot);
        if (copilot && typeof copilot.start === "function") {
          console.log("Starting tutorial now");
          copilot.start();
        } else {
          console.warn("Copilot not ready", {
            copilot,
            hasStart: copilot?.start,
          });
        }
      } catch (error) {
        console.error("Error starting tutorial:", error);
      }
    },
    [copilot],
  );

  // Mark tutorial as completed
  const completeTutorial = useCallback(async () => {
    try {
      console.log("Completing tutorial...");
      setAppSetting(TUTORIAL_COMPLETED_KEY, "true");
      setIsTutorialCompleted(true);
      console.log("Tutorial marked as completed");
    } catch (error) {
      console.error("Error marking tutorial as completed:", error);
    }
  }, []);

  // Reset tutorial status
  const resetTutorial = useCallback(async () => {
    try {
      console.log("Resetting tutorial...");
      removeAppSetting(TUTORIAL_COMPLETED_KEY);
      // Reset the ref so tutorial can start again
      stepsRegistered.current = false;
      setIsTutorialCompleted(false);
      setTutorialReady(true);
      console.log("Tutorial reset successfully");
    } catch (error) {
      console.error("Error resetting tutorial:", error);
    }
  }, []);

  return {
    startTutorial,
    completeTutorial,
    resetTutorial,
    isTutorialCompleted,
    isCheckingTutorial,
    tutorialReady,
  };
};
