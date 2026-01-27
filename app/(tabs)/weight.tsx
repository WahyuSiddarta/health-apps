import { ScreenWrapper } from "@/components/screen-wrapper";
import { ThemedText } from "@/components/themed-text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { InputField } from "@/components/ui/input-field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/context/toast-context";
import {
  addWeight,
  deleteWeight,
  getWeightLogs,
  updateWeight,
  WeightRecord,
} from "@/database/operations";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

export default function WeightScreen() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [weight, setWeight] = useState("");
  const [viceralFat, setViceralFat] = useState("");
  const [fatPercentage, setFatPercentage] = useState("");
  const [neckCm, setNeckCm] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [weightLogs, setWeightLogs] = useState<WeightRecord[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"Weekly" | "All">("Weekly");
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);
  const [deleteConfirmingId, setDeleteConfirmingId] = useState<number | null>(
    null,
  );

  const weeklyStats = useMemo(() => {
    if (filter !== "Weekly") return [];

    const stats = [
      { day: "Mon", weight: 0, count: 0, fat: 0, fatCount: 0 },
      { day: "Tue", weight: 0, count: 0, fat: 0, fatCount: 0 },
      { day: "Wed", weight: 0, count: 0, fat: 0, fatCount: 0 },
      { day: "Thu", weight: 0, count: 0, fat: 0, fatCount: 0 },
      { day: "Fri", weight: 0, count: 0, fat: 0, fatCount: 0 },
      { day: "Sat", weight: 0, count: 0, fat: 0, fatCount: 0 },
      { day: "Sun", weight: 0, count: 0, fat: 0, fatCount: 0 },
    ];

    weightLogs.forEach((log) => {
      const date = new Date(log.measured_at);
      let dayIndex = date.getDay() - 1;
      if (dayIndex === -1) dayIndex = 6; // Sunday

      if (stats[dayIndex]) {
        stats[dayIndex].weight += log.bodyweight;
        stats[dayIndex].count += 1;
        if (log.fat_percentage) {
          stats[dayIndex].fat += log.fat_percentage;
          stats[dayIndex].fatCount += 1;
        }
      }
    });

    return stats.map((stat) => ({
      day: stat.day,
      avgWeight: stat.count > 0 ? stat.weight / stat.count : 0,
      avgFat: stat.fatCount > 0 ? stat.fat / stat.fatCount : 0,
    }));
  }, [weightLogs, filter]);

  const chartData = useMemo(() => {
    return weeklyStats.map((stat) => {
      const weight = stat.avgWeight;

      if (weight === 0) {
        return {
          label: stat.day,
          value: 0,
          frontColor: "transparent",
        };
      }

      return {
        label: stat.day,
        value: weight,
        frontColor: "#10b981", // emerald-500
      };
    });
  }, [weeklyStats]);

  const lineData = useMemo(() => {
    return weeklyStats.map((stat) => ({
      value: stat.avgWeight,
      dataPointText: stat.avgWeight > 0 ? stat.avgWeight.toFixed(1) : "",
      hideDataPoint: stat.avgWeight === 0,
      textShiftY: -10,
      textShiftX: -5,
      textColor: "white",
      textFontSize: 10,
    }));
  }, [weeklyStats]);

  const maxWeight = useMemo(() => {
    return Math.max(...weeklyStats.map((s) => s.avgWeight), 1);
  }, [weeklyStats]);

  const weeklyAverage = useMemo(() => {
    const daysWithData = weeklyStats.filter((s) => s.avgWeight > 0);
    if (daysWithData.length === 0) return 0;
    const sum = daysWithData.reduce((acc, curr) => acc + curr.avgWeight, 0);
    return sum / daysWithData.length;
  }, [weeklyStats]);

  const loadWeightLogs = useCallback(() => {
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

    const data = getWeightLogs({
      date: dateFilter,
      startDate,
      endDate,
    });
    setWeightLogs(data);
  }, [filter, filterDate]);

  useFocusEffect(
    useCallback(() => {
      loadWeightLogs();
    }, [loadWeightLogs]),
  );

  const handleSubmit = () => {
    if (!weight) {
      showToast(t("pages.weight.pleaseEnterWeight"), "error");
      return;
    }

    try {
      if (editingId) {
        updateWeight(
          editingId,
          1, // userId
          parseFloat(weight),
          viceralFat ? parseFloat(viceralFat) : null,
          fatPercentage ? parseFloat(fatPercentage) : null,
          neckCm ? parseFloat(neckCm) : null,
          waistCm ? parseFloat(waistCm) : null,
          weightLogs.find((w) => w.id === editingId)?.measured_at ||
            new Date().toISOString(),
        );
        showToast(t("pages.weight.weightUpdatedSuccess"), "success");
      } else {
        addWeight(
          1, // userId
          parseFloat(weight),
          viceralFat ? parseFloat(viceralFat) : null,
          fatPercentage ? parseFloat(fatPercentage) : null,
          neckCm ? parseFloat(neckCm) : null,
          waistCm ? parseFloat(waistCm) : null,
          new Date().toISOString(),
        );
        showToast(t("pages.weight.weightAddedSuccess"), "success");
      }
      setWeight("");
      setViceralFat("");
      setFatPercentage("");
      setNeckCm("");
      setWaistCm("");
      setEditingId(null);
      setIsFormVisible(false);
      loadWeightLogs();
    } catch (error) {
      showToast(
        editingId
          ? t("pages.weight.failedUpdateWeight")
          : t("pages.weight.failedAddWeight"),
        "error",
      );
    }
  };

  const handleEdit = (log: WeightRecord) => {
    setWeight(log.bodyweight.toString());
    setViceralFat(log.viceral_fat ? log.viceral_fat.toString() : "");
    setFatPercentage(log.fat_percentage ? log.fat_percentage.toString() : "");
    setNeckCm(log.nick_cm ? log.nick_cm.toString() : "");
    setWaistCm(log.waist_cm ? log.waist_cm.toString() : "");
    setEditingId(log.id);
    setIsFormVisible(true);
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmingId(id);
  };

  return (
    <ScreenWrapper title={t("pages.weight.title")}>
      <View className="flex-1">
        <ScrollView className="flex-1 p-4">
          <View className="flex-row items-center justify-between mb-4">
            <ThemedText type="subtitle">
              {t("pages.weight.recentMeasurements")}
            </ThemedText>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setIsFilterVisible(true)}
                className={`p-2 rounded-lg ${
                  filter === "All" && filterDate
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

          {filter === "Weekly" ? (
            <View className="p-4 mb-6 border bg-neutral-900 rounded-2xl border-neutral-800">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="font-bold text-white">
                  {t("pages.weight.weeklyWeightTrend")}
                </Text>
                {weeklyAverage > 0 && (
                  <Text className="text-xs font-medium text-emerald-500">
                    {t("pages.weight.avg")}: {weeklyAverage.toFixed(1)} kg
                  </Text>
                )}
              </View>

              <BarChart
                data={chartData}
                showLine
                lineData={lineData}
                height={200}
                width={300}
                spacing={20}
                initialSpacing={10}
                noOfSections={4}
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisTextStyle={{ color: "gray" }}
                xAxisLabelTextStyle={{ color: "gray" }}
                rulesColor="gray"
                rulesType="solid"
                lineConfig={{
                  color: "#F7B600",
                  thickness: 2,
                  curved: true,
                  hideDataPoints: false,
                  dataPointsColor: "#F7B600",
                  dataPointsRadius: 4,
                }}
                maxValue={maxWeight + 5}
                barWidth={20}
              />

              <View className="flex-row justify-center gap-4 mt-4">
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 rounded-full bg-emerald-500" />
                  <Text className="text-xs text-neutral-400">
                    {t("pages.weight.weight")}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 bg-[#F7B600] rounded-full" />
                  <Text className="text-xs text-neutral-400">
                    {t("pages.weight.weightTrend")}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {weightLogs.map((log) => (
            <View
              key={log.id}
              className="flex-row items-center justify-between p-4 mb-3 border bg-neutral-900 rounded-2xl border-neutral-800"
            >
              <View className="flex-1">
                <Text className="text-lg font-bold text-white">
                  {log.bodyweight} kg
                </Text>
                <Text className="mt-1 text-neutral-400">
                  {log.fat_percentage
                    ? `${t("pages.weight.fat")}: ${log.fat_percentage}% • `
                    : ""}
                  {log.viceral_fat
                    ? `${t("pages.weight.vf")}: ${log.viceral_fat} • `
                    : ""}
                  {log.waist_cm
                    ? `${t("pages.weight.waist")}: ${log.waist_cm}cm`
                    : ""}
                </Text>
                <Text className="mt-1 text-xs text-neutral-500">
                  {new Date(log.measured_at).toLocaleString()}
                </Text>
              </View>
              <View className="flex-col gap-2 ml-2">
                <TouchableOpacity
                  onPress={() => handleEdit(log)}
                  className="p-2 rounded-full bg-blue-500/10"
                >
                  <Ionicons name="pencil" size={16} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(log.id)}
                  className="p-2 rounded-full bg-red-500/10"
                >
                  <Ionicons name="trash" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {weightLogs.length === 0 && (
            <Text className="mt-8 text-center text-neutral-500">
              {t("pages.weight.noMeasurements")}
            </Text>
          )}

          <View className="h-20" />
        </ScrollView>

        <View className="p-4 bg-black border-t border-neutral-800">
          <TouchableOpacity
            onPress={() => {
              setWeight("");
              setViceralFat("");
              setFatPercentage("");
              setNeckCm("");
              setWaistCm("");
              setEditingId(null);
              setIsFormVisible(true);
            }}
            className="items-center p-3 shadow-sm bg-emerald-600 rounded-xl active:bg-emerald-700"
          >
            <Text className="text-lg font-bold text-white">
              {t("pages.weight.addNewMeasurement")}
            </Text>
          </TouchableOpacity>
        </View>

        <BottomSheet
          visible={isFormVisible}
          onClose={() => setIsFormVisible(false)}
          title={
            editingId
              ? t("pages.weight.editMeasurement")
              : t("pages.weight.addNewMeasurement")
          }
        >
          <InputField
            label={t("pages.weight.weightLabel")}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            useThousandSeparator
            placeholder="e.g. 70.5"
            className="mb-4"
            required
          />

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <InputField
                label={t("pages.weight.fatPercentage")}
                value={fatPercentage}
                onChangeText={setFatPercentage}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 15"
                required={false}
              />
            </View>
            <View className="flex-1">
              <InputField
                label={t("pages.weight.viceralFat")}
                value={viceralFat}
                onChangeText={setViceralFat}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 5"
                required={false}
              />
            </View>
          </View>

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <InputField
                label={t("pages.weight.neckLabel")}
                value={neckCm}
                onChangeText={setNeckCm}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 38"
                required={false}
              />
            </View>
            <View className="flex-1">
              <InputField
                label={t("pages.weight.waistLabel")}
                value={waistCm}
                onChangeText={setWaistCm}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 85"
                required={false}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            className="items-center p-3 shadow-sm bg-emerald-600 rounded-xl active:bg-emerald-700"
          >
            <Text className="text-lg font-bold text-white">
              {editingId
                ? t("pages.weight.updateMeasurement")
                : t("pages.weight.addMeasurement")}
            </Text>
          </TouchableOpacity>
        </BottomSheet>

        <BottomSheet
          visible={isFilterVisible}
          onClose={() => setIsFilterVisible(false)}
          title={t("pages.weight.filterMeasurements")}
        >
          {filter === "All" && (
            <InputField
              label={t("pages.weight.dateFilter")}
              value={filterDate || ""}
              onChangeText={setFilterDate}
              placeholder="e.g. 2023-12-25"
              className="mb-4"
            />
          )}

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => {
                setFilterDate(undefined);
              }}
              className="items-center flex-1 p-3 bg-neutral-800 rounded-xl"
            >
              <Text className="font-bold text-white">
                {t("pages.weight.clearAll")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsFilterVisible(false)}
              className="items-center flex-1 p-3 bg-emerald-600 rounded-xl"
            >
              <Text className="font-bold text-white">
                {t("pages.weight.applyFilters")}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>

        <BottomSheet
          visible={deleteConfirmingId !== null}
          onClose={() => setDeleteConfirmingId(null)}
          title={t("pages.weight.deleteConfirmationTitle")}
        >
          <Text className="mb-6 text-neutral-300">
            {t("pages.weight.deleteConfirmationMessage")}
          </Text>

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => setDeleteConfirmingId(null)}
              className="items-center flex-1 p-3 bg-neutral-800 rounded-xl"
            >
              <Text className="font-bold text-white">
                {t("pages.weight.cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (deleteConfirmingId) {
                  try {
                    deleteWeight(deleteConfirmingId);
                    setDeleteConfirmingId(null);
                    loadWeightLogs();
                    showToast(
                      t("pages.weight.weightDeletedSuccess"),
                      "success",
                    );
                  } catch (error) {
                    showToast(t("pages.weight.failedDeleteWeight"), "error");
                  }
                }
              }}
              className="items-center flex-1 p-3 bg-red-600 rounded-xl"
            >
              <Text className="font-bold text-white">
                {t("pages.weight.delete")}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      </View>
    </ScreenWrapper>
  );
}
