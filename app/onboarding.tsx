import { useOnboarding } from "@/context/onboarding-context";
import { createUserProfile, saveUserTargets } from "@/database/operations";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  ACTIVITY_LEVELS,
  adjustCalories,
  calculateBMR,
  calculateTDEE,
  type ActivityLevel,
} from "@/utils/calorie-calculator";
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
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">("");
  const [goal, setGoal] = useState<
    "weight_loss" | "weight_gain" | "maintain" | ""
  >("");

  const steps = [
    {
      title: t("pages.onboarding.welcome"),
      subtitle: t("pages.onboarding.welcomeSubtitle"),
      content: (
        <View className="gap-6">
          <View>
            <Text className="text-lg text-center text-gray-300">
              {t("pages.onboarding.welcomeDescription")}
            </Text>
          </View>
          <View>
            <Text className="mb-3 text-sm font-semibold text-gray-400">
              {t("pages.onboarding.selectLanguage")}
            </Text>
            <View className="gap-2">
              {(["en", "id"] as const).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => i18n.changeLanguage(lang)}
                  className={`rounded-lg border-2 px-4 py-2 ${
                    i18n.language === lang
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-gray-600 bg-gray-900"
                  }`}
                >
                  <Text
                    className={`text-center capitalize ${
                      i18n.language === lang
                        ? "text-emerald-500"
                        : "text-gray-300"
                    }`}
                  >
                    {lang === "en"
                      ? t("pages.onboarding.english")
                      : t("pages.onboarding.indonesian")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
      title: t("pages.onboarding.personalInfo"),
      subtitle: t("pages.onboarding.personalInfoSubtitle"),
      content: (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Age Input */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-300">
              {t("pages.onboarding.age")}
            </Text>
            <TextInput
              placeholder={t("pages.onboarding.agePlaceholder")}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              className="px-4 py-3 text-white placeholder-gray-500 bg-gray-900 border border-gray-600 rounded-lg"
              placeholderTextColor="#6b7280"
            />
          </View>

          {/* Gender Selection */}
          <View className="gap-2 mt-3">
            <Text className="text-sm font-semibold text-gray-300">
              {t("pages.onboarding.gender")}
            </Text>
            <View className="gap-2">
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
          </View>

          {/* Height Input */}
          <View className="gap-2 mt-3">
            <Text className="text-sm font-semibold text-gray-300">
              {t("pages.onboarding.height")}
            </Text>
            <TextInput
              placeholder={t("pages.onboarding.heightPlaceholder")}
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              className="px-4 py-3 text-white placeholder-gray-500 bg-gray-900 border border-gray-600 rounded-lg"
              placeholderTextColor="#6b7280"
            />
          </View>

          {/* Weight Input */}
          <View className="gap-2 mt-3">
            <Text className="text-sm font-semibold text-gray-300">
              {t("pages.onboarding.weight")}
            </Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              className="px-4 py-3 text-white placeholder-gray-500 bg-gray-900 border border-gray-600 rounded-lg"
              placeholderTextColor="#6b7280"
            />
          </View>

          {/* BMR Display */}
          {age &&
            gender &&
            height &&
            weight &&
            !isNaN(Number(age)) &&
            !isNaN(Number(height)) &&
            !isNaN(Number(weight)) &&
            Number(age) > 0 &&
            Number(height) > 0 &&
            Number(weight) > 0 && (
              <View className="gap-2 p-4 mt-6 border rounded-lg bg-emerald-500/10 border-emerald-500">
                <Text className="text-sm font-semibold text-emerald-400">
                  {t("pages.onboarding.basalMetabolicRate")}
                </Text>
                <Text className="text-3xl font-bold text-emerald-500">
                  {Math.round(
                    calculateBMR({
                      sex: gender as "male" | "female",
                      weightKg: Number(weight),
                      heightCm: Number(height),
                      age: Number(age),
                    }),
                  )}
                  <Text className="text-lg"> kcal/day</Text>
                </Text>
                <Text className="mt-2 text-xs text-emerald-300">
                  {t("pages.onboarding.bmrDescription")}
                </Text>
              </View>
            )}
        </ScrollView>
      ),
    },
    {
      title: t("pages.onboarding.activityLevel"),
      subtitle: t("pages.onboarding.selectYourActivityLevel"),
      content: (
        <ScrollView showsVerticalScrollIndicator={false} className="gap-6">
          {/* Activity Level Selection */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-300">
              {t("pages.onboarding.activityLevel")}
            </Text>
            <View className="gap-2">
              {(
                [
                  {
                    value: "sedentary" as ActivityLevel,
                    label: t("pages.onboarding.sedentary"),
                    desc: t("pages.onboarding.sedentaryDesc"),
                  },
                  {
                    value: "lightly_active" as ActivityLevel,
                    label: t("pages.onboarding.lightlyActive"),
                    desc: t("pages.onboarding.lightlyActiveDesc"),
                  },
                  {
                    value: "moderately_active" as ActivityLevel,
                    label: t("pages.onboarding.moderatelyActive"),
                    desc: t("pages.onboarding.moderatelyActiveDesc"),
                  },
                  {
                    value: "very_active" as ActivityLevel,
                    label: t("pages.onboarding.veryActive"),
                    desc: t("pages.onboarding.veryActiveDesc"),
                  },
                  {
                    value: "extra_active" as ActivityLevel,
                    label: t("pages.onboarding.extraActive"),
                    desc: t("pages.onboarding.extraActiveDesc"),
                  },
                ] as const
              ).map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setActivityLevel(option.value)}
                  className={`rounded-lg border-2 px-4 py-3 ${
                    activityLevel === option.value
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-gray-600 bg-gray-900"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      activityLevel === option.value
                        ? "text-emerald-500"
                        : "text-gray-300"
                    }`}
                  >
                    {option.label}
                  </Text>
                  <Text
                    className={`text-sm mt-1 ${
                      activityLevel === option.value
                        ? "text-emerald-400"
                        : "text-gray-400"
                    }`}
                  >
                    {option.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Goal Selection */}
          <View className="gap-2 mt-3">
            <Text className="text-sm font-semibold text-gray-300">
              {t("pages.onboarding.goal")}
            </Text>
            <View className="gap-2">
              {(
                [
                  {
                    value: "weight_loss",
                    label: t("pages.onboarding.weightLoss"),
                  },
                  {
                    value: "weight_gain",
                    label: t("pages.onboarding.weightGain"),
                  },
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
                      goal === option.value
                        ? "text-emerald-500"
                        : "text-gray-300"
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Calorie Display */}
          {activityLevel &&
            goal &&
            age &&
            gender &&
            height &&
            weight &&
            !isNaN(Number(age)) &&
            !isNaN(Number(height)) &&
            !isNaN(Number(weight)) &&
            Number(age) > 0 &&
            Number(height) > 0 &&
            Number(weight) > 0 &&
            (() => {
              const bmr = calculateBMR({
                sex: gender as "male" | "female",
                weightKg: Number(weight),
                heightCm: Number(height),
                age: Number(age),
              });
              const activityMultiplier = ACTIVITY_LEVELS[activityLevel];
              const tdee = calculateTDEE(bmr, activityMultiplier);
              let goalType: "maintain" | "cut" | "bulk" = "maintain";
              if (goal === "weight_loss") goalType = "cut";
              if (goal === "weight_gain") goalType = "bulk";
              const dailyCalories = adjustCalories(tdee, goalType, 500);

              return (
                <View className="gap-3 mt-6">
                  <View className="gap-2 p-4 border border-blue-500 rounded-lg bg-blue-500/10">
                    <Text className="text-sm font-semibold text-blue-400">
                      {t("pages.onboarding.dailyCaloriesWithActivity")}
                    </Text>
                    <Text className="text-3xl font-bold text-blue-500">
                      {Math.round(tdee)}
                      <Text className="text-lg"> kcal/day</Text>
                    </Text>
                    <Text className="mt-2 text-xs text-blue-300">
                      {t("pages.onboarding.caloriesWithActivityDesc")}
                    </Text>
                  </View>

                  <View className="gap-2 p-4 border rounded-lg bg-emerald-500/10 border-emerald-500">
                    <Text className="text-sm font-semibold text-emerald-400">
                      {t("pages.onboarding.targetDailyCalories")}
                    </Text>
                    <Text className="text-3xl font-bold text-emerald-500">
                      {Math.round(dailyCalories)}
                      <Text className="text-lg"> kcal/day</Text>
                    </Text>
                    <Text className="mt-2 text-xs text-emerald-300">
                      {goal === "weight_loss"
                        ? t("pages.onboarding.targetCaloriesLossDesc")
                        : goal === "weight_gain"
                          ? t("pages.onboarding.targetCaloriesGainDesc")
                          : t("pages.onboarding.targetCaloriesMaintainDesc")}
                    </Text>
                  </View>
                </View>
              );
            })()}
        </ScrollView>
      ),
    },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
      case 1:
        return true;
      case 2:
        return (
          age.trim().length > 0 &&
          !isNaN(Number(age)) &&
          Number(age) > 0 &&
          gender !== "" &&
          height.trim().length > 0 &&
          !isNaN(Number(height)) &&
          Number(height) > 0 &&
          weight.trim().length > 0 &&
          !isNaN(Number(weight)) &&
          Number(weight) > 0
        );
      case 3:
        return activityLevel !== "" && goal !== "";
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
    if (
      !name ||
      !age ||
      !gender ||
      !height ||
      !weight ||
      !activityLevel ||
      !goal
    ) {
      Alert.alert(
        t("pages.onboarding.missingInformation"),
        t("pages.onboarding.fillAllFields"),
      );
      return;
    }

    setLoading(true);
    try {
      // Create user profile
      const userId = createUserProfile(
        name,
        Number(age),
        gender,
        Number(height),
        goal,
      );
      console.log("Onboarding - Created user profile with userId:", userId);

      // Calculate BMR and TDEE
      const bmr = calculateBMR({
        sex: gender as "male" | "female",
        weightKg: Number(weight),
        heightCm: Number(height),
        age: Number(age),
      });

      const activityMultiplier = ACTIVITY_LEVELS[activityLevel];
      const tdee = calculateTDEE(bmr, activityMultiplier);

      // Map goal to calorie adjustment
      let goalType: "maintain" | "cut" | "bulk" = "maintain";
      if (goal === "weight_loss") goalType = "cut";
      if (goal === "weight_gain") goalType = "bulk";

      const dailyCalories = adjustCalories(tdee, goalType, 500);

      // Save targets with calculated calories using the newly created user_id
      if (userId) {
        const targetsSaved = saveUserTargets(userId, {
          nutrition_caloric: Math.round(dailyCalories),
          nutrition_protein: Math.round((dailyCalories * 0.3) / 4), // 30% protein
          nutrition_carbohydrate: Math.round((dailyCalories * 0.45) / 4), // 45% carbs
          nutrition_fat: Math.round((dailyCalories * 0.25) / 9), // 25% fat
          nutrition_sugar: gender === "female" ? 25 : 36, // Women: 25g, Men: 36g
          weekly_exercise_minutes: 150,
          weekly_exercise_sessions: 5,
          weekly_exercise_caloric: Math.round(tdee * 0.2 * 7),
        });
        console.log("Onboarding - Saved user targets:", targetsSaved);
      }

      setHasCompletedOnboarding(true);
      console.log("Navigating to main app layout");
      router.replace("/(tabs)");
      // The navigation will automatically switch to (tabs) through RootLayoutContent
      // when hasCompletedOnboarding state updates
      console.log("Onboarding completed, hasCompletedOnboarding set to true");
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
