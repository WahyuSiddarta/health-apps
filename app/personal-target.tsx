import { ScreenWrapper } from "@/components/screen-wrapper";
import { InputField } from "@/components/ui/input-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/context/toast-context";
import {
  getUserProfile,
  getUserTarget,
  initializeUserTarget,
  updatePersonalBodyMeasurementTarget,
  updatePersonalExerciseTarget,
  updatePersonalNutritionTarget,
  updatePersonalWeightGoal,
  UserTarget,
} from "@/database/operations";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PersonalTargetScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(1);
  const [target, setTarget] = useState<UserTarget | null>(null);

  // Form State
  const [nutrition, setNutrition] = useState({
    caloric: "",
    protein: "",
    carbs: "",
    fat: "",
    sugar: "",
  });

  const [body, setBody] = useState({
    weight: "",
    viceralFat: "",
    fatPercentage: "",
  });

  const [exercise, setExercise] = useState({
    minutes: "",
    sessions: "",
    caloric: "",
    weightLiftingSessions: "",
    cardioMinutes: "",
  });

  const [weightGoal, setWeightGoal] = useState("weight_loss");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      // Get the current user profile to get the user_id
      const userProfile = getUserProfile();
      const currentUserId = userProfile?.user_id || 1;
      setUserId(currentUserId);

      let data = getUserTarget(currentUserId);
      if (!data) {
        initializeUserTarget(currentUserId);
        data = getUserTarget(currentUserId);
      }

      if (data) {
        setTarget(data);
        setNutrition({
          caloric: data.nutrition_caloric.toString(),
          protein: data.nutrition_protein.toString(),
          carbs: data.nutrition_carbohydrate.toString(),
          fat: data.nutrition_fat.toString(),
          sugar: (data.nutrition_sugar || 0).toString(),
        });
        setBody({
          weight: data.bodyweight.toString(),
          viceralFat: data.viceral_fat.toString(),
          fatPercentage: data.fat_percentage.toString(),
        });
        setExercise({
          minutes: data.weekly_exercise_minutes.toString(),
          sessions: data.weekly_exercise_sessions.toString(),
          caloric: data.weekly_exercise_caloric.toString(),
          weightLiftingSessions: data.weekly_weight_lifting_sessions.toString(),
          cardioMinutes: data.weekly_cardio_minutes.toString(),
        });
        setWeightGoal(data.weight_goal || "weight_loss");
      }
    } catch (error) {
      console.error(error);
      showToast(t("pages.personalTarget.failedLoadTargets"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    try {
      // Update Nutrition
      updatePersonalNutritionTarget(
        userId,
        Number(nutrition.caloric) || 0,
        Number(nutrition.protein) || 0,
        Number(nutrition.carbs) || 0,
        Number(nutrition.fat) || 0,
        Number(nutrition.sugar) || 0,
      );

      // Update Body Measurements
      updatePersonalBodyMeasurementTarget(
        userId,
        Number(body.weight) || 0,
        Number(body.viceralFat) || 0,
        Number(body.fatPercentage) || 0,
      );

      // Update Exercise
      updatePersonalExerciseTarget(
        userId,
        Number(exercise.minutes) || 0,
        Number(exercise.sessions) || 0,
        Number(exercise.caloric) || 0,
        Number(exercise.weightLiftingSessions) || 0,
        Number(exercise.cardioMinutes) || 0,
      );

      // Update Weight Goal
      updatePersonalWeightGoal(
        userId,
        weightGoal as "weight_loss" | "weight_gain" | "maintain",
      );

      showToast(t("pages.personalTarget.targetUpdatedSuccess"), "success");
      router.back();
    } catch (error) {
      console.error(error);
      showToast(t("pages.personalTarget.failedUpdateTargets"), "error");
    }
  };

  if (loading) {
    return (
      <ScreenWrapper title={t("pages.personalTarget.title")}>
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title={t("pages.personalTarget.title")} showBackButton>
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="mb-4 text-xl font-bold text-white">
            {t("pages.personalTarget.nutritionTargets")}
          </Text>
          <View className="gap-4">
            <InputField
              label={t("pages.personalTarget.dailyCalories")}
              value={nutrition.caloric}
              onChangeText={(text) =>
                setNutrition({ ...nutrition, caloric: text })
              }
              keyboardType="numeric"
              placeholder="0"
              useThousandSeparator
            />
            <View className="flex-row gap-4">
              <View className="flex-1">
                <InputField
                  label={t("pages.personalTarget.protein")}
                  value={nutrition.protein}
                  onChangeText={(text) =>
                    setNutrition({ ...nutrition, protein: text })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View className="flex-1">
                <InputField
                  label={t("pages.personalTarget.carbs")}
                  value={nutrition.carbs}
                  onChangeText={(text) =>
                    setNutrition({ ...nutrition, carbs: text })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <InputField
                  label={t("pages.personalTarget.fat")}
                  value={nutrition.fat}
                  onChangeText={(text) =>
                    setNutrition({ ...nutrition, fat: text })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View className="flex-1">
                <InputField
                  label={t("pages.personalTarget.sugar")}
                  value={nutrition.sugar}
                  onChangeText={(text) =>
                    setNutrition({ ...nutrition, sugar: text })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
          </View>
        </View>

        <View className="mb-8">
          <Text className="mb-4 text-xl font-bold text-white">
            {t("pages.personalTarget.bodyMeasurements")}
          </Text>
          <View className="gap-4">
            <InputField
              label={t("pages.personalTarget.targetBodyWeight")}
              value={body.weight}
              onChangeText={(text) => setBody({ ...body, weight: text })}
              keyboardType="numeric"
              placeholder="0"
            />
            <View className="flex-row gap-4">
              <View className="flex-1">
                <InputField
                  label={t("pages.personalTarget.visceralFat")}
                  value={body.viceralFat}
                  onChangeText={(text) =>
                    setBody({ ...body, viceralFat: text })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View className="flex-1">
                <InputField
                  label={t("pages.personalTarget.bodyFat")}
                  value={body.fatPercentage}
                  onChangeText={(text) =>
                    setBody({ ...body, fatPercentage: text })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
          </View>
        </View>

        <View className="mb-8">
          <SegmentedControl
            label={t("pages.personalTarget.weightGoal")}
            options={[
              t("pages.personalTarget.weightLoss"),
              t("pages.personalTarget.weightGain"),
              t("pages.personalTarget.maintain"),
            ]}
            value={
              weightGoal === "weight_loss"
                ? t("pages.personalTarget.weightLoss")
                : weightGoal === "weight_gain"
                  ? t("pages.personalTarget.weightGain")
                  : t("pages.personalTarget.maintain")
            }
            onChange={(displayValue) => {
              if (displayValue === t("pages.personalTarget.weightLoss")) {
                setWeightGoal("weight_loss");
              } else if (
                displayValue === t("pages.personalTarget.weightGain")
              ) {
                setWeightGoal("weight_gain");
              } else {
                setWeightGoal("maintain");
              }
            }}
          />
        </View>

        <View className="mb-20">
          <Text className="mb-4 text-xl font-bold text-white">
            {t("pages.personalTarget.exerciseTargets")}
          </Text>
          <View className="gap-4">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <InputField
                  label={t("pages.personalTarget.minutes")}
                  value={exercise.minutes}
                  onChangeText={(text) =>
                    setExercise({ ...exercise, minutes: text })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View className="flex-1">
                <InputField
                  label={t("pages.personalTarget.sessions")}
                  value={exercise.sessions}
                  onChangeText={(text) =>
                    setExercise({ ...exercise, sessions: text })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
            <InputField
              label={t("pages.personalTarget.caloriesBurned")}
              value={exercise.caloric}
              onChangeText={(text) =>
                setExercise({ ...exercise, caloric: text })
              }
              keyboardType="numeric"
              placeholder="0"
              useThousandSeparator
            />
            <View className="flex-row gap-4">
              <View className="flex-1">
                <InputField
                  label={t("pages.personalTarget.weightLiftingSessions")}
                  value={exercise.weightLiftingSessions}
                  onChangeText={(text) =>
                    setExercise({ ...exercise, weightLiftingSessions: text })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View className="flex-1">
                <InputField
                  label={t("pages.personalTarget.cardioMinutes")}
                  value={exercise.cardioMinutes}
                  onChangeText={(text) =>
                    setExercise({ ...exercise, cardioMinutes: text })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="p-4 border-t border-white/10 bg-black/50"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          onPress={handleSave}
          className="items-center justify-center p-4 rounded-xl bg-primary"
        >
          <Text className="text-lg font-bold text-white">
            {t("pages.personalTarget.saveChanges")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
