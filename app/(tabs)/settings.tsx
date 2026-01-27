import { ScreenWrapper } from "@/components/screen-wrapper";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useOnboarding } from "@/context/onboarding-context";
import { resetAllData } from "@/database/operations";
import { useCopilotTutorial } from "@/hooks/use-copilot-tutorial";
import {
  addBreadcrumb,
  captureException,
  captureMessage,
} from "@/utils/error-handler";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { resetTutorial } = useCopilotTutorial();
  const { resetOnboarding } = useOnboarding();
  const [isResetVisible, setIsResetVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleResetData = () => {
    setIsResetVisible(true);
  };

  const handleConfirmReset = () => {
    setIsDeleting(true);
    addBreadcrumb("User initiated full data reset", {
      category: "user-action",
    });
    try {
      resetAllData();
      resetTutorial();
      resetOnboarding();
      captureMessage("All data reset successfully", {
        level: "info",
        category: "data-operation",
      });
      setIsResetVisible(false);
      setIsDeleting(false);
      // Navigate to onboarding screen
      router.replace("/onboarding");
    } catch (error) {
      captureException(error as Error, {
        category: "data-operation",
        severity: "error",
        extra: { operation: "resetAllData" },
      });
      setIsDeleting(false);
      console.error("Failed to reset data:", error);
    }
  };

  return (
    <ScreenWrapper title={t("pages.settings.title")}>
      <View className="flex-1 p-4">
        <View className="mb-4 overflow-hidden bg-neutral-900 rounded-xl">
          <View className="flex-row items-center justify-between p-4 border-b bg-neutral-900 border-neutral-800">
            <View className="flex-row items-center gap-3">
              <View className="items-center justify-center w-8 h-8 rounded-full bg-blue-500/20">
                <Ionicons name="language" size={18} color="#3b82f6" />
              </View>
              <Text className="font-medium text-white">
                {t("pages.settings.language")}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => changeLanguage("en")}>
                <Text
                  className={`font-medium ${
                    i18n.language === "en" ? "text-blue-500" : "text-white"
                  }`}
                >
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => changeLanguage("id")}>
                <Text
                  className={`font-medium ${
                    i18n.language === "id" ? "text-blue-500" : "text-white"
                  }`}
                >
                  ID
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="flex-1">
          <View className="overflow-hidden bg-neutral-900 rounded-xl">
            <TouchableOpacity
              onPress={() => router.push("/personal-target")}
              className="flex-row items-center justify-between p-4 border-b bg-neutral-900 border-neutral-800"
            >
              <View className="flex-row items-center gap-3">
                <View className="items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
                  <Ionicons name="locate" size={18} color="#10b981" />
                </View>
                <Text className="font-medium text-white">
                  {t("pages.settings.personalTargets")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#525252" />
            </TouchableOpacity>
          </View>

          <View className="mt-4 overflow-hidden bg-neutral-900 rounded-xl">
            <TouchableOpacity
              onPress={() => router.push("/about")}
              className="flex-row items-center justify-between p-4 border-b bg-neutral-900 border-neutral-800"
            >
              <View className="flex-row items-center gap-3">
                <View className="items-center justify-center w-8 h-8 rounded-full bg-blue-500/20">
                  <Ionicons
                    name="information-circle"
                    size={18}
                    color="#3b82f6"
                  />
                </View>
                <Text className="font-medium text-white">
                  {t("pages.settings.aboutUs")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#525252" />
            </TouchableOpacity>
          </View>

          <View className="mt-4 overflow-hidden bg-neutral-900 rounded-xl">
            <TouchableOpacity
              onPress={handleResetData}
              className="flex-row items-center justify-between p-4 border-b bg-neutral-900 border-neutral-800"
            >
              <View className="flex-row items-center gap-3">
                <View className="items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
                  <Ionicons name="trash" size={18} color="#ef4444" />
                </View>
                <Text className="font-medium text-red-500">
                  {t("pages.settings.resetAllData")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#525252" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <BottomSheet
        visible={isResetVisible}
        onClose={() => !isDeleting && setIsResetVisible(false)}
        title={t("pages.settings.resetConfirmationTitle")}
      >
        <View className="mb-6">
          <Text className="mb-4 text-neutral-300">
            {t("pages.settings.resetConfirmationMessage")}
          </Text>
        </View>

        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => setIsResetVisible(false)}
            disabled={isDeleting}
            className="items-center flex-1 p-3 bg-neutral-800 rounded-xl"
          >
            <Text className="font-bold text-white">
              {t("pages.settings.cancel")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirmReset}
            disabled={isDeleting}
            className="items-center flex-1 p-3 bg-red-600 rounded-xl active:bg-red-700"
          >
            <Text className="font-bold text-white">
              {isDeleting
                ? t("pages.settings.deleting")
                : t("pages.settings.delete")}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </ScreenWrapper>
  );
}
