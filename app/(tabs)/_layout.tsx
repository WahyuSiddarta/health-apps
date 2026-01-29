import { router, Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useOnboarding } from "@/context/onboarding-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { hasCompletedOnboarding, isLoading } = useOnboarding();

  // Prevent tabs from rendering if onboarding is not complete
  if (isLoading || !hasCompletedOnboarding) {
    setTimeout(() => {
      router.replace("/onboarding");
    }, 300);
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#10b981",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="exercise"
        options={{
          title: t("pages.exercise.title"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="figure.run" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: t("pages.food.title"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="fork.knife" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t("pages.dashboard.title"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="weight"
        options={{
          title: t("pages.weight.title"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="scalemass.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("pages.settings.title"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gear" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
