import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { useCopilot } from "react-native-copilot";

const TUTORIAL_COMPLETED_KEY = "copilot_tutorial_completed";

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
    const initTutorial = async () => {
      try {
        console.log("Initializing tutorial");
        // Always show tutorial in development
        setIsTutorialCompleted(false);

        // Register steps with copilot if available
        if (copilot && !stepsRegistered.current) {
          console.log("Registering tutorial steps with copilot");
          // Steps will be registered automatically by CopilotStep components
          stepsRegistered.current = true;
        }

        setTutorialReady(true);
        console.log("Dev mode: Tutorial always shown");
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
          copilot.start(undefined, scrollViewRef?.current ?? undefined);
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
      await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, "true");
      setIsTutorialCompleted(true);
    } catch (error) {
      console.error("Error marking tutorial as completed:", error);
    }
  }, []);

  // Reset tutorial status
  const resetTutorial = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(TUTORIAL_COMPLETED_KEY);
      setIsTutorialCompleted(false);
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
