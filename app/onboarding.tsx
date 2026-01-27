import { useOnboarding } from "@/context/onboarding-context";
import { createUserProfile } from "@/database/operations";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const { setHasCompletedOnboarding } = useOnboarding();
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState<
    "weight_loss" | "weight_gain" | "maintain" | ""
  >("");

  const steps = [
    {
      title: t("pages.onboarding.selectLanguage"),
      subtitle: t("pages.onboarding.selectLanguageSubtitle"),
      content: (
        <View className="gap-3">
          {(["en", "id"] as const).map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => i18n.changeLanguage(lang)}
              className={`rounded-lg border-2 px-4 py-3 ${
                i18n.language === lang
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-gray-600 bg-gray-900"
              }`}
            >
              <Text
                className={`text-center capitalize ${
                  i18n.language === lang ? "text-emerald-500" : "text-gray-300"
                }`}
              >
                {lang === "en"
                  ? t("pages.onboarding.english")
                  : t("pages.onboarding.indonesian")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
    {
      title: t("pages.onboarding.welcome"),
      subtitle: t("pages.onboarding.welcomeSubtitle"),
      content: (
        <View className="items-center justify-center gap-6">
          <Text className="text-lg text-center text-gray-300">
            {t("pages.onboarding.welcomeDescription")}
          </Text>
        </View>
      ),
    },
    {
      title: t("pages.onboarding.name"),
      subtitle: t("pages.onboarding.nameSubtitle"),
      content: (
        <View className="gap-4">
          <TextInput
            placeholder={t("pages.onboarding.namePlaceholder")}
            value={name}
            onChangeText={setName}
            className="px-4 py-3 text-white placeholder-gray-500 bg-gray-900 border border-gray-600 rounded-lg"
            placeholderTextColor="#6b7280"
          />
        </View>
      ),
    },
    {
      title: t("pages.onboarding.age"),
      subtitle: t("pages.onboarding.ageSubtitle"),
      content: (
        <View className="gap-4">
          <TextInput
            placeholder={t("pages.onboarding.agePlaceholder")}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            className="px-4 py-3 text-white placeholder-gray-500 bg-gray-900 border border-gray-600 rounded-lg"
            placeholderTextColor="#6b7280"
          />
        </View>
      ),
    },
    {
      title: t("pages.onboarding.gender"),
      subtitle: t("pages.onboarding.genderSubtitle"),
      content: (
        <View className="gap-3">
          {(["male", "female"] as const).map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setGender(option)}
              className={`rounded-lg border-2 px-4 py-3 ${
                gender === option
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-gray-600 bg-gray-900"
              }`}
            >
              <Text
                className={`text-center capitalize ${
                  gender === option ? "text-emerald-500" : "text-gray-300"
                }`}
              >
                {t(`pages.onboarding.${option}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
    {
      title: t("pages.onboarding.height"),
      subtitle: t("pages.onboarding.heightSubtitle"),
      content: (
        <View className="gap-4">
          <TextInput
            placeholder={t("pages.onboarding.heightPlaceholder")}
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            className="px-4 py-3 text-white placeholder-gray-500 bg-gray-900 border border-gray-600 rounded-lg"
            placeholderTextColor="#6b7280"
          />
        </View>
      ),
    },
    {
      title: t("pages.onboarding.goal"),
      subtitle: t("pages.onboarding.goalSubtitle"),
      content: (
        <View className="gap-3">
          {(
            [
              { value: "weight_loss", label: t("pages.onboarding.weightLoss") },
              { value: "weight_gain", label: t("pages.onboarding.weightGain") },
              { value: "maintain", label: t("pages.onboarding.maintain") },
            ] as const
          ).map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setGoal(option.value)}
              className={`rounded-lg border-2 px-4 py-3 ${
                goal === option.value
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-gray-600 bg-gray-900"
              }`}
            >
              <Text
                className={`text-center ${
                  goal === option.value ? "text-emerald-500" : "text-gray-300"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ),
    },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
      case 1:
        return true;
      case 2:
        return name.trim().length > 0;
      case 3:
        return age.trim().length > 0 && !isNaN(Number(age)) && Number(age) > 0;
      case 4:
        return gender !== "";
      case 5:
        return (
          height.trim().length > 0 &&
          !isNaN(Number(height)) &&
          Number(height) > 0
        );
      case 6:
        return goal !== "";
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!name || !age || !gender || !height || !goal) {
      Alert.alert(
        t("pages.onboarding.missingInformation"),
        t("pages.onboarding.fillAllFields"),
      );
      return;
    }

    setLoading(true);
    try {
      createUserProfile(name, Number(age), gender, Number(height), goal);
      setHasCompletedOnboarding(true);
      // Navigate to home screen after a brief delay
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 200);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert(
        t("pages.onboarding.error"),
        t("pages.onboarding.failedSaveProfile"),
      );
      setLoading(false);
    }
  };

  const step = steps[currentStep];

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-8">
        <View className="mb-8">
          {/* Progress indicator */}
          <View className="flex-row gap-1 mb-4">
            {steps.map((_, index) => (
              <View
                key={index}
                className={`h-1 flex-1 rounded ${
                  index <= currentStep ? "bg-emerald-500" : "bg-gray-700"
                }`}
              />
            ))}
          </View>

          <Text className="text-3xl font-bold text-white">{step.title}</Text>
          <Text className="mt-2 text-gray-400">{step.subtitle}</Text>
        </View>

        <View className="flex-1 mb-12">{step.content}</View>

        {/* Navigation buttons */}
        <View className="gap-3">
          {currentStep === steps.length - 1 ? (
            <TouchableOpacity
              onPress={handleComplete}
              disabled={loading || !canProceed()}
              className={`rounded-lg px-4 py-4 ${
                loading || !canProceed() ? "bg-gray-700" : "bg-emerald-500"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-semibold text-center text-white">
                  {t("pages.onboarding.getStarted")}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              disabled={!canProceed()}
              className={`rounded-lg px-4 py-4 ${
                !canProceed() ? "bg-gray-700" : "bg-emerald-500"
              }`}
            >
              <Text className="font-semibold text-center text-white">
                {t("pages.onboarding.next")}
              </Text>
            </TouchableOpacity>
          )}

          {currentStep > 0 && (
            <TouchableOpacity
              onPress={handlePrevious}
              className="px-4 py-4 bg-gray-900 border border-gray-600 rounded-lg"
            >
              <Text className="font-semibold text-center text-gray-300">
                {t("pages.onboarding.back")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
