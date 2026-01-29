import { ScreenWrapper } from "@/components/screen-wrapper";
import { ThemedText } from "@/components/themed-text";
import {
  ExerciseRecord,
  FoodRecord,
  getExercises,
  getFood,
  getUserProfile,
  getUserTarget,
  getWeightLogs,
  UserTarget,
  WeightRecord,
} from "@/database/operations";
import { useCopilotTutorial } from "@/hooks/use-copilot-tutorial";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CopilotStep, walkthroughable } from "react-native-copilot";
import { PieChart } from "react-native-gifted-charts";

// Create walkthroughable components for CopilotStep
const WalkthroughableView = walkthroughable(View);

export default function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { startTutorial, isTutorialCompleted, tutorialReady } =
    useCopilotTutorial();
  const scrollViewRef = useRef<ScrollView>(null);
  const tutorialStartedRef = useRef(false);
  const [todayFood, setTodayFood] = useState<FoodRecord[]>([]);
  const [todayExercise, setTodayExercise] = useState<ExerciseRecord[]>([]);
  const [latestWeight, setLatestWeight] = useState<WeightRecord | null>(null);
  const [userTarget, setUserTarget] = useState<UserTarget | null>(null);

  const loadData = useCallback(() => {
    try {
      const now = new Date();
      const today = now.toISOString();

      const food = getFood({ date: today });
      setTodayFood(food || []);

      const exercise = getExercises({ date: today });
      setTodayExercise(exercise || []);

      const weightLogs = getWeightLogs();
      setLatestWeight(
        weightLogs && weightLogs.length > 0 ? weightLogs[0] : null,
      );

      // Get the current user profile to get the user_id, then fetch targets
      const userProfile = getUserProfile();

      if (userProfile) {
        const target = getUserTarget(userProfile.user_id);
        setUserTarget(target);
      } else {
        setUserTarget(null);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }, []);

  // Auto-start tutorial for first-time users (only once)
  useEffect(() => {
    if (tutorialReady && !isTutorialCompleted && !tutorialStartedRef.current) {
      console.log(
        "Starting tutorial: tutorialReady=",
        tutorialReady,
        "isTutorialCompleted=",
        isTutorialCompleted,
      );
      tutorialStartedRef.current = true;
      const timeout = setTimeout(() => {
        startTutorial(scrollViewRef);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [tutorialReady, isTutorialCompleted, startTutorial]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      // When screen comes into focus, check if tutorial was reset
      // and reset the ref to allow it to start again
      if (!isTutorialCompleted) {
        console.log(
          "Dashboard focused: tutorial not completed, resetting ref",
          "isTutorialCompleted=",
          isTutorialCompleted,
        );
        tutorialStartedRef.current = false;
      }
    }, [loadData, isTutorialCompleted]),
  );

  const caloriesConsumed = todayFood.reduce(
    (acc, curr) => acc + curr.caloric,
    0,
  );
  const caloriesBurned = todayExercise.reduce(
    (acc, curr) => acc + curr.caloric,
    0,
  );

  const calorieTarget = userTarget?.nutrition_caloric || 2000;
  const caloriesRemaining = calorieTarget - caloriesConsumed + caloriesBurned;

  const pieData = [
    {
      value: caloriesConsumed,
      color: "#ef4444",
      text: t("pages.dashboard.consumed"),
    },
    {
      value: Math.max(0, caloriesRemaining),
      color: "#10b981",
      text: t("pages.dashboard.remaining"),
    },
  ];

  return (
    <ScreenWrapper title={t("pages.dashboard.title")}>
      <ScrollView ref={scrollViewRef} className="flex-1 p-4">
        {/* Dashboard Header */}
        {/* DEV ONLY: Tutorial Test Button - Comment out for production */}
        {/* <View className="flex-row items-center justify-end mb-4">
          <View className="flex-row justify-end gap-2">
            <TouchableOpacity
              onPress={() => startTutorial(scrollViewRef)}
              className="px-3 py-2 ml-auto bg-blue-600 rounded-lg"
            >
              <Text className="text-xs font-medium text-white">
                {t("pages.dashboard.startTutorial")}
              </Text>
            </TouchableOpacity>
          </View>
        </View> */}
        {/* Calorie Summary Card */}
        <CopilotStep
          text={t("pages.dashboard.tutorialCalorieCard")}
          order={0}
          name="calorie_card"
        >
          <WalkthroughableView
            collapsable={false}
            style={{
              padding: 16,
              marginBottom: 16,
              backgroundColor: "#171717",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#262626",
            }}
          >
            <ThemedText type="subtitle" className="mb-4">
              {t("pages.dashboard.caloriesTitle")}
            </ThemedText>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-neutral-400">
                  {t("pages.dashboard.remaining")}
                </Text>
                <Text className="text-3xl font-bold text-white">
                  {Math.round(caloriesRemaining)}
                </Text>
                <Text className="mt-1 text-xs text-neutral-500">
                  {t("pages.dashboard.target")}: {calorieTarget}
                </Text>
              </View>
              <PieChart
                data={pieData}
                donut
                radius={60}
                innerRadius={45}
                centerLabelComponent={() => {
                  return (
                    <View className="items-center justify-center">
                      <Text className="text-lg font-bold text-white">
                        {Math.round(caloriesConsumed)}
                      </Text>
                      <Text className="text-xs text-neutral-500">
                        {t("pages.dashboard.eaten")}
                      </Text>
                    </View>
                  );
                }}
              />
            </View>
            <View className="flex-row justify-between mt-6">
              <View className="items-center">
                <Text className="text-lg font-bold text-emerald-500">
                  {Math.round(caloriesBurned)}
                </Text>
                <Text className="text-xs text-neutral-400">
                  {t("pages.dashboard.burned")}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-red-500">
                  {Math.round(caloriesConsumed)}
                </Text>
                <Text className="text-xs text-neutral-400">
                  {t("pages.dashboard.eaten")}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-blue-500">
                  {Math.round(
                    todayFood.reduce((acc, curr) => acc + curr.protein, 0),
                  )}
                  g
                </Text>
                <Text className="text-xs text-neutral-400">
                  {t("pages.dashboard.protein")}
                </Text>
              </View>
            </View>
          </WalkthroughableView>
        </CopilotStep>

        {/* Weight Card */}
        <CopilotStep
          text={t("pages.dashboard.tutorialWeightProgress")}
          order={1}
          name="weight_progress"
        >
          <WalkthroughableView
            collapsable={false}
            className="items-center justify-between p-4 mt-4 mb-4 border rounded-2xl border-neutral-700"
            style={{
              padding: 16,
              marginBottom: 16,
              backgroundColor: "#171717",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#262626",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View className="flex-1">
              <ThemedText type="subtitle" className="mb-1">
                {t("pages.dashboard.currentWeight")}
              </ThemedText>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-3xl font-bold text-white">
                  {latestWeight ? latestWeight.bodyweight : "--"}
                </Text>
                <Text className="text-lg text-neutral-500">
                  {t("pages.dashboard.kg")}
                </Text>
              </View>
              {userTarget?.bodyweight ? (
                <Text className="mt-1 text-xs text-neutral-500">
                  {t("pages.dashboard.target")}: {userTarget.bodyweight}{" "}
                  {t("pages.dashboard.kg")}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/weight")}
              className="items-center justify-center w-12 h-12 p-3 rounded-full bg-neutral-800"
            >
              <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
          </WalkthroughableView>
        </CopilotStep>

        {/* Quick Actions */}
        <ThemedText type="subtitle" className="mb-3">
          {t("pages.dashboard.quickActions")}
        </ThemedText>
        <CopilotStep
          text={t("pages.dashboard.tutorialQuickActions")}
          order={2}
          name="quick_actions"
        >
          <WalkthroughableView
            collapsable={false}
            style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}
          >
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/food")}
              style={{ flex: 1 }}
              className="items-center p-4 border bg-neutral-800 rounded-xl border-neutral-700"
            >
              <View className="p-3 mb-2 rounded-full bg-emerald-500/20">
                <Ionicons name="fast-food" size={24} color="#10b981" />
              </View>
              <Text className="font-medium text-white">
                {t("pages.dashboard.addFood")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/exercise")}
              style={{ flex: 1 }}
              className="items-center p-4 border bg-neutral-800 rounded-xl border-neutral-700"
            >
              <View className="p-3 mb-2 rounded-full bg-blue-500/20">
                <Ionicons name="bicycle" size={24} color="#3b82f6" />
              </View>
              <Text className="font-medium text-white">
                {t("pages.dashboard.addExercise")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/weight")}
              style={{ flex: 1 }}
              className="items-center p-4 border bg-neutral-800 rounded-xl border-neutral-700"
            >
              <View className="p-3 mb-2 rounded-full bg-orange-500/20">
                <Ionicons name="scale" size={24} color="#f97316" />
              </View>
              <Text className="font-medium text-white">
                {t("pages.dashboard.logWeight")}
              </Text>
            </TouchableOpacity>
          </WalkthroughableView>
        </CopilotStep>

        {/* Recent Activity */}
        <ThemedText type="subtitle" className="mb-3">
          {t("pages.dashboard.recentActivity")}
        </ThemedText>
        {todayFood.length === 0 && todayExercise.length === 0 ? (
          <Text className="py-4 text-center text-neutral-500">
            {t("pages.dashboard.noActivityToday")}
          </Text>
        ) : (
          <View className="gap-3">
            {todayFood.slice(0, 3).map((food) => (
              <View
                key={`food-${food.id}`}
                className="flex-row items-center p-3 border bg-neutral-900 rounded-xl border-neutral-800"
              >
                <View className="p-2 mr-3 rounded-full bg-neutral-800">
                  <Ionicons name="fast-food" size={16} color="#a3a3a3" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-white">{food.name}</Text>
                  <Text className="text-xs text-neutral-500">
                    {food.category}
                  </Text>
                </View>
                <Text className="font-medium text-red-400">
                  +{Math.round(food.caloric)} kcal
                </Text>
              </View>
            ))}
            {todayExercise.slice(0, 3).map((ex) => (
              <View
                key={`ex-${ex.id}`}
                className="flex-row items-center p-3 border bg-neutral-900 rounded-xl border-neutral-800"
              >
                <View className="p-2 mr-3 rounded-full bg-neutral-800">
                  <Ionicons name="bicycle" size={16} color="#a3a3a3" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-white">{ex.name}</Text>
                  <Text className="text-xs text-neutral-500">{ex.type}</Text>
                </View>
                <Text className="font-medium text-emerald-400">
                  -{Math.round(ex.caloric)} kcal
                </Text>
              </View>
            ))}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </ScreenWrapper>
  );
}
