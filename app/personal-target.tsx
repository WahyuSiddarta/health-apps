import { ScreenWrapper } from "@/components/screen-wrapper";
import { InputField } from "@/components/ui/input-field";
import { useToast } from "@/context/toast-context";
import {
  getUserTarget,
  initializeUserTarget,
  updatePersonalBodyMeasurementTarget,
  updatePersonalExerciseTarget,
  updatePersonalNutritionTarget,
  UserTarget,
} from "@/database/operations";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      let data = getUserTarget();
      if (!data) {
        initializeUserTarget();
        data = getUserTarget();
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
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to load targets", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    try {
      const userId = 1; // Default user ID

      // Update Nutrition
      updatePersonalNutritionTarget(
        userId,
        Number(nutrition.caloric) || 0,
        Number(nutrition.protein) || 0,
        Number(nutrition.carbs) || 0,
        Number(nutrition.fat) || 0,
        Number(nutrition.sugar) || 0
      );

      // Update Body Measurements
      updatePersonalBodyMeasurementTarget(
        userId,
        Number(body.weight) || 0,
        Number(body.viceralFat) || 0,
        Number(body.fatPercentage) || 0
      );

      // Update Exercise
      updatePersonalExerciseTarget(
        userId,
        Number(exercise.minutes) || 0,
        Number(exercise.sessions) || 0,
        Number(exercise.caloric) || 0,
        Number(exercise.weightLiftingSessions) || 0,
        Number(exercise.cardioMinutes) || 0
      );

      showToast("Targets updated successfully", "success");
      router.back();
    } catch (error) {
      console.error(error);
      showToast("Failed to update targets", "error");
    }
  };

  if (loading) {
    return (
      <ScreenWrapper title="Personal Targets">
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Personal Targets" showBackButton>
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="mb-4 text-xl font-bold text-white">
            Nutrition Targets
          </Text>
          <View className="gap-4">
            <InputField
              label="Daily Calories (kcal)"
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
                  label="Protein (g)"
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
                  label="Carbs (g)"
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
                  label="Fat (g)"
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
                  label="Sugar (g)"
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
            Body Measurements
          </Text>
          <View className="gap-4">
            <InputField
              label="Target Body Weight (kg)"
              value={body.weight}
              onChangeText={(text) => setBody({ ...body, weight: text })}
              keyboardType="numeric"
              placeholder="0"
            />
            <View className="flex-row gap-4">
              <View className="flex-1">
                <InputField
                  label="Visceral Fat"
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
                  label="Body Fat (%)"
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

        <View className="mb-20">
          <Text className="mb-4 text-xl font-bold text-white">
            Exercise Targets (Weekly)
          </Text>
          <View className="gap-4">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <InputField
                  label="Minutes"
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
                  label="Sessions"
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
              label="Calories Burned (kcal)"
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
                  label="Weight Lifting Sessions"
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
                  label="Cardio Minutes"
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
          <Text className="text-lg font-bold text-black">Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
