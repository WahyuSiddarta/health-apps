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
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function WeightScreen() {
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

  const weeklyStats = useMemo(() => {
    if (filter !== "Weekly") return [];

    const stats = [
      { day: "Mon", weight: 0, count: 0 },
      { day: "Tue", weight: 0, count: 0 },
      { day: "Wed", weight: 0, count: 0 },
      { day: "Thu", weight: 0, count: 0 },
      { day: "Fri", weight: 0, count: 0 },
      { day: "Sat", weight: 0, count: 0 },
      { day: "Sun", weight: 0, count: 0 },
    ];

    weightLogs.forEach((log) => {
      const date = new Date(log.measured_at);
      let dayIndex = date.getDay() - 1;
      if (dayIndex === -1) dayIndex = 6; // Sunday

      if (stats[dayIndex]) {
        stats[dayIndex].weight += log.bodyweight;
        stats[dayIndex].count += 1;
      }
    });

    return stats.map((stat) => ({
      day: stat.day,
      avgWeight: stat.count > 0 ? stat.weight / stat.count : 0,
    }));
  }, [weightLogs, filter]);

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
          now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
        )
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
    }, [loadWeightLogs])
  );

  const handleSubmit = () => {
    if (!weight) {
      showToast("Please enter weight", "error");
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
            new Date().toISOString()
        );
        showToast("Weight updated successfully", "success");
      } else {
        addWeight(
          1, // userId
          parseFloat(weight),
          viceralFat ? parseFloat(viceralFat) : null,
          fatPercentage ? parseFloat(fatPercentage) : null,
          neckCm ? parseFloat(neckCm) : null,
          waistCm ? parseFloat(waistCm) : null,
          new Date().toISOString()
        );
        showToast("Weight added successfully", "success");
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
        editingId ? "Failed to update weight" : "Failed to add weight",
        "error"
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
    try {
      deleteWeight(id);
      loadWeightLogs();
      showToast("Weight deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete weight", "error");
    }
  };

  return (
    <ScreenWrapper title="Weight">
      <View className="flex-1">
        <ScrollView className="flex-1 p-4">
          <View className="flex-row justify-between items-center mb-4">
            <ThemedText type="subtitle">Recent Measurements</ThemedText>
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

          {filter === "Weekly" && (
            <View className="bg-neutral-900 p-4 rounded-2xl mb-6 border border-neutral-800">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white font-bold">
                  Weekly Weight Trend (Avg)
                </Text>
                {weeklyAverage > 0 && (
                  <Text className="text-emerald-500 text-xs font-medium">
                    Avg: {weeklyAverage.toFixed(1)} kg
                  </Text>
                )}
              </View>

              <View className="h-40">
                <View className="absolute inset-0 mx-4 mb-6 justify-end">
                  {weeklyAverage > 0 && (
                    <View
                      className="w-full border-t border-dashed border-emerald-500/50"
                      style={{
                        bottom: `${(weeklyAverage / maxWeight) * 100}%`,
                        position: "absolute",
                      }}
                    />
                  )}
                </View>

                <View className="flex-1 flex-row justify-between items-end px-2">
                  {weeklyStats.map((stat) => {
                    const heightPercentage =
                      maxWeight > 0 ? (stat.avgWeight / maxWeight) * 100 : 0;
                    return (
                      <View key={stat.day} className="items-center w-8">
                        <View className="h-32 w-full justify-end items-center">
                          {stat.avgWeight > 0 && (
                            <Text className="text-white text-[10px] mb-1 absolute -top-5 w-10 text-center">
                              {stat.avgWeight.toFixed(1)}
                            </Text>
                          )}
                          <View className="w-1.5 bg-neutral-800 rounded-full h-full justify-end overflow-hidden">
                            <View
                              style={{
                                height: `${heightPercentage}%`,
                              }}
                              className="bg-emerald-500 w-full rounded-full"
                            />
                          </View>
                        </View>
                        <Text className="text-neutral-400 text-xs mt-2">
                          {stat.day}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {weightLogs.map((log) => (
            <View
              key={log.id}
              className="bg-neutral-900 p-4 rounded-2xl mb-3 flex-row justify-between items-center border border-neutral-800"
            >
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">
                  {log.bodyweight} kg
                </Text>
                <Text className="text-neutral-400 mt-1">
                  {log.fat_percentage ? `Fat: ${log.fat_percentage}% • ` : ""}
                  {log.viceral_fat ? `VF: ${log.viceral_fat} • ` : ""}
                  {log.waist_cm ? `Waist: ${log.waist_cm}cm` : ""}
                </Text>
                <Text className="text-neutral-500 text-xs mt-1">
                  {new Date(log.measured_at).toLocaleString()}
                </Text>
              </View>
              <View className="flex-col gap-2 ml-2">
                <TouchableOpacity
                  onPress={() => handleEdit(log)}
                  className="bg-blue-500/10 p-2 rounded-full"
                >
                  <Ionicons name="pencil" size={16} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(log.id)}
                  className="bg-red-500/10 p-2 rounded-full"
                >
                  <Ionicons name="trash" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {weightLogs.length === 0 && (
            <Text className="text-neutral-500 text-center mt-8">
              No measurements recorded yet
            </Text>
          )}

          <View className="h-20" />
        </ScrollView>

        <View className="p-4 border-t border-neutral-800 bg-black">
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
            className="bg-emerald-600 p-3 rounded-xl items-center shadow-sm active:bg-emerald-700"
          >
            <Text className="text-white font-bold text-lg">
              Add New Measurement
            </Text>
          </TouchableOpacity>
        </View>

        <BottomSheet
          visible={isFormVisible}
          onClose={() => setIsFormVisible(false)}
          title={editingId ? "Edit Measurement" : "Add New Measurement"}
        >
          <InputField
            label="Weight (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            useThousandSeparator
            placeholder="e.g. 70.5"
            className="mb-4"
          />

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <InputField
                label="Fat %"
                value={fatPercentage}
                onChangeText={setFatPercentage}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 15"
              />
            </View>
            <View className="flex-1">
              <InputField
                label="Viceral Fat"
                value={viceralFat}
                onChangeText={setViceralFat}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 5"
              />
            </View>
          </View>

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <InputField
                label="Neck (cm)"
                value={neckCm}
                onChangeText={setNeckCm}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 38"
              />
            </View>
            <View className="flex-1">
              <InputField
                label="Waist (cm)"
                value={waistCm}
                onChangeText={setWaistCm}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 85"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-emerald-600 p-3 rounded-xl items-center shadow-sm active:bg-emerald-700"
          >
            <Text className="text-white font-bold text-lg">
              {editingId ? "Update Measurement" : "Add Measurement"}
            </Text>
          </TouchableOpacity>
        </BottomSheet>

        <BottomSheet
          visible={isFilterVisible}
          onClose={() => setIsFilterVisible(false)}
          title="Filter Measurements"
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

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => {
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
