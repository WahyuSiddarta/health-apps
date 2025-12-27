import { ScreenWrapper } from "@/components/screen-wrapper";
import { ThemedText } from "@/components/themed-text";
import { InputField } from "@/components/ui/input-field";
import {
  addWeight,
  deleteWeight,
  getWeightLogs,
  WeightRecord,
} from "@/database/operations";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function WeightScreen() {
  const [weight, setWeight] = useState("");
  const [weightLogs, setWeightLogs] = useState<WeightRecord[]>([]);

  const loadWeightLogs = useCallback(() => {
    const data = getWeightLogs();
    setWeightLogs(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWeightLogs();
    }, [loadWeightLogs])
  );

  const handleSubmit = () => {
    if (!weight) {
      Alert.alert("Error", "Please enter weight");
      return;
    }

    try {
      addWeight(parseFloat(weight), new Date().toISOString());
      setWeight("");
      loadWeightLogs();
      Alert.alert("Success", "Weight added successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to add weight");
    }
  };

  const handleDelete = (id: number) => {
    try {
      deleteWeight(id);
      loadWeightLogs();
    } catch (error) {
      Alert.alert("Error", "Failed to delete weight");
    }
  };

  return (
    <ScreenWrapper title="Weight">
      <ScrollView className="flex-1 p-4">
        <View className="bg-neutral-900 p-5 rounded-2xl mb-6 border border-neutral-800">
          <ThemedText type="subtitle" className="mb-4">
            Add New Weight
          </ThemedText>

          <InputField
            label="Weight (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            useThousandSeparator
            placeholder="e.g. 70.5"
            className="mb-4"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-emerald-600 p-3 rounded-xl items-center shadow-sm active:bg-emerald-700"
          >
            <Text className="text-white font-bold text-lg">Add Weight</Text>
          </TouchableOpacity>
        </View>

        <ThemedText type="subtitle" className="mb-4">
          Recent Weight Logs
        </ThemedText>

        {weightLogs.map((log) => (
          <View
            key={log.id}
            className="bg-neutral-900 p-4 rounded-2xl mb-3 flex-row justify-between items-center border border-neutral-800"
          >
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">
                {log.value} kg
              </Text>
              <Text className="text-neutral-500 text-xs mt-1">
                {new Date(log.date).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(log.id)}
              className="bg-red-500/10 px-3 py-2 rounded-full ml-2"
            >
              <Text className="text-red-500 font-bold px-2">✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {weightLogs.length === 0 && (
          <Text className="text-neutral-500 text-center mt-8">
            No weight logs recorded yet
          </Text>
        )}

        <View className="h-20" />
      </ScrollView>
    </ScreenWrapper>
  );
}
