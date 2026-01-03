import { ScreenWrapper } from "@/components/screen-wrapper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();

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
      </View>
    </ScreenWrapper>
  );
}
