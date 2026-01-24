import { ScreenWrapper } from "@/components/screen-wrapper";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { resetAllData } from "@/database/operations";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const [isResetVisible, setIsResetVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleResetData = () => {
    setIsResetVisible(true);
  };

  const handleConfirmReset = () => {
    setIsDeleting(true);
    try {
      resetAllData();
      setIsResetVisible(false);
      setIsDeleting(false);
    } catch (error) {
      setIsDeleting(false);
      console.error("Failed to reset data:", error);
    }
  };

  return (
    <ScreenWrapper title="Settings">
      <View className="flex-1 p-4">
        <View className="overflow-hidden bg-neutral-900 rounded-xl">
          <TouchableOpacity
            onPress={() => router.push("/personal-target")}
            className="flex-row items-center justify-between p-4 border-b bg-neutral-900 border-neutral-800"
          >
            <View className="flex-row items-center gap-3">
              <View className="items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
                <Ionicons name="locate" size={18} color="#10b981" />
              </View>
              <Text className="font-medium text-white">Personal Targets</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#525252" />
          </TouchableOpacity>
        </View>

        <View className="mt-4 overflow-hidden bg-neutral-900 rounded-xl">
          <TouchableOpacity
            onPress={handleResetData}
            className="flex-row items-center justify-between p-4 border-b bg-neutral-900 border-neutral-800"
          >
            <View className="flex-row items-center gap-3">
              <View className="items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
                <Ionicons name="trash" size={18} color="#ef4444" />
              </View>
              <Text className="font-medium text-red-500">Reset All Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#525252" />
          </TouchableOpacity>
        </View>
      </View>

      <BottomSheet
        visible={isResetVisible}
        onClose={() => !isDeleting && setIsResetVisible(false)}
        title="Reset All Data"
      >
        <View className="mb-6">
          <Text className="mb-4 text-neutral-300">
            Are you sure you want to delete all your data? This action cannot be
            undone.
          </Text>
        </View>

        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => setIsResetVisible(false)}
            disabled={isDeleting}
            className="items-center flex-1 p-3 bg-neutral-800 rounded-xl"
          >
            <Text className="font-bold text-white">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirmReset}
            disabled={isDeleting}
            className="items-center flex-1 p-3 bg-red-600 rounded-xl active:bg-red-700"
          >
            <Text className="font-bold text-white">
              {isDeleting ? "Deleting..." : "Delete"}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </ScreenWrapper>
  );
}
