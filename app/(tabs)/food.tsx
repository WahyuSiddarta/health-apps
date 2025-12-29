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
  updateFood,
} from "@/database/operations";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function FoodScreen() {
  const { showToast } = useToast();
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
  const [filter, setFilter] = useState<"Weekly" | "All">("Weekly");
  const [filterCategory, setFilterCategory] = useState<string | undefined>(
    undefined
  );
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);

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
      { day: "Mon", total: 0, breakdown: {} as Record<string, number> },
      { day: "Tue", total: 0, breakdown: {} as Record<string, number> },
      { day: "Wed", total: 0, breakdown: {} as Record<string, number> },
      { day: "Thu", total: 0, breakdown: {} as Record<string, number> },
      { day: "Fri", total: 0, breakdown: {} as Record<string, number> },
      { day: "Sat", total: 0, breakdown: {} as Record<string, number> },
      { day: "Sun", total: 0, breakdown: {} as Record<string, number> },
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
          now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
        )
      ); // Monday
      const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 7)); // Sunday
      startDate = firstDay.toISOString();
      endDate = lastDay.toISOString();
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
    }, [loadFoodLogs])
  );

  const handleSubmit = () => {
    if (!name) {
      showToast("Please fill in name", "error");
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
          name
        );
        showToast("Food updated successfully", "success");
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
          name
        );
        showToast("Food added successfully", "success");
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
        editingId ? "Failed to update food" : "Failed to add food",
        "error"
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
    try {
      deleteFood(id);
      loadFoodLogs();
      showToast("Food deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete food", "error");
    }
  };

  return (
    <ScreenWrapper title="Food">
      <View className="flex-1">
        <ScrollView className="flex-1 p-4">
          <View className="flex-row justify-between items-center mb-4">
            <ThemedText type="subtitle">Recent Food Logs</ThemedText>
            <View className="flex-row gap-2">
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
              <View className="w-36">
                <SegmentedControl
                  options={["Weekly", "All"]}
                  value={filter}
                  onChange={(val) => setFilter(val as "Weekly" | "All")}
                />
              </View>
            </View>
          </View>

          {filter === "Weekly" && (
            <View className="bg-neutral-900 p-4 rounded-2xl mb-6 border border-neutral-800">
              <Text className="text-white font-bold mb-4">
                Weekly Calorie Breakdown
              </Text>
              <View className="gap-3">
                {weeklyStats.map((stat) => (
                  <View key={stat.day} className="flex-row items-center">
                    <Text className="text-neutral-400 w-8 font-medium">
                      {stat.day}
                    </Text>
                    <View className="flex-1 h-6 bg-neutral-800 rounded-full flex-row overflow-hidden mx-2">
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
                    <Text className="text-white w-10 text-right text-xs">
                      {stat.total > 0 ? stat.total : ""}
                    </Text>
                  </View>
                ))}
              </View>
              <View className="flex-row flex-wrap gap-4 mt-4 justify-center">
                {["Breakfast", "Lunch", "Dinner", "Snack"].map((cat) => (
                  <View key={cat} className="flex-row items-center gap-2">
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getFoodIcon(cat).color }}
                    />
                    <Text className="text-neutral-400 text-xs">{cat}</Text>
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
                className="bg-neutral-900 p-4 rounded-2xl mb-3 flex-row justify-between items-center border border-neutral-800"
              >
                <View className="mr-4 bg-neutral-800 p-3 rounded-full">
                  <Ionicons
                    name={icon.name as any}
                    size={24}
                    color={icon.color}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">
                    {food.name}
                  </Text>
                  <Text className="text-neutral-400 mt-1">
                    {food.caloric} kcal • P: {food.protein}g • C:{" "}
                    {food.carbohydrate}g • F: {food.fat}g
                  </Text>
                  <Text className="text-neutral-500 text-xs mt-2">
                    {new Date(food.created_at).toLocaleString()} •{" "}
                    {food.category}
                  </Text>
                </View>
                <View className="flex-col gap-2 ml-2">
                  <TouchableOpacity
                    onPress={() => handleEdit(food)}
                    className="bg-blue-500/10 p-2 rounded-full"
                  >
                    <Ionicons name="pencil" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(food.id)}
                    className="bg-red-500/10 p-2 rounded-full"
                  >
                    <Ionicons name="trash" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {foodLogs.length === 0 && (
            <Text className="text-neutral-500 text-center mt-8">
              No food logs recorded yet
            </Text>
          )}

          <View className="h-20" />
        </ScrollView>

        <View className="p-4 border-t border-neutral-800 bg-black">
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
            className="bg-emerald-600 p-3 rounded-xl items-center shadow-sm active:bg-emerald-700"
          >
            <Text className="text-white font-bold text-lg">Add New Food</Text>
          </TouchableOpacity>
        </View>

        <BottomSheet
          visible={isFormVisible}
          onClose={() => setIsFormVisible(false)}
          title={editingId ? "Edit Food" : "Add New Food"}
        >
          <InputField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Oatmeal"
            className="mb-4"
          />

          <InputField
            label="Calories"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            useThousandSeparator
            placeholder="Calculated automatically"
            className="mb-4"
            editable={false}
          />

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <InputField
                label="Protein (g)"
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 5"
              />
            </View>
            <View className="flex-1">
              <InputField
                label="Carbs (g)"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 27"
              />
            </View>
          </View>

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <InputField
                label="Fat (g)"
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 3"
              />
            </View>
            <View className="flex-1">
              <InputField
                label="Sugar (g)"
                value={sugar}
                onChangeText={setSugar}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 1"
              />
            </View>
          </View>

          <SegmentedControl
            label="Category"
            options={["Breakfast", "Lunch", "Dinner", "Snack"]}
            value={category}
            onChange={setCategory}
            className="mb-6"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-emerald-600 p-3 rounded-xl items-center shadow-sm active:bg-emerald-700"
          >
            <Text className="text-white font-bold text-lg">
              {editingId ? "Update Food" : "Add Food"}
            </Text>
          </TouchableOpacity>
        </BottomSheet>

        <BottomSheet
          visible={isFilterVisible}
          onClose={() => setIsFilterVisible(false)}
          title="Filter Food Logs"
        >
          {filter === "All" && (
            <InputField
              label="Date (YYYY-MM-DD)"
              value={filterDate || ""}
              onChangeText={setFilterDate}
              placeholder="e.g. 2023-12-25"
              className="mb-4"
            />
          )}

          <View className="mb-6">
            <Text className="text-neutral-400 mb-2 text-sm font-medium">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {["Breakfast", "Lunch", "Dinner", "Snack"].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() =>
                    setFilterCategory(filterCategory === cat ? undefined : cat)
                  }
                  className={`px-3 py-2 rounded-full border ${
                    filterCategory === cat
                      ? "bg-emerald-600 border-emerald-600"
                      : "bg-neutral-800 border-neutral-700"
                  }`}
                >
                  <Text
                    className={`${
                      filterCategory === cat ? "text-white" : "text-neutral-400"
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
              className="flex-1 bg-neutral-800 p-3 rounded-xl items-center"
            >
              <Text className="text-white font-bold">Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsFilterVisible(false)}
              className="flex-1 bg-emerald-600 p-3 rounded-xl items-center"
            >
              <Text className="text-white font-bold">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      </View>
    </ScreenWrapper>
  );
}
