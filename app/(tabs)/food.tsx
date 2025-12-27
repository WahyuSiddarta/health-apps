import { ScreenWrapper } from "@/components/screen-wrapper";
import { ThemedText } from "@/components/themed-text";
import { InputField } from "@/components/ui/input-field";
import {
  addFood,
  deleteFood,
  FoodRecord,
  getFoodLogs,
} from "@/database/operations";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function FoodScreen() {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [foodLogs, setFoodLogs] = useState<FoodRecord[]>([]);

  const loadFoodLogs = useCallback(() => {
    const data = getFoodLogs();
    setFoodLogs(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFoodLogs();
    }, [loadFoodLogs])
  );

  const handleSubmit = () => {
    if (!name || !calories) {
      Alert.alert("Error", "Please fill in name and calories");
      return;
    }

    try {
      addFood(
        name,
        parseInt(calories),
        protein ? parseInt(protein) : 0,
        carbs ? parseInt(carbs) : 0,
        fat ? parseInt(fat) : 0,
        new Date().toISOString()
      );
      setName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      loadFoodLogs();
      Alert.alert("Success", "Food added successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to add food");
    }
  };

  const handleDelete = (id: number) => {
    try {
      deleteFood(id);
      loadFoodLogs();
    } catch (error) {
      Alert.alert("Error", "Failed to delete food");
    }
  };

  return (
    <ScreenWrapper title="Food">
      <ScrollView className="flex-1 p-4">
        <View className="bg-neutral-900 p-5 rounded-2xl mb-6 border border-neutral-800">
          <ThemedText type="subtitle" className="mb-4">
            Add New Food
          </ThemedText>

          <InputField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Chicken Breast"
            className="mb-4"
          />

          <InputField
            label="Calories"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            useThousandSeparator
            placeholder="e.g. 165"
            className="mb-4"
          />

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <InputField
                label="Protein (g)"
                value={protein}
                onChangeText={setProtein}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 31"
              />
            </View>
            <View className="flex-1">
              <InputField
                label="Carbs (g)"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 0"
              />
            </View>
            <View className="flex-1">
              <InputField
                label="Fat (g)"
                value={fat}
                onChangeText={setFat}
                keyboardType="numeric"
                useThousandSeparator
                placeholder="e.g. 3.6"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-emerald-600 p-3 rounded-xl items-center shadow-sm active:bg-emerald-700"
          >
            <Text className="text-white font-bold text-lg">Add Food</Text>
          </TouchableOpacity>
        </View>

        <ThemedText type="subtitle" className="mb-4">
          Recent Food Logs
        </ThemedText>

        {foodLogs.map((food) => (
          <View
            key={food.id}
            className="bg-neutral-900 p-4 rounded-2xl mb-3 flex-row justify-between items-center border border-neutral-800"
          >
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">{food.name}</Text>
              <Text className="text-neutral-400 mt-1">
                {food.calories} kcal • P: {food.protein}g • C: {food.carbs}g •
                F: {food.fat}g
              </Text>
              <Text className="text-neutral-500 text-xs mt-2">
                {new Date(food.date).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(food.id)}
              className="bg-red-500/10 px-3 py-2 rounded-full ml-2"
            >
              <Text className="text-red-500 font-bold px-2">✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {foodLogs.length === 0 && (
          <Text className="text-neutral-500 text-center mt-8">
            No food logs recorded yet
          </Text>
        )}

        <View className="h-20" />
      </ScrollView>
    </ScreenWrapper>
  );
}
