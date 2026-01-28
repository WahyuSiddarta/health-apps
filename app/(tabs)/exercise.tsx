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
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ExerciseScreen() {
  const { t } = useTranslation();
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
    undefined,
  );
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);
  const [deleteConfirmingId, setDeleteConfirmingId] = useState<number | null>(
    null,
  );

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
          now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
        ),
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
    }, [loadExercises]),
  );

  const handleSubmit = () => {
    if (!name || !caloric || !intensity) {
      showToast(t("pages.exercise.pleaseEnterRequiredFields"), "error");
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
          type,
        );
        showToast(t("pages.exercise.exerciseUpdatedSuccess"), "success");
      } else {
        addExercise(
          name,
          new Date().toISOString(),
          minute ? parseInt(minute) : null,
          parseInt(caloric),
          intensity,
          type,
        );
        showToast(t("pages.exercise.exerciseAddedSuccess"), "success");
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
        editingId
          ? t("pages.exercise.failedUpdateExercise")
          : t("pages.exercise.failedAddExercise"),
        "error",
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
    setDeleteConfirmingId(id);
  };

  return (
    <ScreenWrapper title={t("pages.exercise.title")}>
      <View className="flex-1">
        <ScrollView className="flex-1 p-4">
          <View className="flex-row items-center justify-between mb-4">
            <ThemedText type="subtitle">
              {t("pages.exercise.recentExercises")}
            </ThemedText>
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
            <View className="p-4 mb-6 border bg-neutral-900 rounded-2xl border-neutral-800">
              <Text className="mb-4 font-bold text-white">
                {t("pages.exercise.weeklyCalorieBreakdown")}
              </Text>
              <View className="justify-center gap-3">
                {weeklyStats.map((stat) => (
                  <View
                    key={stat.day}
                    className="flex flex-row items-center align-middle"
                  >
                    <Text className="flex w-10 font-medium text-center align-middle text-neutral-400">
                      {stat.day}
                    </Text>
                    <View className="flex-row flex-1 h-6 mx-2 overflow-hidden rounded-full bg-neutral-800">
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
                        },
                      )}
                    </View>
                    <Text className="w-10 text-xs text-right text-white">
                      {stat.total > 0 ? stat.total : ""}
                    </Text>
                  </View>
                ))}
              </View>
              <View className="flex-row flex-wrap justify-center gap-4 mt-4">
                {["Cardio", "Weight Training", "Recovery", "HIT"].map(
                  (type) => (
                    <View key={type} className="flex-row items-center gap-2">
                      <View
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getExerciseIcon(type).color }}
                      />
                      <Text className="text-xs text-neutral-400">{type}</Text>
                    </View>
                  ),
                )}
              </View>
            </View>
          )}

          {exercises.map((exercise) => {
            const icon = getExerciseIcon(exercise.type);
            return (
              <View
                key={exercise.id}
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
                    {exercise.name}
                  </Text>
                  <Text className="mt-1 text-neutral-400">
                    {exercise.minute
                      ? `${exercise.minute} ${t("pages.exercise.min")}`
                      : "N/A"}{" "}
                    • {exercise.caloric} ${t("pages.exercise.kcal")} •{" "}
                    {exercise.intensity}
                  </Text>
                  <Text className="mt-2 text-xs text-neutral-500">
                    {new Date(exercise.record_at).toLocaleString()}
                  </Text>
                </View>
                <View className="flex-col gap-2 ml-2">
                  <TouchableOpacity
                    onPress={() => handleEdit(exercise)}
                    className="p-2 rounded-full bg-blue-500/10"
                  >
                    <Ionicons name="pencil" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(exercise.id)}
                    className="p-2 rounded-full bg-red-500/10"
                  >
                    <Ionicons name="trash" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {exercises.length === 0 && (
            <Text className="mt-8 text-center text-neutral-500">
              {t("pages.exercise.noExercises")}
            </Text>
          )}

          <View className="h-20" />
        </ScrollView>

        <View className="p-4 bg-black border-t border-neutral-800">
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
            className="items-center p-3 shadow-sm bg-emerald-600 rounded-xl active:bg-emerald-700"
          >
            <Text className="text-lg font-bold text-white">
              {t("pages.exercise.addNewExercise")}
            </Text>
          </TouchableOpacity>
        </View>

        <BottomSheet
          visible={isFormVisible}
          onClose={() => setIsFormVisible(false)}
          title={
            editingId
              ? t("pages.exercise.editExercise")
              : t("pages.exercise.addNewExercise")
          }
        >
          <InputField
            label={t("pages.exercise.nameLabel")}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Running"
            className="mb-4"
          />

          <InputField
            label={t("pages.exercise.durationLabel")}
            value={minute}
            onChangeText={setMinute}
            keyboardType="numeric"
            useThousandSeparator
            placeholder="e.g. 30"
            className="mb-4"
          />

          <InputField
            label={t("pages.exercise.caloriesLabel")}
            value={caloric}
            onChangeText={setCaloric}
            keyboardType="numeric"
            useThousandSeparator
            placeholder="e.g. 300"
            className="mb-4"
          />

          <SegmentedControl
            label={t("pages.exercise.intensityLabel")}
            options={["Low", "Medium", "High"]}
            value={intensity}
            onChange={setIntensity}
            className="mb-4"
          />

          <SegmentedControl
            label={t("pages.exercise.typeLabel")}
            options={["Cardio", "Weight Training", "Recovery", "HIT"]}
            value={type}
            onChange={setType}
            className="mb-6"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            className="items-center p-3 shadow-sm bg-emerald-600 rounded-xl active:bg-emerald-700"
          >
            <Text className="text-lg font-bold text-white">
              {editingId
                ? t("pages.exercise.updateExercise")
                : t("pages.exercise.addExercise")}
            </Text>
          </TouchableOpacity>
        </BottomSheet>

        <BottomSheet
          visible={isFilterVisible}
          onClose={() => setIsFilterVisible(false)}
          title={t("pages.exercise.filterExercises")}
        >
          {filter === "All" && (
            <InputField
              label={t("pages.exercise.dateFilter")}
              value={filterDate || ""}
              onChangeText={setFilterDate}
              placeholder="e.g. 2023-12-25"
              className="mb-4"
            />
          )}

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-neutral-400">
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
            <Text className="mb-2 text-sm font-medium text-neutral-400">
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
              className="items-center flex-1 p-3 bg-neutral-800 rounded-xl"
            >
              <Text className="font-bold text-white">
                {t("pages.exercise.clearAll")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsFilterVisible(false)}
              className="items-center flex-1 p-3 bg-emerald-600 rounded-xl"
            >
              <Text className="font-bold text-white">
                {t("pages.exercise.applyFilters")}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>

        <BottomSheet
          visible={deleteConfirmingId !== null}
          onClose={() => setDeleteConfirmingId(null)}
          title={t("pages.exercise.deleteExerciseConfirmationTitle")}
        >
          <Text className="mb-6 text-neutral-300">
            {t("pages.exercise.deleteExerciseConfirmationMessage")}
          </Text>

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => setDeleteConfirmingId(null)}
              className="items-center flex-1 p-3 bg-neutral-800 rounded-xl"
            >
              <Text className="font-bold text-white">
                {t("pages.exercise.cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (deleteConfirmingId) {
                  try {
                    deleteExercise(deleteConfirmingId);
                    setDeleteConfirmingId(null);
                    loadExercises();
                    showToast(
                      t("pages.exercise.exerciseDeletedSuccess"),
                      "success",
                    );
                  } catch (error) {
                    showToast(
                      t("pages.exercise.failedDeleteExercise"),
                      "error",
                    );
                  }
                }
              }}
              className="items-center flex-1 p-3 bg-red-600 rounded-xl"
            >
              <Text className="font-bold text-white">
                {t("pages.exercise.delete")}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      </View>
    </ScreenWrapper>
  );
}
