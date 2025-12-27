import { ScreenWrapper } from "@/components/screen-wrapper";
import { ThemedText } from "@/components/themed-text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { InputField } from "@/components/ui/input-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/context/toast-context";
import {
  addExercise,
  deleteExercise,
  ExerciseRecord,
  getExercises,
  updateExercise,
} from "@/database/operations";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ExerciseScreen() {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [minute, setMinute] = useState("");
  const [caloric, setCaloric] = useState("");
  const [intensity, setIntensity] = useState("Medium");
  const [type, setType] = useState("Cardio");
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"Weekly" | "All">("Weekly");
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [filterIntensity, setFilterIntensity] = useState<string | undefined>(
    undefined
  );
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case "Cardio":
        return { name: "bicycle", color: "#3b82f6" }; // blue-500
      case "Weight Training":
        return { name: "barbell", color: "#f97316" }; // orange-500
      case "Recovery":
        return { name: "medkit", color: "#22c55e" }; // green-500
      case "HIT":
        return { name: "flash", color: "#ef4444" }; // red-500
      default:
        return { name: "fitness", color: "#a3a3a3" }; // neutral-400
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

    exercises.forEach((ex) => {
      const date = new Date(ex.record_at);
      let dayIndex = date.getDay() - 1;
      if (dayIndex === -1) dayIndex = 6; // Sunday

      if (stats[dayIndex]) {
        stats[dayIndex].total += ex.caloric;
        stats[dayIndex].breakdown[ex.type] =
          (stats[dayIndex].breakdown[ex.type] || 0) + ex.caloric;
      }
    });

    return stats;
  }, [exercises, filter]);

  const maxCalories = useMemo(() => {
    return Math.max(...weeklyStats.map((s) => s.total), 1);
  }, [weeklyStats]);

  const loadExercises = useCallback(() => {
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

    const data = getExercises({
      date: dateFilter,
      startDate,
      endDate,
      type: filterType,
      intensity: filterIntensity,
    });
    setExercises(data);
  }, [filter, filterDate, filterType, filterIntensity]);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [loadExercises])
  );

  const handleSubmit = () => {
    if (!name || !caloric || !intensity) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      if (editingId) {
        updateExercise(
          editingId,
          name,
          minute ? parseInt(minute) : null,
          parseInt(caloric),
          intensity,
          type
        );
        showToast("Exercise updated successfully", "success");
      } else {
        addExercise(
          name,
          new Date().toISOString(),
          minute ? parseInt(minute) : null,
          parseInt(caloric),
          intensity,
          type
        );
        showToast("Exercise added successfully", "success");
      }
      setName("");
      setMinute("");
      setCaloric("");
      setIntensity("Medium");
      setType("Cardio");
      setEditingId(null);
      setIsFormVisible(false);
      loadExercises();
    } catch (error) {
      showToast(
        editingId ? "Failed to update exercise" : "Failed to add exercise",
        "error"
      );
    }
  };

  const handleEdit = (exercise: ExerciseRecord) => {
    setName(exercise.name);
    setMinute(exercise.minute ? exercise.minute.toString() : "");
    setCaloric(exercise.caloric.toString());
    setIntensity(exercise.intensity);
    setType(exercise.type);
    setEditingId(exercise.id);
    setIsFormVisible(true);
  };

  const handleDelete = (id: number) => {
    try {
      deleteExercise(id);
      loadExercises();
      showToast("Exercise deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete exercise", "error");
    }
  };

  return (
    <ScreenWrapper title="Exercise">
      <View className="flex-1">
        <ScrollView className="flex-1 p-4">
          <View className="flex-row justify-between items-center mb-4">
            <ThemedText type="subtitle">Recent Exercises</ThemedText>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setIsFilterVisible(true)}
                className={`p-2 rounded-lg ${
                  filterType ||
                  filterIntensity ||
                  (filter === "All" && filterDate)
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
                      {Object.entries(stat.breakdown).map(
                        ([type, calories]) => {
                          const width = (calories / maxCalories) * 100;
                          const color = getExerciseIcon(type).color;
                          return (
                            <View
                              key={type}
                              style={{
                                width: `${width}%`,
                                backgroundColor: color,
                              }}
                            />
                          );
                        }
                      )}
                    </View>
                    <Text className="text-white w-10 text-right text-xs">
                      {stat.total > 0 ? stat.total : ""}
                    </Text>
                  </View>
                ))}
              </View>
              <View className="flex-row flex-wrap gap-4 mt-4 justify-center">
                {["Cardio", "Weight Training", "Recovery", "HIT"].map(
                  (type) => (
                    <View key={type} className="flex-row items-center gap-2">
                      <View
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getExerciseIcon(type).color }}
                      />
                      <Text className="text-neutral-400 text-xs">{type}</Text>
                    </View>
                  )
                )}
              </View>
            </View>
          )}

          {exercises.map((exercise) => {
            const icon = getExerciseIcon(exercise.type);
            return (
              <View
                key={exercise.id}
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
                    {exercise.name}
                  </Text>
                  <Text className="text-neutral-400 mt-1">
                    {exercise.minute ? `${exercise.minute} min` : "N/A"} •{" "}
                    {exercise.caloric} kcal • {exercise.intensity}
                  </Text>
                  <Text className="text-neutral-500 text-xs mt-2">
                    {new Date(exercise.record_at).toLocaleString()}
                  </Text>
                </View>
                <View className="flex-col gap-2 ml-2">
                  <TouchableOpacity
                    onPress={() => handleEdit(exercise)}
                    className="bg-blue-500/10 p-2 rounded-full"
                  >
                    <Ionicons name="pencil" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(exercise.id)}
                    className="bg-red-500/10 p-2 rounded-full"
                  >
                    <Ionicons name="trash" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {exercises.length === 0 && (
            <Text className="text-neutral-500 text-center mt-8">
              No exercises recorded yet
            </Text>
          )}

          <View className="h-20" />
        </ScrollView>

        <View className="p-4 border-t border-neutral-800 bg-black">
          <TouchableOpacity
            onPress={() => {
              setName("");
              setMinute("");
              setCaloric("");
              setIntensity("Medium");
              setType("Cardio");
              setEditingId(null);
              setIsFormVisible(true);
            }}
            className="bg-emerald-600 p-3 rounded-xl items-center shadow-sm active:bg-emerald-700"
          >
            <Text className="text-white font-bold text-lg">
              Add New Exercise
            </Text>
          </TouchableOpacity>
        </View>

        <BottomSheet
          visible={isFormVisible}
          onClose={() => setIsFormVisible(false)}
          title={editingId ? "Edit Exercise" : "Add New Exercise"}
        >
          <InputField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Running"
            className="mb-4"
          />

          <InputField
            label="Duration (minutes)"
            value={minute}
            onChangeText={setMinute}
            keyboardType="numeric"
            useThousandSeparator
            placeholder="e.g. 30"
            className="mb-4"
          />

          <InputField
            label="Calories"
            value={caloric}
            onChangeText={setCaloric}
            keyboardType="numeric"
            useThousandSeparator
            placeholder="e.g. 300"
            className="mb-4"
          />

          <SegmentedControl
            label="Intensity"
            options={["Low", "Medium", "High"]}
            value={intensity}
            onChange={setIntensity}
            className="mb-4"
          />

          <SegmentedControl
            label="Type"
            options={["Cardio", "Weight Training", "Recovery", "HIT"]}
            value={type}
            onChange={setType}
            className="mb-6"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-emerald-600 p-3 rounded-xl items-center shadow-sm active:bg-emerald-700"
          >
            <Text className="text-white font-bold text-lg">
              {editingId ? "Update Exercise" : "Add Exercise"}
            </Text>
          </TouchableOpacity>
        </BottomSheet>

        <BottomSheet
          visible={isFilterVisible}
          onClose={() => setIsFilterVisible(false)}
          title="Filter Exercises"
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

          <View className="mb-4">
            <Text className="text-neutral-400 mb-2 text-sm font-medium">
              Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {["Cardio", "Weight Training", "Recovery", "HIT"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() =>
                    setFilterType(filterType === t ? undefined : t)
                  }
                  className={`px-3 py-2 rounded-full border ${
                    filterType === t
                      ? "bg-emerald-600 border-emerald-600"
                      : "bg-neutral-800 border-neutral-700"
                  }`}
                >
                  <Text
                    className={`${
                      filterType === t ? "text-white" : "text-neutral-400"
                    }`}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-neutral-400 mb-2 text-sm font-medium">
              Intensity
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {["Low", "Medium", "High"].map((i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() =>
                    setFilterIntensity(filterIntensity === i ? undefined : i)
                  }
                  className={`px-3 py-2 rounded-full border ${
                    filterIntensity === i
                      ? "bg-emerald-600 border-emerald-600"
                      : "bg-neutral-800 border-neutral-700"
                  }`}
                >
                  <Text
                    className={`${
                      filterIntensity === i ? "text-white" : "text-neutral-400"
                    }`}
                  >
                    {i}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => {
                setFilterType(undefined);
                setFilterIntensity(undefined);
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
