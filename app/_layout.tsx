import { CopilotContextProvider } from "@/context/copilot-context";
import {
  OnboardingProvider,
  useOnboarding,
} from "@/context/onboarding-context";
import { ToastProvider } from "@/context/toast-context";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ComponentType, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { initDatabase } from "../database/init";
import i18next from "../i18n";
import "./index.css";

// CodePush wrapper - returns identity function if native module not available
// eslint-disable-next-line @typescript-eslint/no-require-imports
const codePushModule = require("@revopush/react-native-code-push");
const codePush: <T extends ComponentType<object>>(component: T) => T =
  typeof codePushModule === "function"
    ? codePushModule
    : (component: ComponentType<object>) => component;

Sentry.init({
  dsn: "https://dbdd398c56c4a1ed5fe33d520206907b@o4510388552204288.ingest.us.sentry.io/4510762955767808",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutContent() {
  const { hasCompletedOnboarding, isLoading } = useOnboarding();

  if (isLoading) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-950">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="personal-target" options={{ presentation: "card" }} />
      <Stack.Screen name="about" options={{ presentation: "card" }} />
      <Stack.Screen name="personal-data" options={{ presentation: "card" }} />
      <Stack.Screen
        name="calorie-calculator"
        options={{ presentation: "card" }}
      />

      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  );
}

function RootLayout() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setDbInitialized(true))
      .catch((error) => {
        console.error("Failed to initialize database:", error);
        Sentry.captureException(error);
      });
  }, []);

  if (!dbInitialized) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-950">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18next}>
      <ToastProvider>
        <OnboardingProvider>
          <CopilotContextProvider>
            <ThemeProvider value={DarkTheme}>
              <RootLayoutContent />
              <StatusBar style="light" />
            </ThemeProvider>
          </CopilotContextProvider>
        </OnboardingProvider>
      </ToastProvider>
    </I18nextProvider>
  );
}

export default Sentry.wrap(codePush(RootLayout));
