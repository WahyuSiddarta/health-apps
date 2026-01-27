import { useCopilotTutorial } from "@/hooks/use-copilot-tutorial";
import React, { ReactNode, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  CopilotProvider,
  TooltipProps,
  useCopilot,
} from "react-native-copilot";

interface CopilotContextProviderProps {
  children: ReactNode;
}

export const CopilotContextProvider: React.FC<CopilotContextProviderProps> = ({
  children,
}) => {
  useEffect(() => {
    console.log("CopilotProvider initialized and mounted");
  }, []);

  return (
    <CopilotProvider
      tooltipComponent={CustomTooltip}
      tooltipStyle={{
        backgroundColor: "transparent",
      }}
      stepNumberComponent={() => null}
      stopOnOutsideClick={true}
      androidStatusBarVisible={true}
      backdropColor="rgba(0, 0, 0, 0.7)"
      overlay="svg"
      arrowColor="#1f2937"
      verticalOffset={-50}
    >
      {children}
    </CopilotProvider>
  );
};

// Custom Tooltip Component - uses useCopilot hook for navigation
const CustomTooltip: React.FC<TooltipProps> = () => {
  const { goToNext, goToPrev, stop, currentStep, isFirstStep, isLastStep } =
    useCopilot();
  const { completeTutorial } = useCopilotTutorial();

  const onNext = async () => {
    console.log("Next pressed, calling goToNext");
    try {
      await goToNext();
      console.log("goToNext completed");
    } catch (error) {
      console.error("goToNext error:", error);
    }
  };

  const onPrev = async () => {
    console.log("Prev pressed, calling goToPrev");
    try {
      await goToPrev();
      console.log("goToPrev completed");
    } catch (error) {
      console.error("goToPrev error:", error);
    }
  };

  const onStop = async () => {
    console.log("Stop pressed, calling stop");
    try {
      await completeTutorial();
      await stop();
      console.log("stop and completeTutorial completed");
    } catch (error) {
      console.error("stop error:", error);
    }
  };

  return (
    <View style={styles.tooltipContainer}>
      <Text style={styles.tooltipText}>{currentStep?.text}</Text>
      <View style={styles.buttonContainer}>
        {!isFirstStep && (
          <Pressable
            onPress={onPrev}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Previous</Text>
          </Pressable>
        )}
        {!isLastStep ? (
          <Pressable
            onPress={onNext}
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onStop}
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Finish</Text>
          </Pressable>
        )}
      </View>
      <Pressable
        onPress={onStop}
        style={({ pressed }) => [
          styles.skipButton,
          pressed && { opacity: 0.6 },
        ]}
      >
        <Text style={styles.skipText}>Skip Tutorial</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    maxWidth: 300,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#374151",
  },
  buttonPressed: {
    backgroundColor: "#4b5563",
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
  },
  primaryButtonPressed: {
    backgroundColor: "#2563eb",
  },
  buttonText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "500",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  skipButton: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 8,
  },
  skipText: {
    color: "#6b7280",
    fontSize: 12,
  },
});

export default CopilotContextProvider;
