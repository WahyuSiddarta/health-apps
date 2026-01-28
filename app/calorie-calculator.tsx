import { ScreenWrapper } from "@/components/screen-wrapper";
import { InputField } from "@/components/ui/input-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { getUserProfile, getWeightLogs } from "@/database/operations";
import {
  ACTIVITY_LEVELS,
  adjustCalories,
  calculateBMR,
  calculateTDEE,
  type ActivityLevel,
} from "@/utils/calorie-calculator";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function CalorieCalculatorScreen() {
  const { t } = useTranslation();

  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | "">("");
  const [goal, setGoal] = useState<
    "weight_loss" | "weight_gain" | "maintain" | ""
  >("");

  useEffect(() => {
    try {
      const profile = getUserProfile();
      if (profile) {
        setAge(String(profile.age ?? ""));
        setGender(profile.gender ?? "");
        setHeight(String(profile.height_cm ?? ""));
        setGoal(profile.goal ?? "");
      }

      const weightLogs = getWeightLogs();
      if (weightLogs && weightLogs.length > 0) {
        setWeight(String(weightLogs[0].bodyweight ?? ""));
      }
    } catch (e) {
      // Fail silently; calculator remains usable with empty defaults
      console.warn("Failed to prefill calculator from DB", e);
    }
  }, []);
  const isInputsValid = () =>
    age.trim().length > 0 &&
    !isNaN(Number(age)) &&
    Number(age) > 0 &&
    gender !== "" &&
    height.trim().length > 0 &&
    !isNaN(Number(height)) &&
    Number(height) > 0 &&
    weight.trim().length > 0 &&
    !isNaN(Number(weight)) &&
    Number(weight) > 0 &&
    activityLevel !== "" &&
    goal !== "";

  const renderResults = () => {
    const valid = isInputsValid();

    let bmr: number | null = null;
    let tdee: number | null = null;
    let dailyCalories: number | null = null;

    if (valid) {
      bmr = calculateBMR({
        sex: gender as "male" | "female",
        weightKg: Number(weight),
        heightCm: Number(height),
        age: Number(age),
      });

      const activityMultiplier =
        ACTIVITY_LEVELS[activityLevel as ActivityLevel];
      tdee = calculateTDEE(bmr, activityMultiplier);

      let goalType: "maintain" | "cut" | "bulk" = "maintain";
      if (goal === "weight_loss") goalType = "cut";
      if (goal === "weight_gain") goalType = "bulk";
      dailyCalories = adjustCalories(tdee, goalType, 500);
    }

    return (
      <View className="gap-3 mt-4">
        <View className="gap-2 p-4 border rounded-lg bg-emerald-500/10 border-emerald-500">
          <Text className="text-sm font-semibold text-emerald-400">
            {t("pages.onboarding.basalMetabolicRate")}
          </Text>
          <Text
            className={`text-3xl font-bold ${valid ? "text-emerald-500" : "text-emerald-300"}`}
          >
            {valid && bmr !== null ? Math.round(bmr) : "—"}
            <Text className="text-lg"> kcal/day</Text>
          </Text>
          <Text className="mt-2 text-xs text-emerald-300">
            {t("pages.onboarding.bmrDescription")}
          </Text>
        </View>

        <View className="gap-2 p-4 border border-blue-500 rounded-lg bg-blue-500/10">
          <Text className="text-sm font-semibold text-blue-400">
            {t("pages.onboarding.dailyCaloriesWithActivity")}
          </Text>
          <Text
            className={`text-3xl font-bold ${valid ? "text-blue-500" : "text-blue-300"}`}
          >
            {valid && tdee !== null ? Math.round(tdee) : "—"}
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
          <Text
            className={`text-3xl font-bold ${valid ? "text-emerald-500" : "text-emerald-300"}`}
          >
            {valid && dailyCalories !== null ? Math.round(dailyCalories) : "—"}
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
  };

  return (
    <ScreenWrapper title={t("pages.settings.calorieCalculator")} showBackButton>
      <ScrollView className="flex-1" contentContainerClassName="p-3">
        {/* Inputs */}
        <View className="gap-4">
          {/* Row: Age + Gender */}
          <View className="flex-row gap-3">
            {/* Age */}
            <InputField
              className="flex-1"
              label={t("pages.onboarding.age")}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder={t("pages.onboarding.agePlaceholder")}
            />

            {/* Gender */}
            <View className="flex-1">
              <SegmentedControl
                label={t("pages.onboarding.gender")}
                options={[
                  t("pages.onboarding.male"),
                  t("pages.onboarding.female"),
                ]}
                value={
                  gender === "male"
                    ? t("pages.onboarding.male")
                    : gender === "female"
                      ? t("pages.onboarding.female")
                      : ""
                }
                onChange={(displayValue) => {
                  if (displayValue === t("pages.onboarding.male")) {
                    setGender("male");
                  } else if (displayValue === t("pages.onboarding.female")) {
                    setGender("female");
                  }
                }}
              />
            </View>
          </View>

          {/* Row: Height + Weight */}
          <View className="flex-row gap-3">
            {/* Height */}
            <InputField
              className="flex-1"
              label={t("pages.onboarding.height")}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder={t("pages.onboarding.heightPlaceholder")}
            />

            {/* Weight */}
            <InputField
              className="flex-1"
              label={t("pages.onboarding.weight")}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder={t("pages.onboarding.weightPlaceholder")}
            />
          </View>

          {/* Activity Level */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-300">
              {t("pages.onboarding.activityLevel")}
            </Text>
            {(() => {
              const activityOptions = [
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
              ] as const;

              const rows: Array<(typeof activityOptions)[number][]> = [];
              for (let i = 0; i < activityOptions.length; i += 2) {
                rows.push(activityOptions.slice(i, i + 2));
              }

              return (
                <View className="gap-2">
                  {rows.map((row, idx) => (
                    <View key={idx} className="flex-row gap-2">
                      {row.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => setActivityLevel(option.value)}
                          className={`flex-1 rounded-lg border-2 px-4 py-3 ${
                            activityLevel === option.value
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-neutral-600 bg-neutral-800"
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
                  ))}
                </View>
              );
            })()}
          </View>

          {/* Goal */}
          <SegmentedControl
            label={t("pages.onboarding.goal")}
            options={[
              t("pages.onboarding.weightLoss"),
              t("pages.onboarding.weightGain"),
              t("pages.onboarding.maintain"),
            ]}
            value={
              goal === "weight_loss"
                ? t("pages.onboarding.weightLoss")
                : goal === "weight_gain"
                  ? t("pages.onboarding.weightGain")
                  : goal === "maintain"
                    ? t("pages.onboarding.maintain")
                    : ""
            }
            onChange={(displayValue) => {
              if (displayValue === t("pages.onboarding.weightLoss")) {
                setGoal("weight_loss");
              } else if (displayValue === t("pages.onboarding.weightGain")) {
                setGoal("weight_gain");
              } else if (displayValue === t("pages.onboarding.maintain")) {
                setGoal("maintain");
              }
            }}
          />
        </View>

        {renderResults()}
      </ScrollView>
    </ScreenWrapper>
  );
}
