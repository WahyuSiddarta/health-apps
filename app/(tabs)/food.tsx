import { ScreenWrapper } from "@/components/screen-wrapper";
import { ThemedText } from "@/components/themed-text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { InputField } from "@/components/ui/input-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/context/toast-context";
import {
  addFood,
  deleteFood,
  FoodRecord,
  getFood,
  getUserTarget,
  updateFood,
  UserTarget,
} from "@/database/operations";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";

export default function FoodScreen() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  // Helper function to determine calorie status based on weight goal
  const getCaloricStatus = (current: number, target: number, goal?: string) => {
    if (!target || target <= 0)
      return { color: "text-neutral-400", message: "" };

    const difference = current - target;

    if (goal === "gain") {
      // For weight gain, more calories is better
      if (difference >= 0) {
        return {
          color: "text-emerald-500",
          message: t("pages.food.over"),
          value: Math.abs(Math.round(difference)),
        };
      } else {
        return {
          color: "text-red-500",
          message: t("pages.food.under"),
          value: Math.abs(Math.round(difference)),
        };
      }
    } else if (goal === "maintain") {
      // For maintenance, being close to target is good
      if (Math.abs(difference) <= target * 0.05) {
        return {
          color: "text-emerald-500",
          message:
            difference >= 0 ? t("pages.food.over") : t("pages.food.left"),
          value: Math.abs(Math.round(difference)),
        };
      } else if (difference > 0) {
        return {
          color: "text-amber-500",
          message: t("pages.food.over"),
          value: Math.abs(Math.round(difference)),
        };
      } else {
        return {
          color: "text-blue-500",
          message: t("pages.food.left"),
          value: Math.abs(Math.round(difference)),
        };
      }
    } else {
      // Default: weight loss - fewer calories is better
      if (difference <= 0) {
        return {
          color: "text-emerald-500",
          message: t("pages.food.left"),
          value: Math.abs(Math.round(difference)),
        };
      } else {
        return {
          color: "text-red-500",
          message: t("pages.food.over"),
          value: Math.abs(Math.round(difference)),
        };
      }
    }
  };
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [sugar, setSugar] = useState("");
  const [category, setCategory] = useState("Breakfast");
  const [foodLogs, setFoodLogs] = useState<FoodRecord[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"Daily" | "Weekly" | "All">("Daily");
  const [filterCategory, setFilterCategory] = useState<string | undefined>(
    undefined,
  );
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);
  const [userTarget, setUserTarget] = useState<UserTarget | null>(null);
  const [deleteConfirmingId, setDeleteConfirmingId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fat) || 0;
    const total = p * 4 + c * 4 + f * 9;
    setCalories(total > 0 ? Math.round(total).toString() : "");
  }, [protein, carbs, fat]);

  const getFoodIcon = (category: string) => {
    switch (category) {
      case "Breakfast":
        return { name: "sunny", color: "#f59e0b" }; // amber-500
      case "Lunch":
        return { name: "restaurant", color: "#3b82f6" }; // blue-500
      case "Dinner":
        return { name: "moon", color: "#8b5cf6" }; // violet-500
      case "Snack":
        return { name: "cafe", color: "#ec4899" }; // pink-500
      default:
        return { name: "fast-food", color: "#a3a3a3" }; // neutral-400
    }
  };

  const weeklyStats = useMemo(() => {
    if (filter !== "Weekly") return [];

    const stats = [
      {
        day: t("day.monday").substring(0, 3),
        total: 0,
        breakdown: {} as Record<string, number>,
      },
      {
        day: t("day.tuesday").substring(0, 3),
        total: 0,
        breakdown: {} as Record<string, number>,
      },
      {
        day: t("day.wednesday").substring(0, 3),

        total: 0,
        breakdown: {} as Record<string, number>,
      },
      {
        day: t("day.thursday").substring(0, 3),

        total: 0,
        breakdown: {} as Record<string, number>,
      },
      {
        day: t("day.friday").substring(0, 3),
        total: 0,
        breakdown: {} as Record<string, number>,
      },
      {
        day: t("day.saturday").substring(0, 3),
        total: 0,
        breakdown: {} as Record<string, number>,
      },
      {
        day: t("day.sunday").substring(0, 3),
        total: 0,
        breakdown: {} as Record<string, number>,
      },
    ];

    foodLogs.forEach((food) => {
      const date = new Date(food.created_at);
      let dayIndex = date.getDay() - 1;
      if (dayIndex === -1) dayIndex = 6; // Sunday

      if (stats[dayIndex]) {
        stats[dayIndex].total += food.caloric;
        stats[dayIndex].breakdown[food.category] =
          (stats[dayIndex].breakdown[food.category] || 0) + food.caloric;
      }
    });

    return stats;
  }, [foodLogs, filter]);

  const macroStats = useMemo(() => {
    if (filter !== "Daily") return [];
    const stats = { protein: 0, carbs: 0, fat: 0 };
    foodLogs.forEach((food) => {
      stats.protein += food.protein;
      stats.carbs += food.carbohydrate;
      stats.fat += food.fat;
    });
    return [
      { value: stats.protein, color: "#3b82f6", text: "Protein" }, // blue-500
      { value: stats.carbs, color: "#f59e0b", text: "Carbs" }, // amber-500
      { value: stats.fat, color: "#ef4444", text: "Fat" }, // red-500
    ];
  }, [foodLogs, filter]);

  const dailyTotals = useMemo(() => {
    if (filter !== "Daily") return null;
    const totals = { protein: 0, carbs: 0, fat: 0, sugar: 0, calories: 0 };
    foodLogs.forEach((food) => {
      totals.protein += food.protein;
      totals.carbs += food.carbohydrate;
      totals.fat += food.fat;
      totals.sugar += food.sugar;
      totals.calories += food.caloric;
    });
    return totals;
  }, [foodLogs, filter]);

  const maxCalories = useMemo(() => {
    return Math.max(...weeklyStats.map((s) => s.total), 1);
  }, [weeklyStats]);

  const loadFoodLogs = useCallback(() => {
    let dateFilter = undefined;
    let startDate = undefined;
    let endDate = undefined;

    if (filter === "Weekly") {
      const now = new Date();
      const firstDay = new Date(
        now.setDate(
          now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
        ),
      ); // Monday
      const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 7)); // Sunday
      startDate = firstDay.toISOString();
      endDate = lastDay.toISOString();
    } else if (filter === "Daily") {
      const date = filterDate ? new Date(filterDate) : new Date();
      dateFilter = date.toISOString();
    } else if (filterDate) {
      dateFilter = new Date(filterDate).toISOString();
    }

    const data = getFood({
      date: dateFilter,
      startDate,
      endDate,
      category: filterCategory,
    });
    setFoodLogs(data);
  }, [filter, filterDate, filterCategory]);

  useFocusEffect(
    useCallback(() => {
      loadFoodLogs();
      const target = getUserTarget();
      setUserTarget(target);
    }, [loadFoodLogs]),
  );

  const handleSubmit = () => {
    if (!name) {
      showToast(t("pages.food.pleaseEnterName"), "error");
      return;
    }

    try {
      if (editingId) {
        updateFood(
          editingId,
          1, // userId
          0, // foodId
          category,
          foodLogs.find((f) => f.id === editingId)?.created_at ||
            new Date().toISOString(),
          fat ? parseFloat(fat) : 0,
          protein ? parseFloat(protein) : 0,
          carbs ? parseFloat(carbs) : 0,
          parseFloat(calories) || 0,
          sugar ? parseFloat(sugar) : 0,
          name,
        );
        showToast(t("pages.food.foodUpdatedSuccess"), "success");
      } else {
        addFood(
          1, // userId
          0, // foodId
          category,
          new Date().toISOString(),
          fat ? parseFloat(fat) : 0,
          protein ? parseFloat(protein) : 0,
          carbs ? parseFloat(carbs) : 0,
          parseFloat(calories) || 0,
          sugar ? parseFloat(sugar) : 0,
          name,
        );
        showToast(t("pages.food.foodAddedSuccess"), "success");
      }
      setName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setSugar("");
      setCategory("Breakfast");
      setEditingId(null);
      setIsFormVisible(false);
      loadFoodLogs();
    } catch (error) {
      showToast(
        editingId
          ? t("pages.food.failedUpdateFood")
          : t("pages.food.failedAddFood"),
        "error",
      );
    }
  };

  const handleEdit = (food: FoodRecord) => {
    setName(food.name);
    setCalories(food.caloric.toString());
    setProtein(food.protein.toString());
    setCarbs(food.carbohydrate.toString());
    setFat(food.fat.toString());
    setSugar(food.sugar.toString());
    setCategory(food.category);
    setEditingId(food.id);
    setIsFormVisible(true);
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmingId(id);
  };

  return (
    <ScreenWrapper title={t("pages.food.title")}>
      <View className="flex-1">
        <ScrollView className="flex-1 p-4">
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <ThemedText type="subtitle">
                {t("pages.food.recentFoodLogs")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setIsFilterVisible(true)}
                className={`p-2 rounded-lg ${
                  filterCategory || (filter === "All" && filterDate)
                    ? "bg-emerald-600"
                    : "bg-neutral-800"
                }`}
              >
                <Ionicons name="filter" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <SegmentedControl
              options={["Daily", "Weekly", "All"]}
              value={filter}
              onChange={(val) => setFilter(val as "Daily" | "Weekly" | "All")}
            />
          </View>

          {filter === "Daily" && dailyTotals && (
            <View className="p-4 mb-6 border bg-neutral-900 rounded-2xl border-neutral-800">
              <Text className="mb-4 font-bold text-white">
                {t("pages.food.dailyTotals")}
              </Text>
              <View className="flex-row flex-wrap justify-between gap-4">
                <View className="items-center w-[45%] p-3 rounded-xl bg-neutral-800">
                  <Text
                    className={`text-2xl font-bold ${
                      userTarget?.nutrition_caloric &&
                      userTarget.nutrition_caloric > 0
                        ? getCaloricStatus(
                            dailyTotals.calories,
                            userTarget.nutrition_caloric,
                            userTarget.weight_goal,
                          ).color
                        : "text-neutral-400"
                    }`}
                  >
                    {Math.round(dailyTotals.calories)}
                    {userTarget?.nutrition_caloric &&
                    userTarget.nutrition_caloric > 0 ? (
                      <Text className="text-sm text-neutral-400">
                        {" "}
                        / {userTarget.nutrition_caloric}
                      </Text>
                    ) : null}
                  </Text>
                  <Text className="text-xs text-neutral-400">
                    {t("pages.food.calories")}
                  </Text>
                </View>
                <View className="items-center w-[45%] p-3 rounded-xl bg-neutral-800">
                  <Text
                    className={`text-2xl font-bold ${
                      userTarget?.nutrition_protein &&
                      userTarget.nutrition_protein > 0 &&
                      Math.abs(
                        dailyTotals.protein - userTarget.nutrition_protein,
                      ) <=
                        userTarget.nutrition_protein * 0.1
                        ? "text-emerald-500"
                        : "text-blue-500"
                    }`}
                  >
                    {Math.round(dailyTotals.protein)}g
                    {userTarget?.nutrition_protein &&
                    userTarget.nutrition_protein > 0 ? (
                      <Text className="text-sm text-neutral-400">
                        {" "}
                        / {userTarget.nutrition_protein}g
                      </Text>
                    ) : null}
                  </Text>
                  <Text className="text-xs text-neutral-400">
                    {t("pages.food.protein")}
                  </Text>
                </View>
                <View className="items-center w-[45%] p-3 rounded-xl bg-neutral-800">
                  <Text
                    className={`text-2xl font-bold ${
                      userTarget?.nutrition_carbohydrate &&
                      userTarget.nutrition_carbohydrate > 0 &&
                      Math.abs(
                        dailyTotals.carbs - userTarget.nutrition_carbohydrate,
                      ) <=
                        userTarget.nutrition_carbohydrate * 0.1
                        ? "text-emerald-500"
                        : "text-amber-500"
                    }`}
                  >
                    {Math.round(dailyTotals.carbs)}g
                    {userTarget?.nutrition_carbohydrate &&
                    userTarget.nutrition_carbohydrate > 0 ? (
                      <Text className="text-sm text-neutral-400">
                        {" "}
                        / {userTarget.nutrition_carbohydrate}g
                      </Text>
                    ) : null}
                  </Text>
                  <Text className="text-xs text-neutral-400">
                    {t("pages.food.carbs")}
                  </Text>
                </View>
                <View className="items-center w-[45%] p-3 rounded-xl bg-neutral-800">
                  <Text
                    className={`text-2xl font-bold ${
                      userTarget?.nutrition_fat &&
                      userTarget.nutrition_fat > 0 &&
                      Math.abs(dailyTotals.fat - userTarget.nutrition_fat) <=
                        userTarget.nutrition_fat * 0.1
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    {Math.round(dailyTotals.fat)}g
                    {userTarget?.nutrition_fat &&
                    userTarget.nutrition_fat > 0 ? (
                      <Text className="text-sm text-neutral-400">
                        {" "}
                        / {userTarget.nutrition_fat}g
                      </Text>
                    ) : null}
                  </Text>
                  <Text className="text-xs text-neutral-400">
                    {t("pages.food.fat")}
                  </Text>
                </View>
                <View className="items-center w-[45%] p-3 rounded-xl bg-neutral-800">
                  <Text
                    className={`text-2xl font-bold ${
                      userTarget?.nutrition_sugar &&
                      userTarget.nutrition_sugar > 0 &&
                      dailyTotals.sugar > userTarget.nutrition_sugar
                        ? "text-red-500"
                        : "text-pink-500"
                    }`}
                  >
                    {Math.round(dailyTotals.sugar)}g
                    {userTarget?.nutrition_sugar &&
                    userTarget.nutrition_sugar > 0 ? (
                      <Text className="text-sm text-neutral-400">
                        {" "}
                        / {userTarget.nutrition_sugar}g
                      </Text>
                    ) : null}
                  </Text>
                  <Text className="text-xs text-neutral-400">
                    {t("pages.food.sugar")}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {filter === "Daily" && (
            <View className="items-center p-4 mb-6 border bg-neutral-900 rounded-2xl border-neutral-800">
              <Text className="self-start mb-4 font-bold text-white">
                {t("pages.food.dailyMacroBreakdown")}
              </Text>
              <PieChart
                data={macroStats}
                showText
                textColor="white"
                radius={100}
                textSize={12}
                labelsPosition="outward"
              />
              <View className="flex-row flex-wrap justify-center gap-4 mt-4">
                {macroStats.map((stat) => (
                  <View key={stat.text} className="flex-row items-center gap-2">
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                    <Text className="text-xs text-neutral-400">
                      {stat.text}: {Math.round(stat.value)}g
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {filter === "Weekly" && (
            <View className="p-4 mb-6 border bg-neutral-900 rounded-2xl border-neutral-800">
              <Text className="mb-4 font-bold text-white">
                {t("pages.food.weeklyCalorieBreakdown")}
              </Text>
              <View className="gap-3">
                {weeklyStats.map((stat) => (
                  <View
                    key={stat.day}
                    className="flex-row items-center align-middle"
                  >
                    <Text className="w-10 font-medium align-middle text-neutral-400">
                      {stat.day}
                    </Text>
                    <View className="flex-row flex-1 h-6 mx-2 overflow-hidden rounded-full bg-neutral-800">
                      {Object.entries(stat.breakdown).map(([cat, calories]) => {
                        const width = (calories / maxCalories) * 100;
                        const color = getFoodIcon(cat).color;
                        return (
                          <View
                            key={cat}
                            style={{
                              width: `${width}%`,
                              backgroundColor: color,
                            }}
                          />
                        );
                      })}
                    </View>
                    <View className="items-end w-20">
                      <Text className="text-xs text-white">
                        {stat.total > 0 ? Math.round(stat.total) : "-"}
                      </Text>
                      {userTarget?.nutrition_caloric &&
                      userTarget.nutrition_caloric > 0 &&
                      stat.total > 0 ? (
                        <Text
                          className={`text-[10px] ${
                            getCaloricStatus(
                              stat.total,
                              userTarget.nutrition_caloric,
                              userTarget.weight_goal,
                            ).color
                          }`}
                        >
                          {
                            getCaloricStatus(
                              stat.total,
                              userTarget.nutrition_caloric,
                              userTarget.weight_goal,
                            ).message
                          }{" "}
                          {
                            getCaloricStatus(
                              stat.total,
                              userTarget.nutrition_caloric,
                              userTarget.weight_goal,
                            ).value
                          }
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
              <View className="flex-row flex-wrap justify-center gap-4 mt-4">
                {["Breakfast", "Lunch", "Dinner", "Snack"].map((cat) => (
                  <View key={cat} className="flex-row items-center gap-2">
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getFoodIcon(cat).color }}
                    />
                    <Text className="text-xs text-neutral-400">{cat}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {foodLogs.map((food) => {
            const icon = getFoodIcon(food.category);
            return (
              <View
                key={food.id}
                className="flex-row items-center justify-between p-4 mb-3 border bg-neutral-900 rounded-2xl border-neutral-800"
              >
                <View className="p-3 mr-4 rounded-full bg-neutral-800">
                  <Ionicons
                    name={icon.name as any}
                    size={24}
                    color={icon.color}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white">
                    {food.name}
                  </Text>
                  <Text className="mt-1 text-neutral-400">
                    {food.caloric} kcal • P: {food.protein}g • C:{" "}
                    {food.carbohydrate}g • F: {food.fat}g
                  </Text>
                  <Text className="mt-2 text-xs text-neutral-500">
                    {new Date(food.created_at).toLocaleString()} •{" "}
                    {food.category}
                  </Text>
                </View>
                <View className="flex-col gap-2 ml-2">
                  <TouchableOpacity
                    onPress={() => handleEdit(food)}
                    className="p-2 rounded-full bg-blue-500/10"
                  >
                    <Ionicons name="pencil" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(food.id)}
                    className="p-2 rounded-full bg-red-500/10"
                  >
                    <Ionicons name="trash" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {foodLogs.length === 0 && (
            <Text className="mt-8 text-center text-neutral-500">
              {t("pages.food.noFoodLogs")}
            </Text>
          )}

          <View className="h-20" />
        </ScrollView>

        <View className="p-4 bg-black border-t border-neutral-800">
          <TouchableOpacity
            onPress={() => {
              setName("");
              setCalories("");
              setProtein("");
              setCarbs("");
              setFat("");
              setSugar("");
              setCategory("Breakfast");
              setEditingId(null);
              setIsFormVisible(true);
            }}
            className="items-center p-3 shadow-sm bg-emerald-600 rounded-xl active:bg-emerald-700"
          >
            <Text className="text-lg font-bold text-white">
              {t("pages.food.addNewFood")}
            </Text>
          </TouchableOpacity>
        </View>

        <BottomSheet
          visible={isFormVisible}
          onClose={() => setIsFormVisible(false)}
          title={
            editingId ? t("pages.food.editFood") : t("pages.food.addNewFood")
          }
        >
          <InputField
            label={t("pages.food.nameLabel")}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Oatmeal"
            className="mb-4"
            required
          />

          <InputField
            label={t("pages.food.caloriesLabel")}
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            useThousandSeparator
            placeholder={t("pages.food.calculatedAutomatically")}
            className="mb-4"
            editable={false}
          />

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <InputField
                label={t("pages.food.proteinLabel")}
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 5"
                required={false}
              />
            </View>
            <View className="flex-1">
              <InputField
                label={t("pages.food.carbsLabel")}
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 27"
                required={false}
              />
            </View>
          </View>

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <InputField
                label={t("pages.food.fatLabel")}
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 3"
                required={false}
              />
            </View>
            <View className="flex-1">
              <InputField
                label={t("pages.food.sugarLabel")}
                value={sugar}
                onChangeText={setSugar}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 1"
                required={false}
              />
            </View>
          </View>

          <SegmentedControl
            label={t("pages.food.categoryLabel")}
            options={["Breakfast", "Lunch", "Dinner", "Snack"]}
            value={category}
            onChange={setCategory}
            className="mb-6"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            className="items-center p-3 shadow-sm bg-emerald-600 rounded-xl active:bg-emerald-700"
          >
            <Text className="text-lg font-bold text-white">
              {editingId ? t("pages.food.updateFood") : t("pages.food.addFood")}
            </Text>
          </TouchableOpacity>
        </BottomSheet>

        <BottomSheet
          visible={isFilterVisible}
          onClose={() => setIsFilterVisible(false)}
          title={t("pages.food.filterFoodLogs")}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {filter === "All" && (
              <InputField
                label={t("pages.food.dateFilter")}
                value={filterDate || ""}
                onChangeText={setFilterDate}
                placeholder="e.g. 2023-12-25"
                className="mb-4"
              />
            )}

            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-neutral-400">
                {t("pages.food.categoryFilter")}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {["Breakfast", "Lunch", "Dinner", "Snack"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() =>
                      setFilterCategory(
                        filterCategory === cat ? undefined : cat,
                      )
                    }
                    className={`px-3 py-2 rounded-full border ${
                      filterCategory === cat
                        ? "bg-emerald-600 border-emerald-600"
                        : "bg-neutral-800 border-neutral-700"
                    }`}
                  >
                    <Text
                      className={`${
                        filterCategory === cat
                          ? "text-white"
                          : "text-neutral-400"
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => {
                  setFilterCategory(undefined);
                  setFilterDate(undefined);
                }}
                className="items-center flex-1 p-3 bg-neutral-800 rounded-xl"
              >
                <Text className="font-bold text-white">
                  {t("pages.food.clearAll")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsFilterVisible(false)}
                className="items-center flex-1 p-3 bg-emerald-600 rounded-xl"
              >
                <Text className="font-bold text-white">
                  {t("pages.food.applyFilters")}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </BottomSheet>

        <BottomSheet
          visible={deleteConfirmingId !== null}
          onClose={() => setDeleteConfirmingId(null)}
          title={t("pages.food.deleteFoodConfirmationTitle")}
        >
          <Text className="mb-6 text-neutral-300">
            {t("pages.food.deleteFoodConfirmationMessage")}
          </Text>

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => setDeleteConfirmingId(null)}
              className="items-center flex-1 p-3 bg-neutral-800 rounded-xl"
            >
              <Text className="font-bold text-white">
                {t("pages.food.cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (deleteConfirmingId) {
                  try {
                    deleteFood(deleteConfirmingId);
                    setDeleteConfirmingId(null);
                    loadFoodLogs();
                    showToast(t("pages.food.foodDeletedSuccess"), "success");
                  } catch (error) {
                    showToast(t("pages.food.failedDeleteFood"), "error");
                  }
                }
              }}
              className="items-center flex-1 p-3 bg-red-600 rounded-xl"
            >
              <Text className="font-bold text-white">
                {t("pages.food.delete")}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      </View>
    </ScreenWrapper>
  );
}
